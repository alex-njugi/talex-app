// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem("talex:rememberEmail");
    if (remembered) setEmail(remembered);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    try {
      setLoading(true);
      // Mock auth (replace with real API later)
      await new Promise((r) => setTimeout(r, 600));
      localStorage.setItem(
        "talex:auth",
        JSON.stringify({ email, name: email.split("@")[0] || "User", token: "mock-token" })
      );
      if (remember) localStorage.setItem("talex:rememberEmail", email);
      else localStorage.removeItem("talex:rememberEmail");

      toast.success("Welcome back 👋");
      nav(redirect, { replace: true });
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[78vh] grid place-items-center overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(16,185,129,0.15),transparent),radial-gradient(40%_35%_at_10%_90%,rgba(59,130,246,0.12),transparent)]" />

      <div className="relative w-full max-w-md p-[1.5px] rounded-2xl bg-gradient-to-r from-brand/40 to-brand-dark/20 shadow-[0_24px_60px_-12px_rgba(2,6,23,0.25)]">
        <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/70">
          {/* Header */}
          <div className="px-6 pt-7 text-center">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white font-bold">
              T
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
              Sign in to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
                Talex
              </span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">Welcome back, let’s get you in.</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="px-6 pt-5 pb-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Email</span>
              <div className="relative">
                <input
                  type="email"
                  className="input pr-10"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Password</span>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-brand hover:text-brand-dark hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-xl py-3 inline-flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms and Privacy Policy.
            </div>
          </form>

          {/* Footer actions */}
          <div className="px-6 pb-6 text-center text-sm">
            Don’t have an account?{" "}
            <Link to="/register" className="text-brand hover:text-brand-dark hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
