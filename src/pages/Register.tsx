// src/pages/Register.tsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Phone, User, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Register() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);

  const validEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
  const canSubmit =
    name.trim().length >= 2 &&
    validEmail(email) &&
    pw.length >= 6 &&
    pw === cpw &&
    agree;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please complete all fields correctly");
      return;
    }
    try {
      setLoading(true);
      // Mock registration (swap for real API later)
      await new Promise((r) => setTimeout(r, 700));
      // Persist a simple “session”
      localStorage.setItem(
        "talex:auth",
        JSON.stringify({ name, email, phone, token: "mock-token" })
      );
      toast.success("Account created — welcome 🎉");
      nav(redirect, { replace: true });
    } catch (err: any) {
      toast.error(err?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[82vh] grid place-items-center overflow-hidden">
      {/* Subtle brandy background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(16,185,129,0.14),transparent),radial-gradient(40%_35%_at_10%_90%,rgba(59,130,246,0.1),transparent)]" />

      <div className="relative w-full max-w-xl p-[1.5px] rounded-2xl bg-gradient-to-r from-brand/40 to-brand-dark/20 shadow-[0_24px_60px_-12px_rgba(2,6,23,0.25)]">
        <div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70">
          {/* Header */}
          <div className="px-7 pt-7 text-center">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white font-bold">
              T
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
              Create your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
                Talex
              </span>{" "}
              account
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              It takes less than a minute.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="px-7 pt-6 pb-7 space-y-4">
            {/* Name */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Full name</span>
              <div className="relative">
                <input
                  className="input pr-10"
                  placeholder="e.g. Samuel Doh"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </label>

            {/* Email */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Email</span>
              <div className="relative">
                <input
                  className="input pr-10"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {!validEmail(email) && email.length > 0 && (
                <div className="mt-1 text-xs text-red-600">Enter a valid email address</div>
              )}
            </label>

            {/* Phone (optional but handy for orders) */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Phone (optional)</span>
              <div className="relative">
                <input
                  className="input pr-10"
                  placeholder="07xx xxx xxx"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </label>

            {/* Password */}
            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Password</span>
                <div className="relative">
                  <input
                    className="input pr-10"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
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
                {pw.length > 0 && pw.length < 6 && (
                  <div className="mt-1 text-xs text-red-600">At least 6 characters</div>
                )}
              </label>

              {/* Confirm */}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Confirm password</span>
                <div className="relative">
                  <input
                    className="input pr-10"
                    type={showCpw ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={cpw}
                    onChange={(e) => setCpw(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCpw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100"
                    aria-label={showCpw ? "Hide password" : "Show password"}
                  >
                    {showCpw ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {cpw.length > 0 && pw !== cpw && (
                  <div className="mt-1 text-xs text-red-600">Passwords don’t match</div>
                )}
              </label>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                I agree to the{" "}
                <Link to="/policies/terms" className="text-brand hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/policies/privacy" className="text-brand hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="btn-primary w-full rounded-xl py-3 inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {loading ? "Creating account…" : "Create account"}
            </button>

            <div className="text-xs text-gray-500 text-center">
              We’ll never share your information.
            </div>
          </form>

          {/* Footer actions */}
          <div className="px-7 pb-7 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-brand hover:text-brand-dark hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
