"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 20;

const allowedRoles = ["merchant", "company_admin", "super_admin"];

const statusLabels = {
  pending: "অপেক্ষমাণ",
  picked_up: "পিকআপ হয়েছে",
  in_transit: "পথে আছে",
  ready_for_delivery: "ডেলিভারির জন্য প্রস্তুত",
  delivered: "ডেলিভারড",
  returned: "ফেরত",
  cancelled: "বাতিল",
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

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const emptyFilters = {
  consignmentId: "",
  search: "",
  status: "",
  storeId: "",
  dateFrom: "",
  dateTo: "",
};

const inputBase = "w-full rounded border border-gray-300 bg-white py-2 pl-10";

function pad(value) {
  return String(value).padStart(2, "0");
}

function toDateString(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function getTodayDhaka() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

function formatDate(value) {
  return new Date(value).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(value) {
  return new Date(`${value}T00:00:00+06:00`).toLocaleDateString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function cleanSearch(text) {
  return text.replace(/[,()%*\\]/g, " ").trim();
}

function cleanConsignment(text) {
  return text.replace(/[^A-Za-z0-9]/g, "");
}

function getStoreName(row) {
  if (Array.isArray(row.stores)) {
    return row.stores[0]?.name ?? "-";
  }
  return row.stores?.name ?? "-";
}

function SvgIcon({ children }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function SearchIcon() {
  return (
    <SvgIcon>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </SvgIcon>
  );
}

function StatusIcon() {
  return (
    <SvgIcon>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </SvgIcon>
  );
}

function StoreIcon() {
  return (
    <SvgIcon>
      <path d="M3 9l1-5h16l1 5" />
      <path d="M4 9v11h16V9" />
      <path d="M9 20v-6h6v6" />
    </SvgIcon>
  );
}

function CalendarIcon() {
  return (
    <SvgIcon>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </SvgIcon>
  );
}

function IconBox({ icon, children }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>
      {children}
    </div>
  );
}

function DateRangePicker({ start, end, onChange }) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const today = getTodayDhaka();
  const todayYear = Number(today.slice(0, 4));
  const todayMonth = Number(today.slice(5, 7)) - 1;
  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);

  useEffect(() => {
    if (!open) return;

    function handleMouseDown(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggle() {
    if (!open) {
      const base = start || today;
      setViewYear(Number(base.slice(0, 4)));
      setViewMonth(Number(base.slice(5, 7)) - 1);
    }
    setOpen(!open);
  }

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function pick(dateStr) {
    if (dateStr > today) return;

    if (!start || end) {
      onChange(dateStr, "");
      return;
    }

    if (dateStr === start) {
      setOpen(false);
      return;
    }

    if (dateStr < start) {
      onChange(dateStr, start);
    } else {
      onChange(start, dateStr);
    }
    setOpen(false);
  }

  const atCurrentMonth =
    viewYear > todayYear ||
    (viewYear === todayYear && viewMonth >= todayMonth);

  const firstWeekday = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDateString(viewYear, viewMonth, day));
  }

  let label = "Date/Date Range";
  if (start) {
    label =
      end && end !== start
        ? `${formatDateOnly(start)} - ${formatDateOnly(end)}`
        : formatDateOnly(start);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <CalendarIcon />
      </span>

      <button
        type="button"
        aria-label="Date or Date Range"
        aria-expanded={open}
        onClick={toggle}
        className={`${inputBase} text-left ${
          start ? "pr-9 text-gray-900" : "pr-3 text-gray-400"
        }`}
      >
        {label}
      </button>

      {start && (
        <button
          type="button"
          aria-label="Clear date"
          onClick={(event) => {
            event.stopPropagation();
            onChange("", "");
            setOpen(false);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-lg leading-none text-gray-500"
        >
          ×
        </button>
      )}

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={goPrevMonth}
              className="rounded px-3 py-1 text-gray-700 hover:bg-gray-100"
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={goNextMonth}
              disabled={atCurrentMonth}
              className="rounded px-3 py-1 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-gray-500">
            {weekdayNames.map((name) => (
              <div key={name} className="py-1">
                {name}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
            {cells.map((dateStr, index) => {
              if (!dateStr) {
                return <div key={`blank-${index}`} />;
              }

              const isFuture = dateStr > today;
              const isStart = dateStr === start;
              const isEnd = dateStr === end;
              const inRange = start && end && dateStr > start && dateStr < end;

              let style = "text-gray-800 hover:bg-blue-50";
              if (isFuture) {
                style = "cursor-not-allowed text-gray-300";
              } else if (isStart || isEnd) {
                style = "bg-blue-600 text-white";
              } else if (inRange) {
                style = "bg-blue-100 text-blue-800";
              }

              return (
                <button
                  type="button"
                  key={dateStr}
                  disabled={isFuture}
                  onClick={() => pick(dateStr)}
                  className={`mx-auto h-8 w-8 rounded-full ${style} ${
                    dateStr === today && !isStart && !isEnd ? "font-bold" : ""
                  }`}
                >
                  {Number(dateStr.slice(8, 10))}
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Click a date, then click another date for a range. Click the same
            date again for a single day.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ParcelsPage() {
  const router = useRouter();
  const [initializing, setInitializing] = useState(true);
  const [role, setRole] = useState(null);
  const [initError, setInitError] = useState("");
  const [stores, setStores] = useState([]);
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingRows, setLoadingRows] = useState(false);
  const [rowsError, setRowsError] = useState("");

  const canView = !initializing && allowedRoles.includes(role);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (cancelled) return;

      if (profileError) {
        setInitError(profileError.message);
        setInitializing(false);
        return;
      }

      const userRole = profileData ? profileData.role : null;

      if (allowedRoles.includes(userRole)) {
        const { data: storeData } = await supabase
          .from("stores")
          .select("id, name")
          .order("name", { ascending: true });
        if (cancelled) return;
        setStores(storeData ?? []);
      }

      setRole(userRole);
      setInitializing(false);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) =>
        JSON.stringify(prev) === JSON.stringify(draft) ? prev : { ...draft }
      );
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    if (!canView) return;
    let cancelled = false;

    async function loadRows() {
      setLoadingRows(true);
      setRowsError("");

      let query = supabase
        .from("parcels")
        .select(
          "id, consignment_id, merchant_order_id, recipient_name, recipient_phone, recipient_address, city, zone, status, cod_amount, delivery_fee, fee_payment_status, product_type, created_at, stores(name)",
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      const consignment = cleanConsignment(filters.consignmentId);
      if (consignment) {
        query = query.ilike("consignment_id", `%${consignment}%`);
      }

      const term = cleanSearch(filters.search);
      if (term) {
        query = query.or(
          `recipient_name.ilike.*${term}*,recipient_phone.ilike.*${term}*`
        );
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.storeId) {
        query = query.eq("store_id", filters.storeId);
      }
      if (filters.dateFrom) {
        const endDate = filters.dateTo || filters.dateFrom;
        query = query
          .gte(
            "created_at",
            new Date(`${filters.dateFrom}T00:00:00+06:00`).toISOString()
          )
          .lte(
            "created_at",
            new Date(`${endDate}T23:59:59.999+06:00`).toISOString()
          );
      }

      const startIndex = (page - 1) * PAGE_SIZE;
      const { data, error, count } = await query.range(
        startIndex,
        startIndex + PAGE_SIZE - 1
      );
      if (cancelled) return;

      if (error) {
        setRowsError(error.message);
        setRows([]);
        setTotal(0);
      } else {
        setRows(data ?? []);
        setTotal(count ?? 0);
      }
      setLoadingRows(false);
    }

    loadRows();

    return () => {
      cancelled = true;
    };
  }, [canView, filters, page]);

  function updateDraft(event) {
    const { name, value } = event.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();
    setPage(1);
    setFilters((prev) =>
      JSON.stringify(prev) === JSON.stringify(draft) ? prev : { ...draft }
    );
  }

  function resetFilters() {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
  }

  function updateDates(from, to) {
    setDraft((prev) => ({ ...prev, dateFrom: from, dateTo: to }));
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (initializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-50">
        <p className="text-gray-600">লোড হচ্ছে...</p>
      </main>
    );
  }

  if (!canView) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-blue-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
          <h1 className="mb-3 text-xl font-bold text-blue-700">
            পার্সেল তালিকা
          </h1>
          {initError ? (
            <p className="mb-4 text-red-600">সমস্যা: {initError}</p>
          ) : (
            <p className="mb-4 text-gray-700">
              এই পেজ দেখার অনুমতি আপনার অ্যাকাউন্টের নেই।
            </p>
          )}
          <Link href="/dashboard" className="text-blue-600 underline">
            ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">পার্সেল তালিকা</h1>
            <p className="text-sm text-gray-600">মোট {total}টি পার্সেল</p>
          </div>
          <div className="flex gap-3">
            {role === "merchant" && (
              <Link
                href="/parcels/new"
                className="rounded bg-blue-600 px-4 py-2 font-semibold text-white"
              >
                নতুন পার্সেল
              </Link>
            )}
            <Link
              href="/dashboard"
              className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700"
            >
              ড্যাশবোর্ড
            </Link>
          </div>
        </div>

        <form
          onSubmit={applyFilters}
          className="mb-6 rounded-xl bg-white p-4 shadow"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <IconBox icon={<SearchIcon />}>
              <input
                name="consignmentId"
                type="text"
                aria-label="Consignment ID"
                placeholder="Consignment ID"
                value={draft.consignmentId}
                onChange={updateDraft}
                className={`${inputBase} pr-3 text-gray-900 placeholder:text-gray-400`}
              />
            </IconBox>

            <IconBox icon={<SearchIcon />}>
              <input
                name="search"
                type="text"
                aria-label="Recipient Name or Phone"
                placeholder="Recipient Name/Phone"
                value={draft.search}
                onChange={updateDraft}
                className={`${inputBase} pr-3 text-gray-900 placeholder:text-gray-400`}
              />
            </IconBox>

            <IconBox icon={<StatusIcon />}>
              <select
                name="status"
                aria-label="Order Status"
                value={draft.status}
                onChange={updateDraft}
                className={`${inputBase} pr-3 ${
                  draft.status === "" ? "text-gray-400" : "text-gray-900"
                }`}
              >
                <option value="">Order Status</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value} className="text-gray-900">
                    {label}
                  </option>
                ))}
              </select>
            </IconBox>

            <IconBox icon={<StoreIcon />}>
              <select
                name="storeId"
                aria-label="Store Name"
                value={draft.storeId}
                onChange={updateDraft}
                className={`${inputBase} pr-3 ${
                  draft.storeId === "" ? "text-gray-400" : "text-gray-900"
                }`}
              >
                <option value="">Store Name</option>
                {stores.map((store) => (
                  <option
                    key={store.id}
                    value={store.id}
                    className="text-gray-900"
                  >
                    {store.name}
                  </option>
                ))}
              </select>
            </IconBox>

            <DateRangePicker
              start={draft.dateFrom}
              end={draft.dateTo}
              onChange={updateDates}
            />

            <div className="flex items-center">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded border border-gray-300 bg-white px-5 py-2 text-gray-700"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {rowsError && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            তালিকা আনতে সমস্যা: {rowsError}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full min-w-[900px] text-left text-sm text-gray-800">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">ট্র্যাকিং নম্বর</th>
                <th className="px-4 py-3">স্টোর</th>
                <th className="px-4 py-3">প্রাপক</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3">টাকা</th>
                <th className="px-4 py-3">চার্জ পরিশোধ</th>
                <th className="px-4 py-3">বুকিং</th>
                <th className="px-4 py-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className={loadingRows ? "opacity-60" : ""}>
              {loadingRows && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    লোড হচ্ছে...
                  </td>
                </tr>
              )}

              {!loadingRows && rows.length === 0 && !rowsError && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    কোনো পার্সেল পাওয়া যায়নি।
                  </td>
                </tr>
              )}

              {rows.map((row) => (
                <tr key={row.id} className="border-b align-top last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{row.consignment_id}</div>
                    <div className="text-xs text-gray-500">
                      {row.product_type === "document" ? "ডকুমেন্ট" : "পার্সেল"}
                    </div>
                    {row.merchant_order_id && (
                      <div className="text-xs text-gray-500">
                        অর্ডার: {row.merchant_order_id}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStoreName(row)}</td>
                  <td className="max-w-xs px-4 py-3">
                    <div className="font-semibold">{row.recipient_name}</div>
                    <div className="break-words text-gray-600">
                      {row.recipient_address}
                    </div>
                    <div className="text-gray-600">{row.recipient_phone}</div>
                    {(row.city || row.zone) && (
                      <div className="text-xs text-gray-500">
                        {[row.city, row.zone].filter(Boolean).join(" / ")}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                        statusStyles[row.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabels[row.status] ?? row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>COD: ৳ {row.cod_amount}</div>
                    <div className="text-gray-600">
                      চার্জ: ৳ {row.delivery_fee}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                        row.fee_payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.fee_payment_status === "paid" ? "পরিশোধিত" : "বকেয়া"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/parcels/${row.id}`}
                      className="rounded border border-blue-600 px-3 py-1 text-blue-600"
                    >
                      দেখুন
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            পৃষ্ঠা {page} / {totalPages}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={page <= 1 || loadingRows}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 disabled:opacity-50"
            >
              আগের
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loadingRows}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 disabled:opacity-50"
            >
              পরের
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}