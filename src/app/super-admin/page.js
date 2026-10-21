"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function SuperAdminContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRiders: 0,
    totalMerchants: 0,
    totalParcels: 0,
    deliveredParcels: 0,
    pendingParcels: 0,
    inTransitParcels: 0,
    cancelledParcels: 0,
    returnedParcels: 0,
  });
  const [recentParcels, setRecentParcels] = useState([]);
  const [recentRiders, setRecentRiders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
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

    const { count: riderCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "rider");

    const { count: merchantCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "merchant");

    const { count: parcelCount } = await supabase
      .from("parcels")
      .select("*", { count: "exact", head: true });

    const { count: deliveredCount } = await supabase
      .from("parcels")
      .select("*", { count: "exact", head: true })
      .eq("status", "delivered");

    const { count: pendingCount } = await supabase
      .from("parcels")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: inTransitCount } = await supabase
      .from("parcels")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_transit");

    const { count: cancelledCount } = await supabase
      .from("parcels")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled");

    const { count: returnedCount } = await supabase
      .from("parcels")
      .select("*", { count: "exact", head: true })
      .eq("status", "returned");

    setStats({
      totalRiders: riderCount || 0,
      totalMerchants: merchantCount || 0,
      totalParcels: parcelCount || 0,
      deliveredParcels: deliveredCount || 0,
      pendingParcels: pendingCount || 0,
      inTransitParcels: inTransitCount || 0,
      cancelledParcels: cancelledCount || 0,
      returnedParcels: returnedCount || 0,
    });

    const { data: parcels } = await supabase
      .from("parcels")
      .select("id, consignment_id, recipient_name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentParcels(parcels || []);

    const { data: riders } = await supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("role", "rider")
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentRiders(riders || []);
    setLoading(false);
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
              SA
            </div>
            <div>
              <h1 className="font-bold">Super Admin</h1>
              <p className="text-xs text-gray-400">Control Panel</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 space-y-1 px-3 pb-6">
          <SidebarLink href="/super-admin" active>
            Home
          </SidebarLink>

          <div className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Parcel
          </div>
          <SidebarLink href="/admin/parcels">All Parcels</SidebarLink>

          <div className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Management
          </div>
          <SidebarLink href="/super-admin/riders">Riders</SidebarLink>
          <SidebarLink href="/super-admin/merchants">Merchants</SidebarLink>
          <SidebarLink href="/super-admin/branches">Branches</SidebarLink>
          <SidebarLink href="/super-admin/branch-users">Branch Users</SidebarLink>
          <SidebarLink href="/super-admin/delivery-charges">Delivery Charges</SidebarLink>

          <div className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Reports
          </div>
          <SidebarLink href="#">Parcel Report</SidebarLink>
          <SidebarLink href="#">Delivery Report</SidebarLink>

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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Super Admin Control Panel</h2>
          <p className="text-sm text-gray-500">Overview of your courier system</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          <StatCard title="Total Riders" value={stats.totalRiders} color="bg-orange-500" />
          <StatCard title="Total Merchants" value={stats.totalMerchants} color="bg-green-500" />
          <StatCard title="Total Parcels" value={stats.totalParcels} color="bg-blue-500" />
          <StatCard title="Delivered" value={stats.deliveredParcels} color="bg-emerald-500" />
          <StatCard title="Pending" value={stats.pendingParcels} color="bg-yellow-500" />
          <StatCard title="In Transit" value={stats.inTransitParcels} color="bg-indigo-500" />
          <StatCard title="Cancelled" value={stats.cancelledParcels} color="bg-red-500" />
          <StatCard title="Returned" value={stats.returnedParcels} color="bg-purple-500" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h3 className="font-semibold text-gray-800">Recent Parcels</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Consignment</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Recipient</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentParcels.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-6 text-center text-gray-500">কোনো পার্সেল নেই</td>
                    </tr>
                  ) : (
                    recentParcels.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{p.consignment_id}</td>
                        <td className="px-5 py-3 text-sm text-gray-700">{p.recipient_name}</td>
                        <td className="px-5 py-3 text-sm">
                          <span className="rounded bg-gray-100 px-2 py-1 text-xs">{p.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h3 className="font-semibold text-gray-800">Recent Riders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentRiders.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-5 py-6 text-center text-gray-500">কোনো রাইডার নেই</td>
                    </tr>
                  ) : (
                    recentRiders.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{r.full_name || "—"}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString("bn-BD") : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg ${color} text-white`}>
        <span className="text-lg font-bold">{value}</span>
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
    </div>
  );
}

function SidebarLink({ href, children, active = false }) {
  return (
    <Link
      href={href}
      className={`flex items-center rounded-lg px-4 py-2.5 text-sm ${
        active ? "bg-blue-600 font-medium text-white" : "text-gray-300 hover:bg-gray-800"
      }`}
    >
      {children}
    </Link>
  );
}

export default function SuperAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <p>লোড হচ্ছে...</p>
        </div>
      }
    >
      <SuperAdminContent />
    </Suspense>
  );
}