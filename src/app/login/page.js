"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow"
      >
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-700">
          লগইন
        </h1>

        <label className="mb-1 block text-sm text-gray-700" htmlFor="email">
          ইমেইল
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900"
        />

        <label className="mb-1 block text-sm text-gray-700" htmlFor="password">
          পাসওয়ার্ড
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900"
        />

        {errorMessage && (
          <p className="mb-4 text-sm text-red-600">লগইন ব্যর্থ: {errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "অপেক্ষা করুন..." : "লগইন করুন"}
        </button>
      </form>
    </main>
  );
}