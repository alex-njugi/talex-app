// src/pages/Register.tsx
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye, EyeOff, Mail, Phone, User, CheckCircle2,
  AlertTriangle, X, ChevronLeft, Check, Info
} from "lucide-react";
import toast from "react-hot-toast";

export default function Register() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // optional, KE-friendly formatting
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [caps, setCaps] = useState(false);

  // UX helpers
  const [touched, setTouched] = useState<{
    name?: boolean; email?: boolean; phone?: boolean; pw?: boolean; cpw?: boolean; agree?: boolean
  }>({});
  const [banner, setBanner] = useState<string>("");
  const [btnWarn, setBtnWarn] = useState(false);

  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const cpwRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const validEmail = (v: string) => /^\S+@\S+\.\S{2,}$/.test(v);

  // phone helpers (format to 07xx xxx xxx)
  const normalizePhone = (v: string) => v.replace(/\D/g, "");
  const formatPhoneKE = (v: string) => {
    let d = normalizePhone(v);
    if (d.startsWith("254")) d = "0" + d.slice(3);
    if (d.startsWith("7")) d = "0" + d;
    d = d.slice(0, 10);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}${d.slice(2) ? " " + d.slice(2) : ""}`;
    if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4)}`;
    return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  };
  const validPhone = (v: string) => {
    const d = normalizePhone(v);
    return v === "" || (d.length === 10 && d.startsWith("0"));
  };

  // errors
  const nameErr = useMemo(() => {
    if (!touched.name) return "";
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Enter at least 2 characters";
    return "";
  }, [name, touched.name]);

  const emailErr = useMemo(() => {
    if (!touched.email) return "";
    if (!email) return "Email is required";
    if (!validEmail(email)) return "Enter a valid email address";
    return "";
  }, [email, touched.email]);

  const phoneErr = useMemo(() => {
    if (!touched.phone) return "";
    if (!validPhone(phone)) return "Enter a valid phone like 07xx xxx xxx";
    return "";
  }, [phone, touched.phone]);

  const pwErr = useMemo(() => {
    if (!touched.pw) return "";
    if (!pw) return "Password is required";
    if (pw.length < 6) return "At least 6 characters";
    return "";
  }, [pw, touched.pw]);

  const cpwErr = useMemo(() => {
    if (!touched.cpw) return "";
    if (!cpw) return "Please confirm your password";
    if (pw !== cpw) return "Passwords don’t match";
    return "";
  }, [pw, cpw, touched.cpw]);

  const agreeErr = useMemo(() => {
    if (!touched.agree) return "";
    if (!agree) return "You must accept the Terms & Privacy Policy";
    return "";
  }, [agree, touched.agree]);

  // password checks
  const ruleLen = pw.length >= 6;
  const ruleNum = /[0-9]/.test(pw);
  const ruleCaseOrSym = /[A-Z]/.test(pw) || /[^A-Za-z0-9]/.test(pw);
  const pwStrength = (ruleLen ? 1 : 0) + (ruleNum ? 1 : 0) + (ruleCaseOrSym ? 1 : 0);
  const strengthLabel = ["Very weak", "Weak", "Okay", "Strong"][pwStrength];
  const strengthClass = ["bg-red-300", "bg-amber-300", "bg-yellow-400", "bg-emerald-400"][pwStrength];

  const blocked =
    loading ||
    !!nameErr || !!emailErr || !!phoneErr || !!pwErr || !!cpwErr || !!agreeErr ||
    !name || !email || !pw || !cpw || !agree ||
    !validPhone(phone) || !validEmail(email) || pw !== cpw || pw.length < 6;

  const focusFirstError = () => {
    if (!name || nameErr) return nameRef.current?.focus();
    if (!email || emailErr) return emailRef.current?.focus();
    if (!pw || pwErr) return pwRef.current?.focus();
    if (!cpw || cpwErr) return cpwRef.current?.focus();
  };

  const nudgeButton = () => {
    setBtnWarn(true);
    setTimeout(() => setBtnWarn(false), 450);
  };

  const handlePrimaryClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    if (blocked) {
      e.preventDefault();
      setTouched({ name: true, email: true, phone: true, pw: true, cpw: true, agree: true });
      setBanner("Please fix the highlighted fields to continue.");
      focusFirstError();
      nudgeButton();
      return;
    }
    setBanner("");
    formRef.current?.requestSubmit();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked) return;
    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 700)); // mock
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
    <section
      className="
        relative
        bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(16,185,129,0.16),transparent),radial-gradient(40%_35%_at_10%_90%,rgba(59,130,246,0.14),transparent)]
        min-h-[100dvh]
        pt-24 md:pt-32
        pb-24 md:pb-36
      "
    >
      {/* Top mobile controls */}
      <div className="absolute top-4 inset-x-0 px-5 flex items-center justify-between md:justify-end">
        <button
          onClick={() => (history.length > 1 ? history.back() : nav("/"))}
          className="md:hidden inline-flex items-center gap-1.5 rounded-2xl bg-white/90 backdrop-blur px-3.5 py-2.5 text-sm text-gray-800 border hover:bg-white"
          aria-label="Go back"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={() => nav("/")}
          className="hidden md:inline-flex items-center gap-1.5 rounded-2xl bg-white/90 backdrop-blur px-3.5 py-2.5 text-sm text-gray-800 border hover:bg-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      {/* Content container with real air */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left brand panel (desktop only) */}
          <aside className="hidden md:block md:col-span-6 lg:col-span-7">
            <div className="rounded-[26px] border border-white/70 bg-white/70 backdrop-blur-xl p-8 lg:p-10 shadow-[0_28px_64px_-16px_rgba(2,6,23,0.20)]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white font-bold">
                T
              </div>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight">
                Create your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
                  Talex
                </span>{" "}
                account
              </h1>
              <p className="mt-2 text-gray-700 max-w-prose">
                Checkout faster, track orders easily, and get helpful updates.
              </p>

              <ul className="mt-6 space-y-3 text-gray-700">
                <li className="flex gap-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                  Secure, M-Pesa-ready checkout
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-sky-500" />
                  Order history & quick re-order
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500" />
                  Delivery notifications
                </li>
              </ul>

              <div className="mt-8 overflow-hidden rounded-2xl border bg-white/80">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80"
                  alt="Talex automotive"
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </aside>

          {/* Right: form card (sticky on desktop) */}
          <div className="md:col-span-6 lg:col-span-5 md:sticky md:top-24">
            <div className="p-[2px] rounded-[28px] bg-gradient-to-r from-brand/45 to-brand-dark/25 shadow-[0_28px_64px_-16px_rgba(2,6,23,0.30)]">
              <div className="rounded-[26px] bg-white/90 backdrop-blur-xl border border-white/80">
                {/* Mobile header inside card */}
                <div className="md:hidden px-6 pt-7 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white font-bold">
                    T
                  </div>
                  <h2 className="mt-3 text-[22px] font-extrabold tracking-tight">
                    Create your{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">
                      Talex
                    </span>{" "}
                    account
                  </h2>
                  <p className="mt-1 text-[13px] text-gray-600">It takes less than a minute.</p>
                </div>

                {/* Inline banner */}
                <div aria-live="polite" className="px-6 md:px-7">
                  {banner && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{banner}</span>
                    </div>
                  )}
                </div>

                {/* Form */}
                <form ref={formRef} onSubmit={onSubmit} className="px-6 md:px-7 pt-5 pb-7 space-y-7">
                  {/* Your details */}
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-gray-900">Your details</h3>

                    {/* Name */}
                    <label className="block space-y-2">
                      <span className="block text-sm font-medium text-gray-700">Full name</span>
                      <div className="relative">
                        <input
                          ref={nameRef}
                          className={`input h-12 text-[15px] pr-12 ${nameErr ? "ring-1 ring-red-300 focus:ring-red-400" : ""}`}
                          placeholder="e.g. Samuel Doh"
                          autoComplete="name"
                          value={name}
                          onBlur={() => setTouched(s => ({ ...s, name: true }))}
                          onChange={(e) => setName(e.target.value)}
                          required
                          aria-invalid={!!nameErr}
                          aria-describedby={nameErr ? "name-err" : "name-hint"}
                        />
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {nameErr ? (
                        <div id="name-err" className="text-xs text-red-600">{nameErr}</div>
                      ) : (
                        <div id="name-hint" className="text-xs text-gray-500">Use your real name for delivery.</div>
                      )}
                    </label>

                    {/* Email */}
                    <label className="block space-y-2">
                      <span className="block text-sm font-medium text-gray-700">Email</span>
                      <div className="relative">
                        <input
                          ref={emailRef}
                          className={`input h-12 text-[15px] pr-12 ${emailErr ? "ring-1 ring-red-300 focus:ring-red-400" : ""}`}
                          type="email"
                          inputMode="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          placeholder="you@example.com"
                          autoComplete="email"
                          value={email}
                          onBlur={() => setTouched(s => ({ ...s, email: true }))}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          aria-invalid={!!emailErr}
                          aria-describedby={emailErr ? "email-err" : "email-hint"}
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {emailErr ? (
                        <div id="email-err" className="text-xs text-red-600">{emailErr}</div>
                      ) : (
                        <div id="email-hint" className="text-xs text-gray-500">We’ll send order receipts to this email.</div>
                      )}
                    </label>

                    {/* Phone (optional) */}
                    <label className="block space-y-2">
                      <span className="block text-sm font-medium text-gray-700">Phone (optional)</span>
                      <div className="relative">
                        <input
                          className={`input h-12 text-[15px] pr-12 ${phoneErr ? "ring-1 ring-red-300 focus:ring-red-400" : ""}`}
                          placeholder="07xx xxx xxx"
                          inputMode="tel"
                          autoComplete="tel"
                          value={phone}
                          onBlur={() => setTouched(s => ({ ...s, phone: true }))}
                          onChange={(e) => setPhone(formatPhoneKE(e.target.value))}
                          aria-invalid={!!phoneErr}
                          aria-describedby={phoneErr ? "phone-err" : "phone-hint"}
                        />
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {phoneErr ? (
                        <div id="phone-err" className="text-xs text-red-600">{phoneErr}</div>
                      ) : (
                        <div id="phone-hint" className="text-xs text-gray-500">Delivery updates only. No spam.</div>
                      )}
                    </label>
                  </div>

                  <div className="h-px bg-gray-200/70" />

                  {/* Security */}
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold text-gray-900">Security</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Password */}
                      <label className="block space-y-2">
                        <span className="block text-sm font-medium text-gray-700">Password</span>
                        <div className="relative">
                          <input
                            ref={pwRef}
                            className={`input h-12 text-[15px] pr-12 ${pwErr ? "ring-1 ring-red-300 focus:ring-red-400" : ""}`}
                            type={showPw ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            value={pw}
                            onBlur={() => setTouched(s => ({ ...s, pw: true }))}
                            onKeyUp={(e) => setCaps((e as React.KeyboardEvent<HTMLInputElement>).getModifierState?.("CapsLock") ?? false)}
                            onChange={(e) => setPw(e.target.value)}
                            required
                            aria-invalid={!!pwErr}
                            aria-describedby={pwErr ? "pw-err" : undefined}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(s => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-gray-100"
                            aria-label={showPw ? "Hide password" : "Show password"}
                          >
                            {showPw ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                          </button>
                        </div>

                        {(pw || touched.pw) && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {[0,1,2].map((bar) => (
                                  <span
                                    key={bar}
                                    className={`h-1.5 w-10 rounded ${bar < pwStrength ? strengthClass : "bg-gray-200"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-600">{strengthLabel}</span>
                              {caps && (
                                <span className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px]">
                                  <Info className="h-3.5 w-3.5" />
                                  Caps Lock is ON
                                </span>
                              )}
                            </div>
                            <ul className="text-[11px] text-gray-600 grid grid-cols-3 gap-2">
                              <PwRule ok={pw.length >= 6} text="≥ 6 chars" />
                              <PwRule ok={/[0-9]/.test(pw)} text="Number" />
                              <PwRule ok={/[A-Z]/.test(pw) || /[^A-Za-z0-9]/.test(pw)} text="Upper/Symbol" />
                            </ul>
                          </div>
                        )}
                        {pwErr && <div id="pw-err" className="text-xs text-red-600">{pwErr}</div>}
                      </label>

                      {/* Confirm */}
                      <label className="block space-y-2">
                        <span className="block text-sm font-medium text-gray-700">Confirm password</span>
                        <div className="relative">
                          <input
                            ref={cpwRef}
                            className={`input h-12 text-[15px] pr-12 ${cpwErr ? "ring-1 ring-red-300 focus:ring-red-400" : ""}`}
                            type={showCpw ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            value={cpw}
                            onBlur={() => setTouched(s => ({ ...s, cpw: true }))}
                            onChange={(e) => setCpw(e.target.value)}
                            required
                            aria-invalid={!!cpwErr}
                            aria-describedby={cpwErr ? "cpw-err" : "cpw-hint"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCpw(s => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-gray-100"
                            aria-label={showCpw ? "Hide password" : "Show password"}
                          >
                            {showCpw ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                          </button>
                        </div>
                        {cpwErr ? (
                          <div id="cpw-err" className="text-xs text-red-600">{cpwErr}</div>
                        ) : (
                          <div id="cpw-hint" className="text-xs text-gray-500">Re-enter your password to confirm.</div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200/70" />

                  {/* Terms */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">Terms</h3>
                    <label className="flex items-start gap-3 text-[13px] text-gray-700 leading-relaxed">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-5 w-5 rounded border-gray-300"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        onBlur={() => setTouched(s => ({ ...s, agree: true }))}
                        aria-invalid={!!agreeErr}
                      />
                      <span>
                        I agree to the{" "}
                        <Link to="/policies/terms" className="text-brand hover:underline">Terms</Link>{" "}
                        and{" "}
                        <Link to="/policies/privacy" className="text-brand hover:underline">Privacy Policy</Link>.
                      </span>
                    </label>
                    {agreeErr && <div className="text-xs text-red-600 -mt-1">{agreeErr}</div>}
                  </div>

                  {/* Sticky CTA only on mobile */}
                  <div className="md:hidden sticky bottom-[max(env(safe-area-inset-bottom),0px)] z-10 -mx-6 pt-2">
                    <div className="rounded-b-[26px] bg-gradient-to-t from-white/92 to-transparent backdrop-blur px-6 pb-3">
                      <button
                        type="button"
                        onClick={handlePrimaryClick}
                        aria-disabled={blocked}
                        className={`btn-primary w-full rounded-2xl py-4 text-[15px] inline-flex items-center justify-center gap-2 transition-shadow ${
                          btnWarn ? "ring-2 ring-red-300" : ""
                        } ${blocked ? "opacity-95" : ""}`}
                      >
                        {loading ? (
                          <>
                            <span className="inline-block h-5 w-5 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                            Creating account…
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            Create account
                          </>
                        )}
                      </button>

                      <div className="mt-3 text-center">
                        <Link
                          to="/"
                          className="inline-block text-sm text-gray-600 hover:text-gray-800 hover:underline"
                        >
                          Continue as guest
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Desktop CTA (not sticky, plenty of room) */}
                  <div className="hidden md:block">
                    <button
                      type="button"
                      onClick={handlePrimaryClick}
                      aria-disabled={blocked}
                      className={`btn-primary w-full rounded-2xl py-4 text-[15px] inline-flex items-center justify-center gap-2 ${
                        blocked ? "opacity-95" : ""
                      }`}
                    >
                      {loading ? (
                        <>
                          <span className="inline-block h-5 w-5 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                          Creating account…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Create account
                        </>
                      )}
                    </button>
                    <div className="mt-3 text-center">
                      <Link
                        to="/"
                        className="inline-block text-sm text-gray-600 hover:text-gray-800 hover:underline"
                      >
                        Continue as guest
                      </Link>
                    </div>
                  </div>

                  <p className="text-[12px] text-gray-500 text-center md:text-left">
                    We’ll never share your information.
                  </p>
                </form>

                {/* Footer actions */}
                <div className="px-6 md:px-7 pb-8 text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-brand hover:text-brand-dark hover:underline">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>{/* /right */}
        </div>
      </div>
    </section>
  );
}

function PwRule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className={`inline-flex items-center gap-1 ${ok ? "text-emerald-700" : "text-gray-500"}`}>
      <Check className={`h-3.5 w-3.5 ${ok ? "text-emerald-600" : "text-gray-300"}`} />
      {text}
    </li>
  );
}
