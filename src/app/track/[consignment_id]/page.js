"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

function TrackingContent() {
  const { consignment_id } = useParams();
  const [parcel, setParcel] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!consignment_id) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const { data: parcelData, error: parcelErr } = await supabase
        .from("parcels")
        .select("*")
        .eq("consignment_id", decodeURIComponent(consignment_id))
        .maybeSingle();

      if (cancelled) return;

      if (parcelErr || !parcelData) {
        setError("এই ট্র্যাকিং নম্বরের কোনো পার্সেল পাওয়া যায়নি।");
        setLoading(false);
        return;
      }

      setParcel(parcelData);

      // Load events
      const { data: eventsData } = await supabase
        .from("parcel_events")
        .select("status, message, created_at")
        .eq("parcel_id", parcelData.id)
        .order("created_at", { ascending: true });

      if (!cancelled) {
        setEvents(eventsData || []);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [consignment_id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">ট্র্যাকিং তথ্য লোড হচ্ছে...</p>
      </main>
    );
  }

  if (error || !parcel) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="mb-2 text-xl font-semibold text-red-600">ট্র্যাকিং পাওয়া যায়নি</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </main>
    );
  }

  const currentStatus = parcel.status || "pending";
  const currentIndex = timelineStatuses.indexOf(currentStatus);

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">পার্সেল ট্র্যাকিং</h1>
          <p className="mt-1 text-gray-600">Consignment ID: {parcel.consignment_id}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 text-center">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
              {statusLabels[currentStatus] || currentStatus}
            </span>
            <p className="mt-2 text-lg font-medium text-gray-800">
              {statusLabelsBn[currentStatus]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              {timelineStatuses.map((status, index) => {
                const completed = currentIndex >= 0 && index <= currentIndex;
                return (
                  <div key={status} className="flex flex-1 flex-col items-center">
                    <div
                      className={`h-4 w-4 rounded-full ${
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
            <div className="mt-3 h-1.5 rounded-full bg-gray-200">
              <div
                className="h-1.5 rounded-full bg-green-500 transition-all"
                style={{
                  width:
                    currentIndex < 0
                      ? "0%"
                      : `${(currentIndex / (timelineStatuses.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Dynamic Timeline Events */}
          {events.length > 0 && (
            <div className="mb-6 border-t pt-6">
              <h3 className="mb-4 font-semibold text-gray-800">টাইমলাইন</h3>
              <div className="space-y-4">
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
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4 border-t pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">প্রাপকের নাম</span>
              <span className="font-medium">{parcel.recipient_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">শহর</span>
              <span className="font-medium">{parcel.city || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">জোন</span>
              <span className="font-medium">{parcel.zone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">পণ্যের ধরন</span>
              <span className="font-medium">{parcel.product_type || "Parcel"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ওজন</span>
              <span className="font-medium">
                {parcel.weight_kg ? `${parcel.weight_kg} kg` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">COD</span>
              <span className="font-medium">{money(parcel.cod_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">বুকিং তারিখ</span>
              <span className="font-medium">
                {parcel.created_at
                  ? new Date(parcel.created_at).toLocaleString("bn-BD")
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          এই পেজটি পাবলিক। পূর্ণ ঠিকানা ও ফোন নম্বর নিরাপত্তার জন্য দেখানো হয় না।
        </p>
      </div>
    </main>
  );
}

export default function PublicTrackingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-gray-600">ট্র্যাকিং তথ্য লোড হচ্ছে...</p>
        </main>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}