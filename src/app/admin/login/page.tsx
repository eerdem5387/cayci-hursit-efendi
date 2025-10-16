"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [token, setToken] = useState("");
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    document.cookie = `admin_token=${token}; path=/`;
    window.location.href = "/admin";
  };
  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-4 text-2xl font-semibold">Admin Girişi</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          className="rounded-md border border-gray-300 px-3 py-2"
          placeholder="Admin Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button className="rounded-md bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800">Giriş Yap</button>
      </form>
    </div>
  );
}


