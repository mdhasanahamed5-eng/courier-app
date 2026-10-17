import { Suspense } from "react";
import { connection } from "next/server";
import { supabase } from "@/lib/supabase";

async function TestMessages() {
  await connection();

  const { data, error } = await supabase
    .from("connection_test")
    .select("id, message");

  if (error) {
    return <p className="mt-4 text-red-600">সংযোগে সমস্যা: {error.message}</p>;
  }

  if (!data || data.length === 0) {
    return <p className="mt-4 text-gray-600">টেবিলে কোনো ডেটা পাওয়া যায়নি</p>;
  }

  return (
    <ul className="mt-4 text-green-700">
      {data.map((row) => (
        <li key={row.id}>{row.message}</li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-blue-50">
      <h1 className="text-4xl font-bold text-blue-700">
        আমার কুরিয়ার সফটওয়্যার
      </h1>

      <Suspense fallback={<p className="mt-4 text-gray-500">লোড হচ্ছে...</p>}>
        <TestMessages />
      </Suspense>
    </main>
  );
}