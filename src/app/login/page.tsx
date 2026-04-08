"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, Loader, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Success: Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/student");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const isFormValid = username.length > 0 && password.length > 0;

  return (
    <div className="min-h-screen w-full flex bg-background font-sans transition-colors duration-300">
      
      {/* ─── LEFT SIDE: Branding / Landing ─── */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0a0a0a] overflow-hidden flex-col justify-between p-6 lg:p-8 text-white">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">Ajinora</span>
        </div>

        {/* Main Landing Copy */}
        <div className="relative z-10 my-auto pt-2">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-widest text-white">
            Next-Gen Learning
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
            Empowering the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">minds of tomorrow</span>
          </h1>
          <p className="text-lg text-white/60 max-w-md leading-relaxed font-medium mb-4">
            A limitless educational ecosystem combining intelligent tools, interactive curriculums, and seamless performance tracking
          </p>

          <div className="space-y-3">
            {[
               "World-class modular curriculum",
               "Real-time analytics and tracking",
               "Seamless institutional integration"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-white/80 animate-in slide-in-from-left-4 duration-700" style={{ animationDelay: `${i * 150}ms`, animationFillMode: "both" }}>
                 <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <CheckCircle2 size={14} />
                 </div>
                 <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Testimonial / Copyright */}
        <div className="relative z-10 border-t border-white/10 pt-4 mt-6 grid grid-cols-2 gap-8 items-end">
           <div>
             <p className="text-sm italic text-white/60 leading-relaxed mb-4">
               "Ajinora entirely revolutionized how our institution distributes digital learning."
             </p>
             <p className="text-xs font-bold uppercase tracking-wider text-white/90">Sarah Jenkins</p>
             <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">Dean of Academics</p>
           </div>
           <div className="flex flex-col justify-end text-right">
             <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">© 2026 Ajinora Infrastructure.</p>
           </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Login Form ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f8f9fb] dark:bg-background relative p-2 sm:p-4 overflow-y-auto">
        {/* Mobile only logo */}
        <div className="absolute top-4 left-6 lg:hidden flex items-center gap-3">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
          </div>
          <span className="text-xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">Ajinora</span>
        </div>

        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-4 text-center lg:text-left mt-2 lg:mt-0">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-foreground mb-1">Welcome Back</h2>
            <p className="text-[14px] text-gray-500 dark:text-muted-foreground">Please sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            {/* Username/Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="username">Username/Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors">
                  <User size={18} />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-border/60 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-muted/30 hover:border-gray-300 dark:hover:bg-muted/50 focus:bg-white dark:focus:bg-card text-foreground shadow-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
                 <a href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Forgot Password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-primary dark:group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-border/60 rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-muted/30 hover:border-gray-300 dark:hover:bg-muted/50 focus:bg-white dark:focus:bg-card text-foreground shadow-sm"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
            </div>

            <div className="flex items-center">
               <input
                 id="remember-me"
                 name="remember-me"
                 type="checkbox"
                 checked={rememberMe}
                 onChange={(e) => setRememberMe(e.target.checked)}
                 className="h-4 w-4 text-primary focus:ring-primary/30 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-transparent transition-colors cursor-pointer"
               />
               <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 select-none cursor-pointer">
                 Remember me
               </label>
            </div>

            <div className="pt-0.5">
              <Button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full justify-center h-[44px] border border-transparent rounded-xl shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] dark:shadow-none text-[15px] font-semibold text-white bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] group flex items-center gap-2"
              >
                {loading ? (
                  <Loader className="animate-spin w-5 h-5 text-white" />
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-border/60" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#f8f9fb] dark:bg-background text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider">Or</span>
              </div>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <button
                 type="button"
                 className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 dark:border-border/60 rounded-xl bg-white dark:bg-card shadow-[0_2px_10px_0_rgb(0,0,0,0.02)] text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 transition-all active:scale-[0.98]"
              >
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
                 Google
              </button>
              <button
                 type="button"
                 className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 dark:border-border/60 rounded-xl bg-white dark:bg-card shadow-[0_2px_10px_0_rgb(0,0,0,0.02)] text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 transition-all active:scale-[0.98]"
              >
                 <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                 </svg>
                 Facebook
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
