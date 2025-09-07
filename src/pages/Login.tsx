// src/pages/Login.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, AlertTriangle, X, ChevronLeft } from "lucide-react";
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
  const [caps, setCaps] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [banner, setBanner] = useState<string>("");     // top inline error banner
  const [btnWarn, setBtnWarn] = useState(false);        // brief visual nudge on button

  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const remembered = localStorage.getItem("talex:rememberEmail");
    if (remembered) setEmail(remembered);
  }, []);

  const emailErr = useMemo(() => {
    if (!touched.email) return "";
    if (!email) return "Email is required";
    if (!/^\S+@\S+\.\S{2,}$/.test(email)) return "Enter a valid email address";
    return "";
  }, [email, touched.email]);

  const pwErr = useMemo(() => {
    if (!touched.password) return "";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  }, [password, touched.password]);

  const blocked = loading || !!emailErr || !!pwErr || !email || !password;

  const focusFirstError = () => {
    if (!email || emailErr) {
      emailRef.current?.focus();
      return;
    }
    if (!password || pwErr) {
      pwRef.current?.focus();
      return;
    }
  };

  const nudgeButton = () => {
    setBtnWarn(true);
    setTimeout(() => setBtnWarn(false), 450);
  };

  const handlePrimaryClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    if (blocked) {
      e.preventDefault();
      setTouched({ email: true, password: true });
      setBanner("Please fix the highlighted fields to continue.");
      focusFirstError();
      nudgeButton();
      return;
    }
    // valid -> submit form programmatically
    setBanner("");
    formRef.current?.requestSubmit();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked) return; // safety
    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 650)); // mock
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
    <section className="relative min-h-[100dvh] grid place-items-center overflow-hidden">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(99,102,241,0.10),transparent),radial-gradient(45%_35%_at_10%_90%,rgba(16,185,129,0.10),transparent)]" />

      {/* Top mobile bar (back / close) */}
      <div className="absolute top-3 inset-x-0 px-4 flex items-center justify-between sm:justify-end">
        <button
          onClick={() => (history.length > 1 ? history.back() : nav("/"))}
          className="inline-flex items-center gap-1 rounded-xl bg-white/70 backdrop-blur px-3 py-2 text-sm text-gray-700 border hover:bg-white sm:hidden"
          aria-label="Go back"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={() => nav("/")}
          className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-white/70 backdrop-blur px-3 py-2 text-sm text-gray-700 border hover:bg-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      {/* Card / Sheet */}
      <div className="relative w-full max-w-lg sm:max-w-md px-4 sm:px-0">
        <div className="p-[1.5px] rounded-3xl bg-gradient-to-r from-brand/40 to-brand-dark/20 shadow-[0_24px_60px_-12px_rgba(2,6,23,0.30)]">
          <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70">
            {/* Header */}
            <div className="px-5 sm:px-6 pt-6 sm:pt-7 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white font-bold">
                T
              </div>
              <h1 className="mt-3 text-2xl sm:text-2xl font-extrabold tracking-tight">
                Sign in to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
                  Talex
                </span>
              </h1>
              <p className="mt-1 text-sm text-gray-600">Welcome back — let’s get you in.</p>
            </div>

            {/* Inline banner (aria-live) */}
            <div aria-live="polite" className="px-5 sm:px-6">
              {banner && (
                <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-2 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{banner}</span>
                </div>
              )}
            </div>

            {/* Form */}
            <form ref={formRef} onSubmit={onSubmit} className="px-5 sm:px-6 pt-2 pb-6 space-y-4">
              {/* Email */}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Email</span>
                <div className="relative">
                  <input
                    ref={emailRef}
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className={`input h-12 text-base pr-11 ${emailErr ? "ring-1 ring-red-300 focus:ring-red-400" : ""}`}
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onBlur={() => setTouched((s) => ({ ...s, email: true }))}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-invalid={!!emailErr}
                    aria-describedby={emailErr ? "login-email-error" : undefined}
                  />
                  <Mail className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {emailErr && (
                  <p id="login-email-error" className="mt-1.5 text-xs text-red-600">
                    {emailErr}
                  </p>
                )}
              </label>

              {/* Password */}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Password</span>
                <div className="relative">
                  <input
                    ref={pwRef}
                    type={showPw ? "text" : "password"}
                    className={`input h-12 text-base pr-11 ${pwErr ? "ring-1 ring-red-300 focus:ring-red-400" : ""}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onBlur={() => setTouched((s) => ({ ...s, password: true }))}
                    onKeyUp={(e) => setCaps(e.getModifierState && e.getModifierState("CapsLock"))}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-invalid={!!pwErr}
                    aria-describedby={pwErr ? "login-password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-gray-100"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                {(pwErr || caps) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {caps && (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-700 px-2.5 py-1 text-[11px]">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Caps Lock is ON
                      </span>
                    )}
                    {pwErr && (
                      <p id="login-password-error" className="text-xs text-red-600">
                        {pwErr}
                      </p>
                    )}
                  </div>
                )}
              </label>

              {/* Row: remember + forgot */}
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 active:opacity-90">
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

              {/* Submit (managed click for better UX) */}
              <button
                type="button"
                aria-disabled={blocked}
                onClick={handlePrimaryClick}
                className={`btn-primary w-full rounded-xl py-3.5 text-base inline-flex items-center justify-center gap-2 transition-shadow ${
                  blocked ? "opacity-90" : ""
                } ${btnWarn ? "ring-2 ring-red-300" : ""}`}
              >
                {loading ? (
                  <>
                    <span className="inline-block h-5 w-5 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Sign in
                  </>
                )}
              </button>

              {/* Secondary actions */}
              <div className="text-center">
                <Link
                  to="/"
                  className="inline-block text-sm text-gray-600 hover:text-gray-800 hover:underline"
                >
                  Continue as guest
                </Link>
              </div>

              <div className="text-xs text-gray-500 text-center">
                By continuing, you agree to our Terms and Privacy Policy.
              </div>
            </form>

            {/* Footer actions */}
            <div className="px-5 sm:px-6 pb-6 text-center text-sm">
              Don’t have an account?{" "}
              <Link to="/register" className="text-brand hover:text-brand-dark hover:underline">
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
