import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(">>> [SERVER] Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Uploads will fail.");
}

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Initial bucket setup attempt
if (supabaseAdmin) {
  supabaseAdmin.storage.createBucket('product-images', { public: true })
    .then(({ data, error }) => {
      if (error && error.message !== 'Bucket already exists') {
        console.error(">>> [SERVER] Failed to ensure bucket 'product-images' exists:", error.message);
      } else {
        console.log(">>> [SERVER] Supabase bucket 'product-images' is ready.");
      }
    })
    .catch(err => console.error(">>> [SERVER] Error checking bucket:", err));
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const app = express();
const PORT = 3000;

// 1. Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  if (req.url.startsWith('/api')) {
    console.log(`[${timestamp}] API REQUEST: ${req.method} ${req.url}`);
  }
  next();
});

// 2. CORS
app.use(cors());
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. API Routes
app.all("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    time: new Date().toISOString(),
    supabaseInitialized: !!supabaseAdmin,
    env: {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

const handleUpload = async (req: any, res: any) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] >>> [SERVER] Incoming upload request: ${req.file ? req.file.originalname : 'No file'}`);
  
  try {
    if (!supabaseAdmin) {
      console.error(`[${requestId}] >>> [SERVER] Upload failed: Supabase Admin client not initialized.`);
      return res.status(500).json({ 
        error: "Server configuration error: Supabase Service Role Key missing.",
        tip: "Please ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables."
      });
    }

    if (!req.file) {
      console.error(`[${requestId}] >>> [SERVER] Upload failed: No file found in request`);
      return res.status(400).json({ error: "No file uploaded. Make sure the field name is 'file'." });
    }
    
    const timestamp = Date.now();
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    const filePath = `${timestamp}-${safeName}`;
    const bucketName = 'product-images';
    
    console.log(`[${requestId}] >>> [SERVER] Uploading to Supabase bucket '${bucketName}': ${filePath} (${req.file.mimetype})`);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });
    
    if (uploadError) {
      console.error(`[${requestId}] >>> [SERVER] Supabase Storage Upload Error:`, uploadError);
      return res.status(500).json({ error: `Storage Error: ${uploadError.message}. Ensure the bucket 'product-images' exists and is public.` });
    }

    // Get Public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    console.log(`[${requestId}] >>> [SERVER] SUCCESS: ${publicUrl}`);
    return res.status(200).json({ url: publicUrl });
  } catch (error: any) {
    console.error(`[${requestId}] >>> [SERVER] FATAL UPLOAD ERROR:`, error);
    return res.status(500).json({ error: `Server Upload Error: ${error.message}` });
  }
};

// Diagnostic for 405: Log all methods hitting the upload endpoint
app.all("/api/service/storage/upload", (req, res, next) => {
  console.log(`>>> [SERVER] /api/service/storage/upload hit with method: ${req.method} from ${req.headers.origin}`);
  if (req.method === 'POST') {
    return next();
  }
  res.status(405).json({ 
    error: "Method Not Allowed. Please use POST.",
    receivedMethod: req.method
  });
});

// Main upload routes
app.post("/api/service/storage/upload", upload.single("file"), handleUpload);
app.post("/api/upload", upload.single("file"), handleUpload);
app.post("/upload", upload.single("file"), handleUpload);

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log(">>> [SERVER] Initializing Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      define: {
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
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
  setupVite().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`>>> [SERVER] Running on http://0.0.0.0:${PORT}`);
    });
  });
} else {
  // In production/Vercel, we still need to serve static files if it's hitting the root
  // but Vercel manages the entry point.
  // We'll call setupVite to register the static file handler
  setupVite();
}

export default app;
