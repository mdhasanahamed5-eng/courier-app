"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

const statusLabelsBn = {
  pending: "অপেক্ষমাণ",
  picked_up: "পিকআপ হয়েছে",
  in_transit: "পথে আছে",
  ready_for_delivery: "ডেলিভারির জন্য প্রস্তুত",
  delivered: "ডেলিভারড",
  returned: "ফেরত",
  cancelled: "বাতিল",
};

const timelineStatuses = [
  "pending",
  "picked_up",
  "in_transit",
  "ready_for_delivery",
  "delivered",
];

function money(value) {
  return `৳ ${Number(value || 0).toLocaleString("en-BD")}`;
}

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-0.5 text-xs text-gray-500">{label}</p>
      <p className="break-words text-sm font-medium text-gray-800">{value ?? "—"}</p>
    </div>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-800">{title}</h2>
      {children}
    </section>
  );
}

function ParcelDetailsContent() {
  const { id } = useParams();
  const router = useRouter();

  const [parcel, setParcel] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadParcel() {
      setLoading(true);
      setError("");

      const { data: userData, error: authError } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError || !userData.user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (
        profileError ||
        !profile ||
        !["merchant", "company_admin", "super_admin"].includes(profile.role)
      ) {
        setError("এই পার্সেল দেখার অনুমতি নেই।");
        setLoading(false);
        return;
      }

      const { data, error: parcelError } = await supabase
        .from("parcels")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      if (parcelError || !data) {
        setError(parcelError?.message || "পার্সেলটি পাওয়া যায়নি।");
        setLoading(false);
        return;
      }

      setParcel(data);

      // Load timeline events
      const { data: eventsData } = await supabase
        .from("parcel_events")
        .select("status, message, created_at")
        .eq("parcel_id", id)
        .order("created_at", { ascending: true });

      if (!cancelled) {
        setEvents(eventsData || []);
        setLoading(false);
      }
    }

    loadParcel().catch((err) => {
      if (!cancelled) {
        setError(err.message || "তথ্য লোড করা যায়নি।");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading parcel details...</p>
      </main>
    );
  }

  if (error || !parcel) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <Link href="/parcels" className="text-blue-600 hover:underline">
          ← All Deliveries
        </Link>
        <div className="mt-5 rounded-lg border border-red-200 bg-white p-5 text-red-600">
          {error || "Parcel not found."}
        </div>
      </main>
    );
  }

  const currentStatus = parcel.status || "pending";
  const currentIndex = timelineStatuses.indexOf(currentStatus);

  const trackingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/track/${encodeURIComponent(
          parcel.consignment_id || ""
        )}`
      : "";

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/parcels"
          className="mb-5 inline-block text-blue-700 hover:underline"
        >
          ← All Deliveries
        </Link>

        {/* Header */}
        <section className="mb-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                {statusLabels[currentStatus] || currentStatus}
              </span>

              <p className="mt-3 text-sm text-gray-500">Consignment ID</p>
              <h1 className="text-xl font-bold text-gray-900">
                {parcel.consignment_id || "—"}
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Order ID: {parcel.merchant_order_id || "N/A"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Print
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {/* Recipient Details */}
            <Panel title="Recipient Details">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                <Info label="Name" value={parcel.recipient_name} />
                <Info label="Phone" value={parcel.recipient_phone} />
                <Info label="City" value={parcel.city} />
                <Info label="Zone" value={parcel.zone} />
                <div className="sm:col-span-2">
                  <Info label="Address" value={parcel.recipient_address} />
                </div>
              </div>
            </Panel>

            {/* Timeline */}
            <Panel title="Timeline">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-start">
                  {timelineStatuses.map((status, index) => {
                    const completed = currentIndex >= 0 && index <= currentIndex;
                    return (
                      <div
                        key={status}
                        className="flex min-w-0 flex-1 flex-col items-center"
                      >
                        <div
                          className={`h-3 w-3 rounded-full ${
                            completed ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                        <p className="mt-2 text-center text-xs text-gray-600">
                          {statusLabels[status]}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 h-1 rounded bg-gray-200">
                  <div
                    className="h-1 rounded bg-green-500 transition-all"
                    style={{
                      width:
                        currentIndex < 0
                          ? "0%"
                          : `${(currentIndex / (timelineStatuses.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Dynamic events */}
              {events.length > 0 ? (
                <div className="border-t pt-4 space-y-4">
                  {events.map((event, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {statusLabelsBn[event.status] || event.status}
                        </p>
                        {event.message && (
                          <p className="text-sm text-gray-600">{event.message}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(event.created_at).toLocaleString("bn-BD")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-t pt-4 text-sm text-gray-500">
                  এখনো কোনো ইভেন্ট নেই।
                </div>
              )}
            </Panel>
          </div>

          <div className="space-y-4">
            {/* Cost of Delivery */}
            <Panel title="Cost of Delivery">
              <div className="space-y-3">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <strong>{money(parcel.delivery_fee)}</strong>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-600">COD</span>
                  <strong>{money(parcel.cod_amount)}</strong>
                </div>
                <div className="flex justify-between gap-3 border-t pt-3 font-semibold">
                  <span>Total</span>
                  <strong>
                    {money(
                      Number(parcel.delivery_fee || 0) +
                        Number(parcel.cod_amount || 0)
                    )}
                  </strong>
                </div>
                <p className="text-xs text-gray-500">
                  Payment status:{" "}
                  {parcel.fee_payment_status === "paid" ? "Paid" : "Unpaid"}
                </p>
              </div>
            </Panel>

            {/* Delivery Info */}
            <Panel title="Delivery Info">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Info label="Product Type" value={parcel.product_type || "Parcel"} />
                  <Info
                    label="Delivery Type"
                    value={parcel.delivery_type || "Normal"}
                  />
                  <Info
                    label="Weight"
                    value={parcel.weight_kg ? `${parcel.weight_kg} kg` : "—"}
                  />
                  <Info
                    label="Amount to Collect"
                    value={money(parcel.cod_amount)}
                  />
                </div>

                <div className="border-t pt-3 space-y-3">
                  <Info
                    label="Product Description"
                    value={parcel.item_description || "—"}
                  />
                  <Info
                    label="Special Instruction"
                    value={parcel.special_instructions || "—"}
                  />
                </div>

                <div className="border-t pt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                  <Info
                    label="Current Status"
                    value={statusLabelsBn[currentStatus] || currentStatus}
                  />
                  <Info
                    label="Created At"
                    value={
                      parcel.created_at
                        ? new Date(parcel.created_at).toLocaleString("bn-BD", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"
                    }
                  />
                </div>
              </div>
            </Panel>

            {/* Tracking */}
            <Panel title="Share Tracking Details">
              <p className="mb-3 break-all text-sm text-gray-600">{trackingUrl}</p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(trackingUrl);
                    alert("Link copied!");
                  } catch {
                    alert("Could not copy the link.");
                  }
                }}
                className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Copy
              </button>
              <p className="mt-2 text-xs text-gray-500">
                কাস্টমার এই লিংক দিয়ে পার্সেল ট্র্যাক করতে পারবে।
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ParcelDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-gray-600">Loading parcel details...</p>
        </main>
      }
    >
      <ParcelDetailsContent />
    </Suspense>
  );
}