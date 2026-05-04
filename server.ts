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

async function startServer() {
  console.log(">>> [SERVER] Starting boot sequence...");
  const app = express();
  const PORT = 3000;

  try {
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
    app.get("/healthz", (req, res) => {
      res.json({ status: "alive" });
    });

    const handleUpload = async (req: any, res: any) => {
      console.log(`>>> [SERVER] Incoming upload request: ${req.file ? req.file.originalname : 'No file'}`);
      try {
        if (!req.file) {
          console.error(">>> [SERVER] Upload failed: No file found in request");
          return res.status(400).json({ error: "No file uploaded. Make sure the field name is 'file'." });
        }
        
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        if (!token) {
          console.error(">>> [SERVER] Upload failed: BLOB_READ_WRITE_TOKEN is missing");
          return res.status(500).json({ error: "Server configuration error: Upload token missing." });
        }

        const filename = `uploads/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        console.log(`>>> [SERVER] Attempting upload to Vercel Blob: ${filename}`);
        
        const blob = await put(filename, req.file.buffer, { 
          access: "public", 
          token: token,
          contentType: req.file.mimetype
        });
        
        console.log(`>>> [SERVER] Upload successful: ${blob.url}`);
        res.json({ url: blob.url });
      } catch (error: any) {
        console.error(">>> [SERVER] Upload error:", error);
        res.status(500).json({ error: `Upload process failed: ${error.message}` });
      }
    };

    // Use a very specific route to avoid any Vite conflicts
    app.post("/api/v1/storage/upload", upload.single("file"), handleUpload);
    
    // Legacy routes for compatibility
    app.post("/api/file-upload", upload.single("file"), handleUpload);
    app.post("/upload", upload.single("file"), handleUpload);
    app.post("/api/upload", upload.single("file"), handleUpload);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.all("/api/*", (req, res) => {
      res.status(404).json({ error: "NotFound" });
    });

    // 4. Vite / Static
    if (process.env.NODE_ENV !== "production") {
      console.log(">>> [SERVER] Initializing Vite in middleware mode...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
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

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`>>> [SERVER] Running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error(">>> [SERVER] FATAL STARTUP ERROR:", err);
    process.exit(1);
  }
}

startServer().catch(console.error);
