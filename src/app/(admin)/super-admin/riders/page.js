"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Search, Plus, Filter, Edit, Trash2, Download, Printer, Upload, 
  ChevronDown, ChevronRight, X, UserPlus 
} from 'lucide-react';

// --- Constants ---
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
  Dhaka: ["Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar", "Uttara", "Mirpur", "Gulshan", "Banani"],
  // ... (আপনার বাকি সব Upazilas এখানে থাকবে, আমি কোড ছোট করার জন্য কমিয়েছি, আপনি আপনার আগের লিস্টটি এখানে বসিয়ে নেবেন)
};

// --- Helper Component: SearchableSelect ---
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

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={ref}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{value || placeholder}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full border-b px-3 py-2 text-sm outline-none focus:bg-gray-50"
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
                  onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
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

// --- Main Content Component ---
function RidersContent() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [riders, setRiders] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [areas, setAreas] = useState([]);
  const [branches] = useState(["Dhanmondi", "Mirpur", "Uttara", "Gulshan", "Mohammadpur", "Banani", "Motijheel", "Ramna"]);
  
  const [form, setForm] = useState({
    full_name: "", address: "", district: "", area: "", branch: "", phone: "", email: "", password: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { loadRiders(); }, []);

  function loadAreasForDistrict(districtName) {
    const list = UPAZILAS[districtName] || [`${districtName} Sadar`];
    setAreas(list);
  }

  async function loadRiders() {
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) { router.replace("/login"); return; }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
    if (!profile || profile.role !== "super_admin") {
      setError("শুধুমাত্র Super Admin এই পেজ দেখতে পারবেন।");
      setLoading(false);
      return;
    }

    const { data, error: ridersError } = await supabase.from("profiles").select("*").eq("role", "rider").order("created_at", { ascending: false });
    if (ridersError) setError(ridersError.message); else setRiders(data || []);
    setLoading(false);
  }

  async function handleAddRider(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (signUpError) { setMessage("এরর: " + signUpError.message); setSaving(false); return; }
    const userId = signUpData.user?.id;
    const { error: profileError } = await supabase.from("profiles").upsert({ id: userId, role: "rider", full_name: form.full_name, phone: form.phone });
    if (profileError) setMessage("প্রোফাইল এরর: " + profileError.message);
    else {
      setMessage("রাইডার সফলভাবে যোগ হয়েছে!");
      setForm({ full_name: "", address: "", district: "", area: "", branch: "", phone: "", email: "", password: "" });
      setShowForm(false);
      await loadRiders();
    }
    setSaving(false);
  }

  const handlePrint = () => window.print();
  const handleBulkImport = () => fileInputRef.current.click();
  const handleExportCSV = () => {
    const headers = ["ID,Name,Phone,Joined,Status\n"];
    const rows = riders.map(r => `${r.id},${r.full_name},${r.phone || ''},${r.created_at},${r.status || 'Active'}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers.join("") + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "riders_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRiders = riders.filter(rider => 
    (rider.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rider.phone || '').includes(searchTerm) ||
    (rider.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>;
  if (error) return <div className="flex h-full items-center justify-center text-red-600 font-medium">{error}</div>;

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={(e) => alert(`File selected: ${e.target.files[0].name}`)} className="hidden" accept=".csv, .xlsx" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rider Management</h1>
          <p className="text-sm text-gray-500">Home / Super Admin / <span className="text-slate-800 font-medium">Riders</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleBulkImport} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Upload size={16} /> Bulk Import
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
            <Plus size={18} /> Add Rider
          </button>
        </div>
      </div>

      {/* Form Modal (Professionally Styled) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserPlus size={20} />
                <h3 className="font-bold">Create New Rider</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddRider} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Rider Name" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Contact Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">+88</span>
                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-r border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Phone Number" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Rider Address" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchableSelect label="District" placeholder="Select District" options={DISTRICTS} value={form.district} onChange={(v) => { setForm({ ...form, district: v, area: "" }); loadAreasForDistrict(v); }} />
                <SearchableSelect label="Area" placeholder={form.district ? "Select Area" : "Select district first"} options={areas} value={form.area} onChange={(v) => setForm({ ...form, area: v })} disabled={!form.district} />
              </div>

              <SearchableSelect label="Branch" placeholder="Select Branch" options={branches} value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Password" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50">
                  {saving ? "Creating..." : "Create Rider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400"><Search size={18} /></span>
          <input type="text" placeholder="Search by name, phone or ID..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all"><Filter size={16} /> Filter</button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all"><Download size={16} /> Export CSV</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr className="uppercase text-[11px] tracking-wider">
                <th className="px-6 py-4">Rider ID</th>
                <th className="px-6 py-4">Rider Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRiders.length > 0 ? (
                filteredRiders.map((rider) => (
                  <tr key={rider.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">{rider.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{rider.full_name || "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{rider.phone || "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{rider.created_at ? new Date(rider.created_at).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16} /></button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No riders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function RidersPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-gray-500">Loading...</div>}>
      <RidersContent />
    </Suspense>
  );
}
