import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { AlertTriangle, CheckCircle, Mail, Phone, KeyRound } from "lucide-react";

const inputClass =
  "w-full p-3 rounded-lg border border-neutral-300 focus:border-blue-700 focus:outline-none";

function methodsFor(phoneEnabled) {
  const methods = [
    { id: "link", label: "Email me a link", icon: Mail },
    { id: "password", label: "Use a password", icon: KeyRound }
  ];
  if (phoneEnabled) {
    methods.push({ id: "phone", label: "Text me a code", icon: Phone });
  }
  return methods;
}

/**
 * Sign-in for senders.
 *
 * Three ways in, because the audience the product is written for spans people
 * who would rather never manage a password and people who expect one. The
 * email link is offered first for that reason. Phone codes only appear when an
 * SMS provider is configured in Supabase — see isPhoneAuthEnabled.
 */
export default function SignIn() {
  const navigate = useNavigate();
  const {
    isAuthConfigured,
    isPhoneAuthEnabled,
    isAuthenticated,
    signInWithMagicLink,
    signInWithPassword,
    signUpWithPassword,
    signInWithPhone,
    verifyPhoneOtp,
    signOut,
    user
  } = useAuth();

  const [method, setMethod] = useState("link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const run = async (action) => {
    setStatus("working");
    setError("");
    setMessage("");
    try {
      await action();
    } catch (actionError) {
      setError(actionError?.message || "Something went wrong. Please try again.");
      setStatus("error");
      return;
    }
    setStatus("idle");
  };

  if (!isAuthConfigured) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Sign-in is not available on this deployment yet. It needs
            VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to be configured.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <AlertDescription className="text-green-800">
            You are signed in as {user?.email || user?.phone}.
          </AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/SendMoney")}>Send money</Button>
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card className="shadow-premium border-0">
        <CardHeader>
          <CardTitle>Sign in to NexaRemit</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-3">
          {methodsFor(isPhoneAuthEnabled).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMethod(id);
                setError("");
                setMessage("");
              }}
              className={`p-4 rounded-lg border text-center transition-premium ${
                method === id
                  ? "border-blue-700 bg-blue-50"
                  : "border-neutral-200 hover:border-blue-300"
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2 text-blue-700" />
              <span className="font-semibold text-primary">{label}</span>
            </button>
          ))}
        </CardContent>

        <CardContent className="space-y-4">
          {message && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {method === "link" && (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                run(async () => {
                  await signInWithMagicLink(email);
                  setMessage(
                    `We sent a sign-in link to ${email}. Open it on this device to continue.`
                  );
                });
              }}
            >
              <label htmlFor="signin-email" className="block font-semibold text-primary">
                Email address
              </label>
              <input
                id="signin-email"
                type="email"
                required
                autoComplete="email"
                className={inputClass}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
              <Button type="submit" disabled={status === "working"}>
                {status === "working" ? "Sending..." : "Email me a sign-in link"}
              </Button>
              <p className="text-sm text-neutral-600">
                No password to remember. The link signs you in when you open it.
              </p>
            </form>
          )}

          {method === "password" && (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                run(async () => {
                  if (isCreatingAccount) {
                    const { needsConfirmation } = await signUpWithPassword(email, password);
                    setMessage(
                      needsConfirmation
                        ? `Account created. Check ${email} to confirm it, then sign in.`
                        : "Account created. You are signed in."
                    );
                    return;
                  }
                  await signInWithPassword(email, password);
                  navigate("/SendMoney");
                });
              }}
            >
              <label htmlFor="pw-email" className="block font-semibold text-primary">
                Email address
              </label>
              <input
                id="pw-email"
                type="email"
                required
                autoComplete="email"
                className={inputClass}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />

              <label htmlFor="pw-password" className="block font-semibold text-primary">
                Password
              </label>
              <input
                id="pw-password"
                type="password"
                required
                minLength={8}
                autoComplete={isCreatingAccount ? "new-password" : "current-password"}
                className={inputClass}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
              />

              <Button type="submit" disabled={status === "working"}>
                {status === "working"
                  ? "Please wait..."
                  : isCreatingAccount
                    ? "Create account"
                    : "Sign in"}
              </Button>

              <button
                type="button"
                className="block text-sm text-blue-700 underline"
                onClick={() => setIsCreatingAccount((previous) => !previous)}
              >
                {isCreatingAccount
                  ? "I already have an account"
                  : "I need to create an account"}
              </button>
            </form>
          )}

          {method === "phone" && (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                run(async () => {
                  if (!otpSent) {
                    await signInWithPhone(phone);
                    setOtpSent(true);
                    setMessage(`We sent a code to ${phone}.`);
                    return;
                  }
                  await verifyPhoneOtp(phone, otp);
                  navigate("/SendMoney");
                });
              }}
            >
              <label htmlFor="signin-phone" className="block font-semibold text-primary">
                Phone number
              </label>
              <input
                id="signin-phone"
                type="tel"
                required
                autoComplete="tel"
                className={inputClass}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 555 000 0000"
              />
              <p className="text-sm text-neutral-600">
                Include the country code, for example +1 for the United States.
              </p>

              {otpSent && (
                <>
                  <label htmlFor="signin-otp" className="block font-semibold text-primary">
                    Six-digit code
                  </label>
                  <input
                    id="signin-otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className={inputClass}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="123456"
                  />
                </>
              )}

              <Button type="submit" disabled={status === "working"}>
                {status === "working"
                  ? "Please wait..."
                  : otpSent
                    ? "Sign in"
                    : "Text me a code"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
