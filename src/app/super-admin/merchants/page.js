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
  Bagerhat: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
  Bandarban: ["Bandarban Sadar", "Thanchi", "Lama", "Naikhongchhari", "Ali Kadam", "Rowangchhari", "Ruma"],
  Barguna: ["Barguna Sadar", "Amtali", "Bamna", "Betagi", "Patharghata", "Taltali"],
  Barishal: ["Barishal Sadar", "Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gaurnadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"],
  Bhola: ["Bhola Sadar", "Borhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
  Bogura: ["Bogura Sadar", "Adamdighi", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatola"],
  Brahmanbaria: ["Brahmanbaria Sadar", "Akhaura", "Bancharampur", "Kasba", "Nabinagar", "Nasirnagar", "Sarail", "Ashuganj", "Bijoynagar"],
  Chandpur: ["Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"],
  Chapainawabganj: ["Chapainawabganj Sadar", "Bholahat", "Gomastapur", "Nachole", "Shibganj"],
  Chattogram: ["Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Hathazari", "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda", "Karnaphuli"],
  Chuadanga: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],
  "Cox's Bazar": ["Cox's Bazar Sadar", "Chakaria", "Kutubdia", "Maheshkhali", "Ramu", "Teknaf", "Ukhia", "Pekua"],
  Cumilla: ["Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Muradnagar", "Nangalkot", "Cumilla Sadar", "Meghna", "Titas", "Monohargonj"],
  Dhaka: [
    "Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar",
    "Uttara Sector-1", "Uttara Sector-2", "Uttara Sector-3", "Uttara Sector-4",
    "Uttara Sector-5", "Uttara Sector-6", "Uttara Sector-7", "Uttara Sector-8",
    "Uttara Sector-9", "Uttara Sector-10", "Uttara Sector-11", "Uttara Sector-12",
    "Uttara Sector-13", "Uttara Sector-14", "Uত্তরা Sector-15", "Uttara Sector-16",
    "Uttara Sector-17", "Uttara Sector-18",
    "Mirpur-1", "Mirpur-2", "Mirpur-6", "Mirpur-7", "Mirpur-10", "Mirpur-11",
    "Mirpur-12", "Mirpur-13", "Mirpur-14",
    "Kalshi", "Pallabi", "Rupnagar", "Bauniabad", "Bhashantek", "Matikata",
    "Khilkhet", "Kuril", "Nikunja", "Joar Sahara",
    "Gulshan", "Banani", "Baridhara", "Mohakhali", "Niketan",
    "Badda", "Rampura", "Ulon",
    "Tejgaon", "Tejgaon Industrial Area", "Nakhalpara", "Eskaton", "Mogbazar", "Nayatola",
    "Gabtoli", "Golartek", "Bagbari", "Darus Salam", "Kalyanpur", "Paikpara",
    "Shah Ali", "Kazipara", "Shewrapara", "Kafrul", "Ibrahimpur",
    "Mohammadpur", "Adabor", "Shyamoli", "Agargaon", "Lalmatia", "Rayer Bazar",
    "Kawran Bazar", "Rajabazar", "Farmgate", "Hatirjheel", "Sher-e-Bangla Nagar",
    "Uttarkhan", "Dakkhan Khan", "Bhatara", "Beraid", "Dumuni", "Aftabnagar", "Bashundhara", "Satarkul",
    "Dhanmondi", "Kalabagan", "New Market", "Shahbag", "Ramna", "Nilkhet",
    "Segunbagicha", "Hatirpul", "Banglamotor", "Paribagh",
    "Khilgaon", "Basabo", "Sabujbag", "Mugda", "Goran", "Meradia",
    "Motijheel", "Paltan", "Shahjahanpur", "Malibagh",
    "Hazaribagh", "Azimpur", "Lalbagh", "Kamrangirchar", "Bangshal", "Kotwali",
    "Sutrapur", "Chawkbazar", "Wari", "Gendaria",
    "Jatrabari", "Sayedabad", "Shyampur", "Demra", "Sarulia", "Matuail",
    "Donia", "Kadamtali", "Postogola", "Nurpur", "Islambagh",
    "Sadarghat", "Banglabazar", "Gulistan", "Arambagh", "Fakirapul", "Kakrail",
    "Shantinagar", "Kamalapur", "Jigatola"
  ],
  Dinajpur: ["Dinajpur Sadar", "Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Phulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"],
  Faridpur: ["Faridpur Sadar", "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"],
  Feni: ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi", "Fulgazi"],
  Gaibandha: ["Gaibandha Sadar", "Fulchhari", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"],
  Gazipur: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
  Gopalganj: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
  Habiganj: ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniyachong", "Chunarughat", "Lakhai", "Madhabpur", "Nabiganj", "Shaistaganj"],
  Jamalpur: ["Jamalpur Sadar", "Baksiganj", "Dewanganj", "Islampur", "Madarganj", "Melandaha", "Sarishabari"],
  Jashore: ["Jashore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
  Jhalokati: ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
  Jhenaidah: ["Jhenaidah Sadar", "Harinakunda", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
  Joypurhat: ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"],
  Khagrachhari: ["Khagrachhari Sadar", "Dighinala", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"],
  Khulna: ["Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgachha", "Phultala", "Rupsa", "Terokhada", "Khulna Sadar"],
  Kishoreganj: ["Kishoreganj Sadar", "Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"],
  Kurigram: ["Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari", "Phulbari", "Nageshwari", "Rajarhat", "Raomari", "Ulipur"],
  Kushtia: ["Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Mirpur"],
  Lakshmipur: ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"],
  Lalmonirhat: ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"],
  Madaripur: ["Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar"],
  Magura: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
  Manikganj: ["Manikganj Sadar", "Daulatpur", "Ghior", "Harirampur", "Saturia", "Shivalaya", "Singair"],
  Meherpur: ["Meherpur Sadar", "Gangni", "Mujibnagar"],
  Moulvibazar: ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"],
  Munshiganj: ["Munshiganj Sadar", "Gazaria", "Lohajang", "Sirajdikhan", "Sreenagar", "Tongibari"],
  Mymensingh: ["Bhaluka", "Dhobaura", "Fulbaria", "Gafargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Mymensingh Sadar", "Nandail", "Phulpur", "Trishal"],
  Naogaon: ["Naogaon Sadar", "Atrai", "Badalgachhi", "Manda", "Dhamoirhat", "Mohadevpur", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"],
  Narail: ["Narail Sadar", "Kalia", "Lohagara"],
  Narayanganj: ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"],
  Narsingdi: ["Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura", "Shibpur"],
  Natore: ["Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Singra", "Naldanga"],
  Netrokona: ["Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Kalmakanda", "Kendua", "Madan", "Mohanganj", "Purbadhala"],
  Nilphamari: ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Saidpur"],
  Noakhali: ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Senbagh", "Sonaimuri", "Subarnachar", "Kabirhat"],
  Pabna: ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"],
  Panchagarh: ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"],
  Patuakhali: ["Patuakhali Sadar", "Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Dumki", "Rangabali"],
  Pirojpur: ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Indurkani"],
  Rajbari: ["Rajbari Sadar", "Baliakandi", "Goalandaghat", "Pangsha", "Kalukhali"],
  Rajshahi: ["Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore", "Rajshahi Sadar"],
  Rangamati: ["Rangamati Sadar", "Bagaichhari", "Barkal", "Kawkhali", "Belaichhari", "Kaptai", "Juraichhari", "Langadu", "Naniarchar", "Rajasthali"],
  Rangpur: ["Badarganj", "Gangachara", "Kaunia", "Rangpur Sadar", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"],
  Satkhira: ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"],
  Shariatpur: ["Shariatpur Sadar", "Naria", "Zajira", "Gosairhat", "Bhedarganj", "Damudya"],
  Sherpur: ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"],
  Sirajganj: ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Tarash", "Ullahpara"],
  Sunamganj: ["Sunamganj Sadar", "Bishwamvarpur", "Chhatak", "Derai", "Dharamapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur", "South Sunamganj"],
  Sylhet: ["Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Sylhet Sadar", "Zakiganj", "South Surma"],
  Tangail: ["Tangail Sadar", "Basail", "Bhuapur", "Delduar", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Dhanbari"],
  Thakurgaon: ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"],
};

const BRANCHES = ["Dhanmondi", "Mirpur", "Uttara", "Gulshan", "Mohammadpur", "Banani", "Motijheel", "Ramna"];

function SearchableSelect({ label, placeholder, options, value, onChange, disabled, required }) {
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
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
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

function MerchantsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [merchants, setMerchants] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState({
    company_name: "",
    full_name: "",
    address: "",
    business_address: "",
    district: "",
    area: "",
    branch: "",
    phone: "",
    facebook: "",
    website: "",
    email: "",
    password: "",
    inside_city_cod: "0",
    sub_city_cod: "0",
    outside_city_cod: "0",
    inside_city_charge: "70",
    sub_city_charge: "90",
    outside_city_charge: "120",
    inside_city_return: "",
    sub_city_return: "",
    outside_city_return: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMerchants();
  }, []);

  function loadAreasForDistrict(districtName) {
    const list = UPAZILAS[districtName] || [`${districtName} Sadar`];
    setAreas(list);
  }

  async function loadMerchants() {
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

    const { data, error: merchantsError } = await supabase
      .from("profiles")
      .select("id, full_name, company_id, created_at")
      .eq("role", "merchant")
      .order("created_at", { ascending: false });

    if (merchantsError) {
      setError(merchantsError.message);
    } else {
      setMerchants(data || []);
    }

    setLoading(false);
  }

  async function handleAddMerchant(e) {
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
      role: "merchant",
      full_name: form.full_name,
    });

    if (profileError) {
      setMessage("প্রোফাইল এরর: " + profileError.message);
    } else {
      setMessage("মার্চেন্ট সফলভাবে যোগ হয়েছে!");
      setShowForm(false);
      setAreas([]);
      await loadMerchants();
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
          <Link href="/super-admin/merchants" className="flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium">Merchants</Link>
          <Link href="/super-admin/stores" className="flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800">Stores</Link>
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
            <h2 className="text-2xl font-bold text-gray-900">Merchants</h2>
            <p className="text-sm text-gray-500">সব মার্চেন্টের তালিকা</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            {showForm ? "বাতিল" : "+ Create New Merchant"}
          </button>
        </div>

        {message && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>}

        {showForm && (
          <form onSubmit={handleAddMerchant} className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-teal-600 px-5 py-3 text-white">
              <h3 className="font-semibold">Create New Merchant</h3>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Company Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Company Name" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Merchant Name" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Full Address <span className="text-red-500">*</span></label>
                  <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Merchant Address" rows={2} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Business Address</label>
                  <textarea value={form.business_address} onChange={(e) => setForm({ ...form, business_address: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Business Address" rows={2} />
                </div>
              </div>

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
                  required
                />
                <SearchableSelect
                  label="Area"
                  placeholder={form.district ? "Select Area" : "Select district first"}
                  options={areas}
                  value={form.area}
                  onChange={(v) => setForm({ ...form, area: v })}
                  disabled={!form.district}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SearchableSelect
                  label="Branch"
                  placeholder="Select Branch"
                  options={BRANCHES}
                  value={form.branch}
                  onChange={(v) => setForm({ ...form, branch: v })}
                  required
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Contact Number <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">+88</span>
                    <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-r border border-gray-300 px-3 py-2 text-sm" placeholder="Merchant Contact Number" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Facebook</label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">http://</span>
                    <input type="text" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} className="w-full rounded-r border border-gray-300 px-3 py-2 text-sm" placeholder="Merchant Facebook Url" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Website</label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">http://</span>
                    <input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full rounded-r border border-gray-300 px-3 py-2 text-sm" placeholder="Merchant Website Url" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Image</label>
                  <input type="file" accept="image/*" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Email" />
                </div>
              </div>

              <div className="sm:w-1/2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Password" />
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Service Area COD</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Inside City COD</label>
                    <input type="number" value={form.inside_city_cod} onChange={(e) => setForm({ ...form, inside_city_cod: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Sub City COD</label>
                    <input type="number" value={form.sub_city_cod} onChange={(e) => setForm({ ...form, sub_city_cod: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Outside City COD</label>
                    <input type="number" value={form.outside_city_cod} onChange={(e) => setForm({ ...form, outside_city_cod: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Service Area Delivery Charge</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Inside City Delivery Charge</label>
                    <input type="number" value={form.inside_city_charge} onChange={(e) => setForm({ ...form, inside_city_charge: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Sub City Delivery Charge</label>
                    <input type="number" value={form.sub_city_charge} onChange={(e) => setForm({ ...form, sub_city_charge: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Outside City Delivery Charge</label>
                    <input type="number" value={form.outside_city_charge} onChange={(e) => setForm({ ...form, outside_city_charge: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Service Area Return Charge</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Inside City Return Charge</label>
                    <input type="number" value={form.inside_city_return} onChange={(e) => setForm({ ...form, inside_city_return: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Inside City Return Charge" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Sub City Return Charge</label>
                    <input type="number" value={form.sub_city_return} onChange={(e) => setForm({ ...form, sub_city_return: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Sub City Return Charge" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">Outside City Return Charge</label>
                    <input type="number" value={form.outside_city_return} onChange={(e) => setForm({ ...form, outside_city_return: e.target.value })} className="w-full rounded border border-gray-300 px-3 py-2 text-sm" placeholder="Outside City Return Charge" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">NID Card</label>
                  <input type="file" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Trade License</label>
                  <input type="file" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">TIN Certificate</label>
                  <input type="file" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button type="submit" disabled={saving} className="rounded bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                  {saving ? "Submitting..." : "Submit"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setAreas([]); }} className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
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
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Company ID</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {merchants.length === 0 ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-500">কোনো মার্চেন্ট নেই</td></tr>
                  ) : (
                    merchants.map((merchant) => (
                      <tr key={merchant.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{merchant.full_name || "—"}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{merchant.company_id ? merchant.company_id.slice(0, 8) + "..." : "—"}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{merchant.created_at ? new Date(merchant.created_at).toLocaleDateString("bn-BD") : "—"}</td>
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

export default function MerchantsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-100"><p>লোড হচ্ছে...</p></div>}>
      <MerchantsContent />
    </Suspense>
  );
}