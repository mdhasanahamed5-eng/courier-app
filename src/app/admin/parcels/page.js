"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const statusLabels = {
  pending: "Pending",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  ready_for_delivery: "Ready for Delivery",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

const statusStyles = {
  pending: "bg-gray-100 text-gray-700",
  picked_up: "bg-blue-100 text-blue-700",
  in_transit: "bg-blue-100 text-blue-700",
  ready_for_delivery: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-700",
  returned: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
};

const allStatuses = [
  "pending",
  "picked_up",
  "in_transit",
  "ready_for_delivery",
  "delivered",
  "returned",
  "cancelled",
];

function AdminParcelsContent() {
  const router = useRouter();
  const [parcels, setParcels] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: userData, error: authError } = await supabase.auth.getUser();

    if (authError || !userData.user) {
      router.replace("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!profile || !["company_admin", "super_admin"].includes(profile.role)) {
      setError("শুধু কোম্পানি অ্যাডমিন এই পেজ দেখতে পারবেন।");
      setLoading(false);
      return;
    }

    setRole(profile.role);

    let query = supabase
      .from("parcels")
      .select("id, consignment_id, recipient_name, recipient_phone, city, zone, status, cod_amount, created_at, company_id, rider_id")
      .order("created_at", { ascending: false });

    if (profile.role === "company_admin" && profile.company_id) {
      query = query.eq("company_id", profile.company_id);
    }

    const { data: parcelsData, error: parcelsError } = await query;

    if (parcelsError) {
      setError(parcelsError.message);
      setLoading(false);
      return;
    }

    setParcels(parcelsData || []);

    let ridersQuery = supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "rider");

    if (profile.role === "company_admin" && profile.company_id) {
      ridersQuery = ridersQuery.eq("company_id", profile.company_id);
    }

    const { data: ridersData } = await ridersQuery;
    setRiders(ridersData || []);

    setLoading(false);
  }

  async function updateStatus(parcelId, newStatus, companyId) {
    setUpdating(parcelId);

    const { error: updateError } = await supabase
      .from("parcels")
      .update({ status: newStatus })
      .eq("id", parcelId);

    if (updateError) {
      alert("পার্সেল আপডেট এরর: " + updateError.message);
      setUpdating(null);
      return;
    }

    const statusMessages = {
      pending: "পার্সেল পেন্ডিং করা হয়েছে",
      picked_up: "পার্সেল পিকআপ করা হয়েছে",
      in_transit: "পার্সেল পথে আছে",
      ready_for_delivery: "ডেলিভারির জন্য প্রস্তুত",
      delivered: "পার্সেল ডেলিভারড হয়েছে",
      returned: "পার্সেল ফেরত দেওয়া হয়েছে",
      cancelled: "পার্সেল বাতিল করা হয়েছে",
    };

    await supabase.from("parcel_events").insert({
      parcel_id: parcelId,
      company_id: companyId,
      status: newStatus,
      message: statusMessages[newStatus] || `স্ট্যাটাস পরিবর্তন: ${newStatus}`,
    });

    await loadData();
    setUpdating(null);
  }

  async function assignRider(parcelId, riderId, companyId) {
    setUpdating(parcelId);

    const { error } = await supabase
      .from("parcels")
      .update({ rider_id: riderId || null })
      .eq("id", parcelId);

    if (error) {
      alert("রাইডার অ্যাসাইন এরর: " + error.message);
      setUpdating(null);
      return;
    }

    const rider = riders.find((r) => r.id === riderId);
    const message = riderId
      ? `রাইডার অ্যাসাইন করা হয়েছে: ${rider?.full_name || "Unknown"}`
      : "রাইডার অ্যাসাইনমেন্ট সরানো হয়েছে";

    await supabase.from("parcel_events").insert({
      parcel_id: parcelId,
      company_id: companyId,
      status: "pending",
      message,
    });

    await loadData();
    setUpdating(null);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">লোড হচ্ছে...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-white p-6 text-red-600">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">সব পার্সেল</h1>
          <span className="text-sm text-gray-500">{role}</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Consignment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Recipient
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  City / Zone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Update Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Assign Rider
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parcels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    কোনো পার্সেল নেই।
                  </td>
                </tr>
              ) : (
                parcels.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {p.consignment_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>{p.recipient_name}</div>
                      <div className="text-xs text-gray-500">{p.recipient_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {p.city} / {p.zone}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          statusStyles[p.status] || "bg-gray-100"
                        }`}
                      >
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.status}
                        disabled={updating === p.id}
                        onChange={(e) => updateStatus(p.id, e.target.value, p.company_id)}
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s}>
                            {statusLabels[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.rider_id || ""}
                        disabled={updating === p.id}
                        onChange={(e) => assignRider(p.id, e.target.value, p.company_id)}
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option value="">— রাইডার নেই —</option>
                        {riders.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.full_name || r.id.slice(0, 8)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/parcels/${p.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        দেখুন
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {riders.length === 0 && (
          <p className="mt-4 text-sm text-orange-600">
            কোনো রাইডার পাওয়া যায়নি। profiles টেবিলে role = 'rider' যোগ করুন।
          </p>
        )}
      </div>
    </main>
  );
}

export default function AdminParcelsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <p>লোড হচ্ছে...</p>
        </main>
      }
    >
      <AdminParcelsContent />
    </Suspense>
  );
}