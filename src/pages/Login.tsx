import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, PenTool, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Logged in user:", user.email);

      // Create profile if it doesn't exist
      const profileRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          name: user.displayName,
          email: user.email,
          role: user.email === 'storesnilesh@gmail.com' ? 'admin' : 'customer',
          createdAt: new Date().toISOString()
        });
      }

      toast.success('Welcome back to Nilesh Store!');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Login error details:", error);
      let message = 'Unable to authenticate with Google. Please try again.';
      
      if (error.code === 'auth/popup-blocked') {
        message = 'The login popup was blocked. Please allow popups for this site.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = 'The login attempt was interrupted.';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Google Sign-In is not enabled in the Firebase console. Please check your settings.';
      } else if (error.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized in Firebase. Please add this URL to the "Authorized domains" list in your Firebase Console (Authentication > Settings).';
      } else if (error.message) {
        message = `Auth Error: ${error.message}`;
      }
      
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-[90vh] flex items-center justify-center bg-zinc-50/50">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-zinc-100 flex flex-col items-center">
          <div className="h-20 w-48 flex items-center justify-center mb-8 relative">
            <img 
              src="https://zej6lpqs5vbuobbb.public.blob.vercel-storage.com/pomelli_photoshoot_image_1_1_0420-removebg-preview.png" 
              alt="Logo" 
              className="h-full w-full object-contain relative z-10"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-text')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'fallback-text flex flex-col items-center justify-center';
                  fallback.innerHTML = '<span class="text-indigo-600 font-black italic text-4xl">NILESH</span><span class="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-300 mt-1">STORES</span>';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
          
          <div className="text-center space-y-3 mb-12">
            <h1 className="text-4xl font-black tracking-tighter leading-none italic uppercase">Unlock Your <span className="text-zinc-300">Space</span></h1>
            <p className="text-sm font-medium text-zinc-500">Sign in to sync your creative basket & orders.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 mb-8"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </motion.div>
          )}

          <div className="w-full space-y-4">
            <Button 
              size="lg" 
              className="w-full h-16 rounded-2xl bg-white text-zinc-900 border-2 border-zinc-50 hover:bg-zinc-50 hover:border-zinc-100 transition-all font-black text-sm flex items-center justify-center gap-4 shadow-sm"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Opening Portal...' : 'Continue with Google'}
            </Button>
            
            <div className="relative py-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100" /></div>
              <span className="relative px-4 bg-white text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Inspire</span>
            </div>

            <p className="text-[10px] text-center text-zinc-400 font-medium leading-relaxed max-w-[280px] mx-auto uppercase tracking-widest">
              By entering our store, you agree to our <Link to="/terms" className="text-zinc-900 underline decoration-primary/20">Terms</Link> and <Link to="/privacy" className="text-zinc-900 underline decoration-primary/20">Privacy Guidelines</Link>.
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-12 text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Secure Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Authentic Tools</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Creative Sync</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
