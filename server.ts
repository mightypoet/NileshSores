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

  // Middleware
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request Logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} (Path: ${req.path})`);
    next();
  });

  // API Routes - Define them directly on the app instance for maximum clarity
  app.get("/api/health", (req, res) => {
    console.log("Health check hit");
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN
      }
    });
  });

  // Simplified upload route directly on app
  app.get("/api/upload", (req, res) => {
    res.json({ message: "Upload endpoint exists. Please use POST to upload files." });
  });

  app.post("/api/upload", upload.single("file"), async (req: any, res) => {
    console.log(`POST /api/upload reached - File: ${req.file?.originalname}`);
    try {
      if (!req.file) {
        console.error("No file in request");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        console.error("Missing BLOB_READ_WRITE_TOKEN");
        return res.status(500).json({ error: "Server configuration error: Token missing" });
      }

      const filename = `products/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      
      console.log(`Uploading ${filename} to Vercel Blob...`);
      const blob = await put(filename, req.file.buffer, {
        access: "public",
        token: token,
      });

      console.log("Upload success:", blob.url);
      res.json({ url: blob.url });
    } catch (error: any) {
      console.error("Upload handler exception:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Explicitly handle 404 for any other /api routes to prevent falling through to Vite
  app.all("/api/*", (req, res) => {
    console.log(`Unmatched API route: ${req.method} ${req.url}`);
    res.status(404).json({ error: "API route not found" });
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
