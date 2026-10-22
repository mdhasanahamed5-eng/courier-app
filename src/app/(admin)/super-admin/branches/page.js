"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura",
  "Brahmanbaria", "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga",
  "Cox's Bazar", "Cumilla", "Dhaka", "Dinajpur", "Faridpur", "Feni",
  "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jashore",
  "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj",
  "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura",
  "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon",
  "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari",
  "Noakhali", "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari",
  "Rajshahi", "Rangamati", "Rangpur", "Satkhira", "Shariatpur", "Sherpur",
  "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon",
];

const UPAZILAS = {
  Dhaka: ["Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar", "Dhanmondi", "Mirpur", "Uttara", "Gulshan", "Mohammadpur", "Banani", "Motijheel", "Ramna", "Badda", "Khilgaon"],
  Gazipur: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
  Narayanganj: ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"],
  Chattogram: ["Anwara", "Banshkhali", "Boalkhali", "Fatikchhari", "Hathazari", "Patiya", "Raozan", "Sitakunda"],
  Sylhet: ["Balaganj", "Beanibazar", "Sylhet Sadar", "Golapganj"],
  Rajshahi: ["Bagha", "Rajshahi Sadar", "Paba", "Puthia"],
  Khulna: ["Batiaghata", "Khulna Sadar", "Dumuria", "Koyra"],
};

const BRANCH_TYPES = ["Parent", "Sub Branch", "Hub", "Pickup Point"];

function SearchableSelect({ label, placeholder, options, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className="flex w-full items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-left text-sm disabled:bg-gray-100 disabled:text-gray-400"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <span className="text-gray-400">▼</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full border-b px-3 py-2 text-sm outline-none"
            autoFocus
          />
          <div className="max-h-48 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">No results</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BranchesContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    branch_type: "",
    district: "",
    area: "",
    phone: "",
    email: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBranches();
  }, []);

  function loadAreasForDistrict(districtName) {
    const list = UPAZILAS[districtName] || [`${districtName} Sadar`];
    setAreas(list);
  }

  async function loadBranches() {
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

    const { data, error: branchError } = await supabase
      .from("branches")
      .select("*")
      .order("created_at", { ascending: false });

    if (branchError) {
      setBranches([]);
    } else {
      setBranches(data || []);
    }

    setLoading(false);
  }

  async function handleAddBranch(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("branches").insert({
      name: form.name,
      address: form.address,
      branch_type: form.branch_type,
      district: form.district,
      area: form.area,
      phone: form.phone,
      email: form.email,
    });

    if (error) {
      setMessage("এরর: " + error.message);
    } else {
      setMessage("Branch সফলভাবে যোগ হয়েছে!");
      setForm({
        name: "",
        address: "",
        branch_type: "",
        district: "",
        area: "",
        phone: "",
        email: "",
        password: "",
      });
      setAreas([]);
      setShowForm(false);
      await loadBranches();
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
          <Link href="/super-admin/branches" className="flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium">Branches</Link>
         
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
            <h2 className="text-2xl font-bold text-gray-900">Branches</h2>
            <p className="text-sm text-gray-500">সব ব্রাঞ্চের তালিকা</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            {showForm ? "বাতিল" : "+ Create New Branch"}
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
        )}

        {showForm && (
          <form onSubmit={handleAddBranch} className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-teal-600 px-5 py-3 text-white">
              <h3 className="font-semibold">Create New Branch</h3>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Branch Name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Branch Address"
                />
              </div>

              <SearchableSelect
                label="Branch Type"
                placeholder="Select Type"
                options={BRANCH_TYPES}
                value={form.branch_type}
                onChange={(v) => setForm({ ...form, branch_type: v })}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SearchableSelect
                  label="Districts"
                  placeholder="Select District"
                  options={DISTRICTS}
                  value={form.district}
                  onChange={(v) => {
                    setForm({ ...form, district: v, area: "" });
                    loadAreasForDistrict(v);
                  }}
                />
                <SearchableSelect
                  label="Area"
                  placeholder={form.district ? "Select Area" : "Select district first"}
                  options={areas}
                  value={form.area}
                  onChange={(v) => setForm({ ...form, area: v })}
                  disabled={!form.district}
                />
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
                    placeholder="Branch Contact Number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
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
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Password"
                  />
                </div>
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
                  onClick={() => {
                    setForm({
                      name: "",
                      address: "",
                      branch_type: "",
                      district: "",
                      area: "",
                      phone: "",
                      email: "",
                      password: "",
                    });
                    setAreas([]);
                  }}
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
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">District</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {branches.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                        কোনো Branch নেই।
                      </td>
                    </tr>
                  ) : (
                    branches.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{b.name || "—"}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{b.branch_type || "—"}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{b.district || "—"}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{b.phone || "—"}</td>
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

export default function BranchesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-100"><p>লোড হচ্ছে...</p></div>}>
      <BranchesContent />
    </Suspense>
  );
}