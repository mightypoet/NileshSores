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
  const app = express();
  const PORT = 3000;

  // 1. Logging Middleware (MUST BE FIRST)
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    if (req.method === 'POST') {
      console.log(`[${timestamp}] Content-Type: ${req.headers['content-type']}`);
    }
    next();
  });

  // 2. CORS
  app.use(cors());
  app.options("*", cors());

  // 3. API Routes - Defined BEFORE any other middleware or Vite
  // Root health check to verify server is alive
  app.get("/healthz", (req, res) => {
    res.json({ 
      status: "alive", 
      time: new Date().toISOString(),
      blobToken: !!process.env.BLOB_READ_WRITE_TOKEN
    });
  });

  // CRITICAL: Dedicated Upload Route (moved to top and using unique name)
  const handleUpload = async (req: any, res: any) => {
    console.log(`[${new Date().toISOString()}] UPLOAD PROCESSING STARTED`);
    try {
      if (!req.file) {
        console.error("No file received by Multer");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        console.error("Missing BLOB_READ_WRITE_TOKEN");
        return res.status(500).json({ error: "Server configuration missing: BLOB_READ_WRITE_TOKEN" });
      }

      const filename = `uploads/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      console.log(`Uploading to Vercel Blob: ${filename}`);
      
      const blob = await put(filename, req.file.buffer, {
        access: "public",
        token: token,
      });

      console.log(`Upload Success: ${blob.url}`);
      res.json({ url: blob.url });
    } catch (error: any) {
      console.error("Upload handler exception:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // Multiple paths including the one from dataService
  app.post("/upload", upload.single("file"), handleUpload);
  app.post("/api/upload", upload.single("file"), handleUpload);
  app.post("/api/v1/upload", upload.single("file"), handleUpload);

  // JSON Body Parser for other routes
  app.use(express.json());
  
  // Test route to check if API is working
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working correctly" });
  });

  // Catch-all for /api before Vite
  app.all("/api/*", (req, res) => {
    console.log(`Missed API route: ${req.method} ${req.url}`);
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found on server` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
