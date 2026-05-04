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
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request Logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // API Routes
  const apiRouter = express.Router();

  apiRouter.get("/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN
      }
    });
  });

  // Simplified upload route
  apiRouter.post("/upload", upload.single("file"), async (req: any, res) => {
    console.log("POST /api/upload reached");
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        console.error("Missing BLOB_READ_WRITE_TOKEN");
        return res.status(500).json({ error: "Server configuration error" });
      }

      const filename = `products/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      
      const blob = await put(filename, req.file.buffer, {
        access: "public",
        token: token,
      });

      console.log("Upload success:", blob.url);
      res.json({ url: blob.url });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.use("/api", apiRouter);

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
