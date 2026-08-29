import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  };

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF6EF]">
        <p className="text-sm text-[#9A8A76]">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF6EF] px-4">
        <form
          onSubmit={submit}
          className="w-full max-w-sm glass rounded-2xl p-6"
        >
          <p className="font-display text-2xl text-center mb-1">NAOMI</p>
          <p className="text-xs text-center text-[#9A8A76] mb-6">my life. my space.</p>

          <label className="text-xs text-[#9A8A76]">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#EEE0CE] bg-transparent text-sm outline-none mt-1 mb-3"
          />

          <label className="text-xs text-[#9A8A76]">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#EEE0CE] bg-transparent text-sm outline-none mt-1 mb-4"
          />

          {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-[#5C4433] text-white text-sm"
          >
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-center text-xs text-[#9A8A76] mt-4"
          >
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return children;
}