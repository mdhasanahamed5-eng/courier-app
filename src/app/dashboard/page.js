"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const roleLabels = {
  super_admin: "সুপার অ্যাডমিন",
  company_admin: "কোম্পানি অ্যাডমিন",
  rider: "রাইডার",
  customer: "কাস্টমার",
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("full_name, role, company_id")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (cancelled) return;

      setUser(userData.user);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setProfile(profileData);
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-50">
        <p className="text-gray-600">লোড হচ্ছে...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold text-blue-700">ড্যাশবোর্ড</h1>

        {errorMessage ? (
          <p className="mb-4 text-red-600">সমস্যা: {errorMessage}</p>
        ) : profile ? (
          <div className="mb-6 space-y-1 text-gray-800">
            <p>নাম: {profile.full_name}</p>
            <p>ভূমিকা: {roleLabels[profile.role] ?? profile.role}</p>
            <p>ইমেইল: {user.email}</p>
          </div>
        ) : (
          <p className="mb-6 text-gray-700">
            এই অ্যাকাউন্টের কোনো প্রোফাইল পাওয়া যায়নি।
          </p>
        )}

        <button
          onClick={handleLogout}
          className="rounded bg-red-600 px-4 py-2 font-semibold text-white"
        >
          লগআউট
        </button>
      </div>
    </main>
  );
}