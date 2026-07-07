"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("회원가입 완료! 이메일 확인 후 로그인하세요.");
    }

    setLoading(false);
  }

  async function signIn() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.push("/");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <input
        type="email"
        placeholder="이메일"
        className="w-full rounded border p-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="비밀번호"
        className="w-full rounded border p-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {message && <p className="text-sm text-red-600">{message}</p>}

      <button
        onClick={signIn}
        disabled={loading}
        className="w-full rounded bg-red-600 py-3 font-bold text-white"
      >
        로그인
      </button>

      <button
        onClick={signUp}
        disabled={loading}
        className="w-full rounded border py-3 font-bold"
      >
        회원가입
      </button>
    </div>
  );
}