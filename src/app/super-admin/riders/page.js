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
  "Uttara Sector-13", "Uttara Sector-14", "Uttara Sector-15", "Uttara Sector-16",
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

function RidersContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [riders, setRiders] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [areas, setAreas] = useState([]);
  const [branches] = useState(["Dhanmondi", "Mirpur", "Uttara", "Gulshan", "Mohammadpur", "Banani", "Motijheel", "Ramna"]);
  const [form, setForm] = useState({
    full_name: "",
    address: "",
    district: "",
    area: "",
    branch: "",
    phone: "",
    email: "",
    password: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRiders();
  }, []);

  function loadAreasForDistrict(districtName) {
    const list = UPAZILAS[districtName] || [`${districtName} Sadar`];
    setAreas(list);
  }

  async function loadRiders() {
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

    const { data, error: ridersError } = await supabase
      .from("profiles")
      .select("id, full_name, company_id, created_at")
      .eq("role", "rider")
      .order("created_at", { ascending: false });

    if (ridersError) {
      setError(ridersError.message);
    } else {
      setRiders(data || []);
    }

    setLoading(false);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    setImageError("");
    setImageFile(null);

    if (!file) return;

    if (file.size > 300 * 1024) {
      setImageError("ছবির সাইজ 300 KB এর বেশি হতে পারবে না।");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("শুধু ছবি ফাইল আপলোড করা যাবে।");
      e.target.value = "";
      return;
    }

    setImageFile(file);
  }

  async function handleAddRider(e) {
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
      role: "rider",
      full_name: form.full_name,
    });

    if (profileError) {
      setMessage("প্রোফাইল এরর: " + profileError.message);
    } else {
      setMessage("রাইডার সফলভাবে যোগ হয়েছে!");
      setForm({
        full_name: "",
        address: "",
        district: "",
        area: "",
        branch: "",
        phone: "",
        email: "",
        password: "",
      });
      setAreas([]);
      setImageFile(null);
      setShowForm(false);
      await loadRiders();
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
          <Link href="/super-admin" className="flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800">
            Home
          </Link>
          <div className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Parcel</div>
          <Link href="/admin/parcels" className="flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800">
            All Parcels
          </Link>
          <div className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Management</div>
          <Link href="/super-admin/riders" className="flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium">
            Riders
          </Link>
          <Link href="/super-admin/merchants" className="flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800">
            Merchants
          </Link>
          <Link href="/super-admin/stores" className="flex items-center rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800">
            Stores
          </Link>
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
            <h2 className="text-2xl font-bold text-gray-900">Riders</h2>
            <p className="text-sm text-gray-500">সব রাইডারের তালিকা</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            {showForm ? "বাতিল" : "+ Create New Rider"}
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
        )}

        {showForm && (
          <form onSubmit={handleAddRider} className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-teal-600 px-5 py-3 text-white">
              <h3 className="font-semibold">Create New Rider</h3>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Rider Name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Rider Address"
                />
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

              <SearchableSelect
                label="Branch"
                placeholder="Select Branch"
                options={branches}
                value={form.branch}
                onChange={(v) => setForm({ ...form, branch: v })}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Contact Number</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                    +88
                  </span>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-r border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Rider Contact Number"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
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
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Password"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">ছবির সাইজ সর্বোচ্চ 300 KB</p>
                {imageError && <p className="mt-1 text-xs text-red-600">{imageError}</p>}
                {imageFile && (
                  <p className="mt-1 text-xs text-green-600">
                    Selected: {imageFile.name} ({Math.round(imageFile.size / 1024)} KB)
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || !!imageError}
                  className="rounded bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      full_name: "",
                      address: "",
                      district: "",
                      area: "",
                      branch: "",
                      phone: "",
                      email: "",
                      password: "",
                    });
                    setAreas([]);
                    setImageFile(null);
                    setImageError("");
                  }}
                  className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        )}

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
                {riders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                      কোনো রাইডার নেই
                    </td>
                  </tr>
                ) : (
                  riders.map((rider) => (
                    <tr key={rider.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {rider.full_name || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {rider.company_id ? rider.company_id.slice(0, 8) + "..." : "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {rider.created_at
                          ? new Date(rider.created_at).toLocaleDateString("bn-BD")
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RidersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <p>লোড হচ্ছে...</p>
        </div>
      }
    >
      <RidersContent />
    </Suspense>
  );
}