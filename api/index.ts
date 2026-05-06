import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const PORT = 3000;
const BUCKET_NAME = 'product-images';

// Global clients (initialized lazily)
let _supabaseAdmin: any = null;

function getSupabaseAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin;
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    const missing = [];
    if (!supabaseUrl) missing.push("SUPABASE_URL");
    if (!supabaseServiceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    console.warn(`>>> [SERVER] Missing configuration: ${missing.join(", ")}`);
    return null;
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return _supabaseAdmin;
}

// Ensure bucket exists (only runs once or on demand)
let bucketChecked = false;
async function ensureBucket() {
  if (bucketChecked) return;
  const admin = getSupabaseAdmin();
  if (!admin) return;

  try {
    const { error } = await admin.storage.createBucket(BUCKET_NAME, { public: true });
    if (error && error.message !== 'Bucket already exists') {
      console.error(">>> [SERVER] Failed to ensure bucket:", error.message);
    } else {
      console.log(`>>> [SERVER] Supabase bucket '${BUCKET_NAME}' is ready.`);
      bucketChecked = true;
    }
  } catch (err) {
    console.error(">>> [SERVER] Error checking bucket:", err);
  }
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const app = express();

// MIDDLEWARES
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests hitting /api
app.all("/api/*", (req, res, next) => {
  console.log(`>>> [SERVER] API Request: ${req.method} ${req.path}`);
  next();
});

// UPLOAD HANDLER
const handleUpload = async (req: any, res: any) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] >>> [SERVER] Incoming upload request: ${req.file ? req.file.originalname : 'No file'}`);
  
  try {
    const admin = getSupabaseAdmin();
    if (!admin) {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      const missing = [];
      if (!supabaseUrl) missing.push("VITE_SUPABASE_URL");
      if (!supabaseServiceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

      console.error(`[${requestId}] >>> [SERVER] Upload failed: Missing ${missing.join(" and ")}.`);
      return res.status(500).json({ 
        error: `Server configuration error: Missing ${missing.join(" and ")}.`,
        tip: "Please go to the Settings menu (top right) -> Secrets and add these keys."
      });
    }

    if (!req.file) {
      console.error(`[${requestId}] >>> [SERVER] Upload failed: No file found in request`);
      return res.status(400).json({ error: "No file uploaded. Make sure the field name is 'file'." });
    }

    // Ensure bucket exists before upload (lazy)
    await ensureBucket();
    
    const timestamp = Date.now();
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    const filePath = `${timestamp}-${safeName}`;
    
    console.log(`[${requestId}] >>> [SERVER] Uploading to bucket '${BUCKET_NAME}': ${filePath}`);
    
    const { data: uploadData, error: uploadError } = await admin.storage
      .from(BUCKET_NAME)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });
    
    if (uploadError) {
      console.error(`[${requestId}] >>> [SERVER] Supabase Storage Upload Error:`, uploadError);
      return res.status(500).json({ error: `Storage Error: ${uploadError.message}.` });
    }

    const { data: { publicUrl } } = admin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    console.log(`[${requestId}] >>> [SERVER] SUCCESS: ${publicUrl}`);
    return res.status(200).json({ url: publicUrl });
  } catch (error: any) {
    console.error(`[${requestId}] >>> [SERVER] FATAL UPLOAD ERROR:`, error);
    return res.status(500).json({ error: `Server Upload Error: ${error.message}` });
  }
};

// API ROUTES
app.post("/api/service/storage/upload", upload.single("file"), handleUpload);
app.post("/api/upload", upload.single("file"), handleUpload);

app.all("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    version: "3.1.1-debug",
    time: new Date().toISOString(),
    supabaseInitialized: !!getSupabaseAdmin()
  });
});

// Catch-all for unhandled /api routes
app.all("/api/*", (req, res) => {
  console.log(`>>> [SERVER] 404 Unhandled API Request: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: "API route not found", 
    method: req.method,
    path: req.path,
    tip: "Ensure your request matches /api/upload or /api/service/storage/upload"
  });
});

// STARTUP OR SERVERLESS EXPORT
async function initialize() {
  if (process.env.NODE_ENV !== "production") {
    console.log(">>> [SERVER] Local environment detected - initializing Vite...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      define: {
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      }
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`>>> [SERVER] Dev server running on http://0.0.0.0:${PORT}`);
    });
  } else if (!process.env.VERCEL) {
    // Regular production server (dist mode)
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`>>> [SERVER] Production server running on port ${PORT}`);
    });
  }
  // If in Vercel, we don't call app.listen(), just export the app
}

// Initial call for environments where it matters
initialize().catch(err => console.error(">>> [SERVER] Initialization error:", err));

export default app;
