"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900";

const weightOptions = [0.5, 1, 1.5, 2, 3, 4, 5];

const emptyForm = {
  storeId: "",
  merchantOrderId: "",
  recipientName: "",
  recipientPhone: "",
  recipientSecondaryPhone: "",
  recipientAddress: "",
  city: "",
  zone: "",
  area: "",
  productType: "parcel",
  deliveryType: "normal",
  weightKg: "0.5",
  quantity: "1",
  codAmount: "0",
  itemDescription: "",
  specialInstructions: "",
};

function areaLabel(match) {
  return match.zone_en ? `${match.city_en} / ${match.zone_en}` : match.city_en;
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm text-gray-700" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function NewParcelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stores, setStores] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdId, setCreatedId] = useState("");
  const [areaHint, setAreaHint] = useState(null);
  const areaTouchedRef = useRef(false);
  const detectCounterRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role, company_id")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (cancelled) return;

      if (profileError) {
        setErrorMessage(profileError.message);
        setLoading(false);
        return;
      }

      let storeList = [];
      if (profileData && profileData.role === "merchant") {
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .select("id, name")
          .eq("merchant_id", userData.user.id)
          .order("created_at", { ascending: true });
        if (cancelled) return;

        if (storeError) {
          setErrorMessage(storeError.message);
          setLoading(false);
          return;
        }
        storeList = storeData ?? [];
      }

      setUser(userData.user);
      setProfile(profileData);
      setStores(storeList);
      if (storeList.length === 1) {
        setForm((prev) => ({ ...prev, storeId: storeList[0].id }));
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const address = form.recipientAddress.trim();
    const requestId = ++detectCounterRef.current;

    if (address.length === 0) {
      areaTouchedRef.current = false;
      setAreaHint(null);
      setForm((prev) =>
        prev.city === "" && prev.zone === ""
          ? prev
          : { ...prev, city: "", zone: "" }
      );
      return;
    }

    if (address.length < 3) {
      if (!areaTouchedRef.current) {
        setForm((prev) =>
          prev.city === "" && prev.zone === ""
            ? prev
            : { ...prev, city: "", zone: "" }
        );
      }
      return;
    }

    const timer = setTimeout(async () => {
      let { data, error } = await supabase.rpc("detect_area_v2", {
        p_address: address,
      });

      if (!error && (!data || data.length === 0)) {
        const fallback = await supabase.rpc("detect_district", {
          p_address: address,
        });
        data = fallback.data;
        error = fallback.error;
      }

      if (requestId !== detectCounterRef.current) return;

      if (error || !data || data.length === 0) {
        if (!areaTouchedRef.current) {
          setForm((prev) =>
            prev.city === "" && prev.zone === ""
              ? prev
              : { ...prev, city: "", zone: "" }
          );
        }
        setAreaHint({ address, kind: "none", matches: [] });
        return;
      }

      const top = data[0];

      if (top.match_kind === "confident" && !areaTouchedRef.current) {
        setForm((prev) => ({
          ...prev,
          city: top.city_en,
          zone: top.zone_en ?? "",
        }));
        setAreaHint({ address, kind: "auto", matches: data });
      } else {
        if (!areaTouchedRef.current) {
          setForm((prev) =>
            prev.city === "" && prev.zone === ""
              ? prev
              : { ...prev, city: "", zone: "" }
          );
        }
        setAreaHint({ address, kind: "suggest", matches: data });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [form.recipientAddress]);

  function updateField(event) {
    const { name, value } = event.target;
    if (name === "city" || name === "zone") {
      areaTouchedRef.current = true;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function applyArea(match) {
    areaTouchedRef.current = true;
    setForm((prev) => ({
      ...prev,
      city: match.city_en,
      zone: match.zone_en ?? "",
    }));
    setAreaHint(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setCreatedId("");

    const { data, error } = await supabase
      .from("parcels")
      .insert({
        company_id: profile.company_id,
        merchant_id: user.id,
        store_id: form.storeId,
        merchant_order_id: form.merchantOrderId.trim() || null,
        recipient_name: form.recipientName.trim(),
        recipient_phone: form.recipientPhone.trim(),
        recipient_secondary_phone: form.recipientSecondaryPhone.trim() || null,
        recipient_address: form.recipientAddress.trim(),
        city: form.city.trim() || null,
        zone: form.zone.trim() || null,
        area: form.area.trim() || null,
        product_type: form.productType,
        delivery_type: form.deliveryType,
        weight_kg: Number(form.weightKg),
        quantity: Number(form.quantity),
        cod_amount: Number(form.codAmount),
        item_description: form.itemDescription.trim() || null,
        special_instructions: form.specialInstructions.trim() || null,
      })
      .select("consignment_id")
      .single();

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    setCreatedId(data.consignment_id);
    setForm({ ...emptyForm, storeId: form.storeId });
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-50">
        <p className="text-gray-600">লোড হচ্ছে...</p>
      </main>
    );
  }

  if (!profile || profile.role !== "merchant") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-blue-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
          <h1 className="mb-3 text-xl font-bold text-blue-700">
            পার্সেল বুকিং
          </h1>
          {errorMessage ? (
            <p className="mb-4 text-red-600">সমস্যা: {errorMessage}</p>
          ) : (
            <p className="mb-4 text-gray-700">
              এই পেজ শুধু মার্চেন্টদের জন্য। মার্চেন্ট অ্যাকাউন্টে লগইন করে আবার
              চেষ্টা করুন।
            </p>
          )}
          <Link href="/dashboard" className="text-blue-600 underline">
            ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>
      </main>
    );
  }

  if (stores.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-blue-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
          <h1 className="mb-3 text-xl font-bold text-blue-700">
            পার্সেল বুকিং
          </h1>
          <p className="mb-4 text-gray-700">
            আপনার কোনো স্টোর নেই। পার্সেল বুক করতে আগে একটি স্টোর লাগবে।
          </p>
          <Link href="/dashboard" className="text-blue-600 underline">
            ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>
      </main>
    );
  }

  const currentAddress = form.recipientAddress.trim();
  const hint =
    areaHint && areaHint.address === currentAddress ? areaHint : null;

  return (
    <main className="min-h-screen bg-blue-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-700">নতুন পার্সেল বুকিং</h1>
          <Link href="/dashboard" className="text-blue-600 underline">
            ড্যাশবোর্ড
          </Link>
        </div>

        {createdId && (
          <div className="mb-6 rounded-xl border border-green-300 bg-green-50 p-4 text-green-800">
            পার্সেল বুক হয়েছে। ট্র্যাকিং নম্বর:{" "}
            <span className="font-bold">{createdId}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            বুকিং ব্যর্থ: {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6 rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              প্রাথমিক তথ্য
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="স্টোর" htmlFor="storeId">
                <select
                  id="storeId"
                  name="storeId"
                  required
                  value={form.storeId}
                  onChange={updateField}
                  className={inputClass}
                >
                  <option value="">স্টোর বেছে নিন</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="পণ্যের ধরন" htmlFor="productType">
                <select
                  id="productType"
                  name="productType"
                  value={form.productType}
                  onChange={updateField}
                  className={inputClass}
                >
                  <option value="parcel">পার্সেল</option>
                  <option value="document">ডকুমেন্ট</option>
                </select>
              </Field>

              <Field label="মার্চেন্ট অর্ডার আইডি (ঐচ্ছিক)" htmlFor="merchantOrderId">
                <input
                  id="merchantOrderId"
                  name="merchantOrderId"
                  type="text"
                  value={form.merchantOrderId}
                  onChange={updateField}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                প্রাপকের তথ্য
              </h2>

              <Field label="প্রাপকের ফোন নম্বর" htmlFor="recipientPhone">
                <input
                  id="recipientPhone"
                  name="recipientPhone"
                  type="tel"
                  required
                  pattern="01[3-9][0-9]{8}"
                  title="১১ সংখ্যার মোবাইল নম্বর, যেমন 01712345678"
                  placeholder="01XXXXXXXXX"
                  value={form.recipientPhone}
                  onChange={updateField}
                  className={inputClass}
                />
              </Field>

              <Field
                label="দ্বিতীয় ফোন নম্বর (ঐচ্ছিক)"
                htmlFor="recipientSecondaryPhone"
              >
                <input
                  id="recipientSecondaryPhone"
                  name="recipientSecondaryPhone"
                  type="tel"
                  pattern="01[3-9][0-9]{8}"
                  title="১১ সংখ্যার মোবাইল নম্বর, যেমন 01712345678"
                  placeholder="01XXXXXXXXX"
                  value={form.recipientSecondaryPhone}
                  onChange={updateField}
                  className={inputClass}
                />
              </Field>

              <Field label="প্রাপকের নাম" htmlFor="recipientName">
                <input
                  id="recipientName"
                  name="recipientName"
                  type="text"
                  required
                  value={form.recipientName}
                  onChange={updateField}
                  className={inputClass}
                />
              </Field>

              <Field label="প্রাপকের পূর্ণ ঠিকানা" htmlFor="recipientAddress">
                <textarea
                  id="recipientAddress"
                  name="recipientAddress"
                  required
                  rows={3}
                  value={form.recipientAddress}
                  onChange={updateField}
                  className={inputClass}
                />

                {hint && hint.kind === "auto" && (
                  <p className="mt-2 text-sm text-green-700">
                    ঠিকানা থেকে নিজে থেকে বসানো হয়েছে:{" "}
                    {areaLabel(hint.matches[0])}।
                    {hint.matches[0].zone_en
                      ? " ভুল মনে হলে নিজে বদলে নিন।"
                      : " জোন ফাঁকা আছে, ঠিকানায় এলাকার নাম লিখুন বা নিচে নিজে লিখুন।"}
                  </p>
                )}

                {hint && hint.kind === "suggest" && (
                  <div className="mt-2 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                    <p className="mb-2">
                      আপনি কি এগুলোর কোনোটি বোঝাতে চেয়েছেন? বেছে নিন:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hint.matches.map((match) => (
                        <button
                          type="button"
                          key={`${match.city_en}-${match.zone_en ?? ""}`}
                          onClick={() => applyArea(match)}
                          className="rounded border border-yellow-400 bg-white px-3 py-1 text-yellow-900"
                        >
                          {areaLabel(match)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {hint && hint.kind === "none" && (
                  <p className="mt-2 text-sm text-gray-500">
                    ঠিকানা থেকে শহর ও জোন পাওয়া যায়নি। নিচে নিজে লিখুন।
                  </p>
                )}
              </Field>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="শহর" htmlFor="city">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={updateField}
                    className={inputClass}
                  />
                </Field>
                <Field label="জোন" htmlFor="zone">
                  <input
                    id="zone"
                    name="zone"
                    type="text"
                    value={form.zone}
                    onChange={updateField}
                    className={inputClass}
                  />
                </Field>
                <Field label="এলাকা" htmlFor="area">
                  <input
                    id="area"
                    name="area"
                    type="text"
                    value={form.area}
                    onChange={updateField}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                ডেলিভারির তথ্য
              </h2>

              <Field label="ডেলিভারির ধরন" htmlFor="deliveryType">
                <select
                  id="deliveryType"
                  name="deliveryType"
                  value={form.deliveryType}
                  onChange={updateField}
                  className={inputClass}
                >
                  <option value="normal">সাধারণ ডেলিভারি</option>
                  <option value="same_day">একই দিনে ডেলিভারি</option>
                </select>
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="মোট ওজন" htmlFor="weightKg">
                  <select
                    id="weightKg"
                    name="weightKg"
                    value={form.weightKg}
                    onChange={updateField}
                    className={inputClass}
                  >
                    {weightOptions.map((w) => (
                      <option key={w} value={String(w)}>
                        {w} কেজি
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="পরিমাণ" htmlFor="quantity">
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.quantity}
                    onChange={updateField}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="আদায়যোগ্য টাকা (COD)" htmlFor="codAmount">
                <input
                  id="codAmount"
                  name="codAmount"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.codAmount}
                  onChange={updateField}
                  className={inputClass}
                />
              </Field>

              <Field label="পণ্যের বিবরণ ও দাম" htmlFor="itemDescription">
                <textarea
                  id="itemDescription"
                  name="itemDescription"
                  rows={3}
                  value={form.itemDescription}
                  onChange={updateField}
                  className={inputClass}
                />
              </Field>

              <Field label="বিশেষ নির্দেশনা" htmlFor="specialInstructions">
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  rows={3}
                  value={form.specialInstructions}
                  onChange={updateField}
                  className={inputClass}
                />
              </Field>

              <p className="text-sm text-gray-500">
                ডেলিভারি চার্জ কোম্পানি পরে নির্ধারণ করবে।
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-blue-600 px-6 py-2 font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "অপেক্ষা করুন..." : "বুক করুন"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm({ ...emptyForm, storeId: form.storeId });
                setErrorMessage("");
                setCreatedId("");
              }}
              className="rounded border border-gray-300 bg-white px-6 py-2 text-gray-700"
            >
              ফর্ম খালি করুন
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}