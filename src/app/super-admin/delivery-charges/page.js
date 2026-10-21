"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function DeliveryChargesContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [charges, setCharges] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    zone_name: "",
    inside_city_charge: "70",
    sub_city_charge: "90",
    outside_city_charge: "120",
    cod_charge_percent: "1",
    return_charge_percent: "0",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCharges();
  }, []);

  async function loadCharges() {
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

    const { data, error: chargeError } = await supabase
      .from("delivery_charges")
      .select("*")
      .order("created_at", { ascending: false });

    if (chargeError) {
      setCharges([]);
    } else {
      setCharges(data || []);
    }

    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("delivery_charges").insert({
      zone_name: form.zone_name,
      inside_city_charge: Number(form.inside_city_charge),
      sub_city_charge: Number(form.sub_city_charge),
      outside_city_charge: Number(form.outside_city_charge),
      cod_charge_percent: Number(form.cod_charge_percent),
      return_charge_percent: Number(form.return_charge_percent),
    });

    if (error) {
      setMessage("এরর: " + error.message);
    } else {
      setMessage("ডেলিভারি চার্জ সেভ হয়েছে!");
      setForm({
        zone_name: "",
        inside_city_charge: "70",
        sub_city_charge: "90",
        outside_city_charge: "120",
        cod_charge_percent: "1",
        return_charge_percent: "0",
      });
      setShowForm(false);
      await loadCharges();
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
          <Link href="/super-admin/branch-users" className="flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800">Branch Users</Link>
          <Link href="/super-admin/delivery-charges" className="flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium">Delivery Charges</Link>
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
            <h2 className="text-2xl font-bold text-gray-900">Delivery Charges</h2>
            <p className="text-sm text-gray-500">জোন অনুযায়ী ডেলিভারি চার্জ সেট করুন</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            {showForm ? "বাতিল" : "+ Add Charge"}
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
        )}

        {showForm && (
          <form onSubmit={handleSave} className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-teal-600 px-5 py-3 text-white">
              <h3 className="font-semibold">Add Delivery Charge</h3>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Zone Name</label>
                <input
                  type="text"
                  required
                  value={form.zone_name}
                  onChange={(e) => setForm({ ...form, zone_name: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. Dhaka City, Outside Dhaka"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Delivery Charge (৳)</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Inside City</label>
                    <input type="number" value={form.inside_city_charge} onChange={(e) => setForm({ ...form, inside_city_charge: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Sub City</label>
                    <input type="number" value={form.sub_city_charge} onChange={(e) => setForm({ ...form, sub_city_charge: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Outside City</label>
                    <input type="number" value={form.outside_city_charge} onChange={(e) => setForm({ ...form, outside_city_charge: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">COD Charge (%)</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.cod_charge_percent}
                      onChange={(e) => setForm({ ...form, cod_charge_percent: e.target.value })}
                      className="w-full rounded-l border border-gray-300 px-3 py-2 text-sm"
                    />
                    <span className="inline-flex items-center rounded-r border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                      %
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">ডিফল্ট ১%</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Return Charge (%)</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.return_charge_percent}
                      onChange={(e) => setForm({ ...form, return_charge_percent: e.target.value })}
                      className="w-full rounded-l border border-gray-300 px-3 py-2 text-sm"
                    />
                    <span className="inline-flex items-center rounded-r border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                      %
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">পরে বাড়াতে-কমাতে পারবেন</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Cancel
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
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Zone</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Inside</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Sub City</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Outside</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">COD %</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Return %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {charges.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                        কোনো ডেলিভারি চার্জ নেই।
                      </td>
                    </tr>
                  ) : (
                    charges.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{c.zone_name}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">৳ {c.inside_city_charge}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">৳ {c.sub_city_charge}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">৳ {c.outside_city_charge}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{c.cod_charge_percent}%</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{c.return_charge_percent}%</td>
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

export default function DeliveryChargesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-100"><p>লোড হচ্ছে...</p></div>}>
      <DeliveryChargesContent />
    </Suspense>
  );
}