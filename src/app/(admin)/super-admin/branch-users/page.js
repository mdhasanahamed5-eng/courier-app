"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function BranchUsersContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    address: "",
    branch_id: "",
    phone: "",
    email: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData.user) {
      router.replace("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!profile || profile.role !== "super_admin") {
      setError("শুধু Super Admin এই পেজ দেখতে পারবেন।");
      setLoading(false);
      return;
    }

    const { data: branchData } = await supabase
      .from("branches")
      .select("id, name")
      .order("name");

    setBranches(branchData || []);

    const { data: userList } = await supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("role", "branch_user")
      .order("created_at", { ascending: false });

    setUsers(userList || []);
    setLoading(false);
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      setMessage("এরর: " + signUpError.message);
      setSaving(false);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setMessage("ইউজার তৈরি হয়নি।");
      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      role: "branch_user",
      full_name: form.full_name,
    });

    if (profileError) {
      setMessage("প্রোফাইল এরর: " + profileError.message);
    } else {
      setMessage("Branch User সফলভাবে যোগ হয়েছে!");
      setForm({
        full_name: "",
        address: "",
        branch_id: "",
        phone: "",
        email: "",
        password: "",
      });
      setShowForm(false);
      await loadData();
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-lg border border-red-200 bg-white p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 flex-shrink-0 bg-gray-900 text-white">
        <div className="border-b border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">SA</div>
            <div>
              <h1 className="font-bold">Super Admin</h1>
              <p className="text-xs text-gray-400">Control Panel</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 space-y-1 px-3 pb-6">
          <Link href="/super-admin" className="flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800">Home</Link>
          <div className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Parcel</div>
          <Link href="/admin/parcels" className="flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800">All Parcels</Link>
          <div className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Management</div>
          <Link href="/super-admin/riders" className="flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800">Riders</Link>
          <Link href="/super-admin/merchants" className="flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800">Merchants</Link>
          <Link href="/super-admin/branches" className="flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800">Branches</Link>
          <Link href="/super-admin/branch-users" className="flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium">Branch Users</Link>
          <div className="mt-6 border-t border-gray-700 pt-4">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/login");
              }}
              className="w-full rounded-lg px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Branch Users</h2>
            <p className="text-sm text-gray-500">ব্রাঞ্চ ইউজারের তালিকা</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            {showForm ? "বাতিল" : "+ Create New Branch User"}
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
        )}

        {showForm && (
          <form onSubmit={handleAddUser} className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-teal-600 px-5 py-3 text-white">
              <h3 className="font-semibold">Create New Branch User</h3>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Address"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Branch</label>
                <select
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Contact Number</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">+88</span>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-r border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Contact Number"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Email"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Password"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Image</label>
                <input type="file" accept="image/*" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      full_name: "",
                      address: "",
                      branch_id: "",
                      phone: "",
                      email: "",
                      password: "",
                    })
                  }
                  className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        )}

        {!showForm && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-5 py-8 text-center text-gray-500">
                        কোনো Branch User নেই
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{u.full_name || "—"}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString("bn-BD") : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BranchUsersPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-100"><p>লোড হচ্ছে...</p></div>}>
      <BranchUsersContent />
    </Suspense>
  );
}