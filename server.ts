import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { put } from "@vercel/blob";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const app = express();
const PORT = 3000;

async function setupApp() {
  console.log(">>> [SERVER] Setting up routes...");

  // 1. Logging Middleware (MUST BE FIRST)
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] REQUEST: ${req.method} ${req.url}`);
    next();
  });

  // 2. CORS
  app.use(cors());
  app.options("*", cors());

  // 3. API Routes
  app.all("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  const handleUpload = async (req: any, res: any) => {
    console.log(`>>> [SERVER] Incoming upload request: ${req.file ? req.file.originalname : 'No file'}`);
    try {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error(">>> [SERVER] Upload failed: BLOB_READ_WRITE_TOKEN is missing");
        return res.status(500).json({ error: "Server configuration error: Upload token missing." });
      }

      if (!req.file) {
        console.error(">>> [SERVER] Upload failed: No file found in request");
        return res.status(400).json({ error: "No file uploaded. Make sure the field name is 'file'." });
      }
      
      const timestamp = Date.now();
      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
      const filename = `uploads/${timestamp}-${safeName}`;
      
      console.log(`>>> [SERVER] Uploading: ${filename} (${req.file.mimetype})`);
      
      const blob = await put(filename, req.file.buffer, { 
        access: "public", 
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: req.file.mimetype
      });
      
      console.log(`>>> [SERVER] SUCCESS: ${blob.url}`);
      return res.status(200).json({ url: blob.url });
    } catch (error: any) {
      console.error(">>> [SERVER] FATAL UPLOAD ERROR:", error);
      return res.status(500).json({ error: `Server Upload Error: ${error.message}` });
    }
  };

  // Use multiple variants for maximum compatibility
  app.post("/api/storage/v2/upload", upload.single("file"), handleUpload);
  app.post("/api/storage/v1/upload", upload.single("file"), handleUpload);
  app.post("/api/v1/storage/upload", upload.single("file"), handleUpload);
  
  // Explicitly handle all methods for /api/upload to diagnose 405s
  app.all("/api/upload", (req, res, next) => {
    console.log(`>>> [SERVER] /api/upload hit with method: ${req.method}`);
    if (req.method === 'POST') {
      next();
    } else {
      res.status(405).json({ 
        error: "Method Not Allowed. Please use POST.",
        receivedMethod: req.method
      });
    }
  });
  app.post("/api/upload", upload.single("file"), handleUpload);
  app.post("/upload", upload.single("file"), handleUpload);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 4. Vite / Static
  if (process.env.NODE_ENV !== "production") {
    console.log(">>> [SERVER] Initializing Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      define: {
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
        'import.meta.env.BLOB_READ_WRITE_TOKEN': JSON.stringify(process.env.BLOB_READ_WRITE_TOKEN)
      }
    });
    console.log(">>> [SERVER] Vite initialized successfully.");
    app.use(vite.middlewares);
  } else {
    console.log(">>> [SERVER] Production mode - serving static files.");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// Start the server if running directly
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  setupApp().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`>>> [SERVER] Running on http://0.0.0.0:${PORT}`);
    });
  });
}

// Export for Vercel
setupApp();
export default app;
