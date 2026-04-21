import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { put } from "@vercel/blob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for memory storage with a 10MB limit
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Request Logging Middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  // API routes (Must be BEFORE static/Vite middleware)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vercel Blob Upload Route
  app.post("/api/upload", (req, res, next) => {
    // Add specific logging for upload attempt
    console.log("POST /api/upload - Multipart request received");
    next();
  }, upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        console.error("Upload Error: No file in request. Body:", req.body);
        return res.status(400).json({ error: "No file uploaded. Please ensure the 'file' field is present in the multipart form." });
      }

      console.log(`File received: ${req.file.originalname}, Size: ${req.file.size}, Type: ${req.file.mimetype}`);

      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        console.error("Critical Error: BLOB_READ_WRITE_TOKEN is missing from environment variables!");
        return res.status(500).json({ error: "Backend configuration error: BLOB_READ_WRITE_TOKEN is not set." });
      }

      // Generate a clean filename to avoid bucket issues
      const timestamp = Date.now();
      const cleanName = req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
      const pathname = `products/${timestamp}-${cleanName}`;

      console.log(`Uploading to Vercel Blob: ${pathname}...`);

      const blob = await put(pathname, req.file.buffer, {
        access: "public",
        token: token,
      });

      console.log("Vercel Blob upload success:", blob.url);
      res.json({ url: blob.url });
    } catch (error: any) {
      console.error("Vercel Blob Upload Exception:", error);
      res.status(500).json({ 
        error: error.message || "Internal server error during upload",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Global Error Handler for API routes
  app.use("/api", (err: any, req: any, res: any, next: any) => {
    console.error("Unhandled API Error:", err);
    res.status(500).json({ error: "Internal API Error", details: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        watch: {
          usePolling: true,
          interval: 100
        },
        hmr: false
      },
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

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
