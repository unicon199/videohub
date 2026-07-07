"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "latest");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseClient();

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
    }

    getUser();
  }, []);

  function moveToSearch(nextKeyword: string, nextSort: string) {
    const trimmed = nextKeyword.trim();
    const params = new URLSearchParams();

    if (trimmed) params.set("q", trimmed);
    if (nextSort !== "latest") params.set("sort", nextSort);

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  }

  function handleSearch() {
    moveToSearch(keyword, sort);
  }

  function handleSort(value: string) {
    setSort(value);
    moveToSearch(keyword, value);
  }

  async function handleLogout() {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <h1
        onClick={() => router.push("/")}
        className="cursor-pointer text-2xl font-bold text-red-600"
      >
        VideoHub
      </h1>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="영상을 검색하세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="w-[420px] rounded-full border border-black px-6 py-2 outline-none"
        />

        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          className="rounded-full border border-black px-4 py-2"
        >
          <option value="latest">최신순</option>
          <option value="views">조회수순</option>
          <option value="likes">좋아요순</option>
        </select>
      </div>

      {email ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/upload")}
            className="rounded bg-red-600 px-5 py-3 font-bold text-white"
          >
            + 업로드
          </button>

          <span
  onClick={() => router.push("/mypage")}
  className="cursor-pointer text-sm text-gray-600 hover:underline"
>
  {email}
</span>

          <button
            onClick={handleLogout}
            className="rounded bg-gray-800 px-5 py-3 font-bold text-white"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <button
          onClick={() => router.push("/login")}
          className="rounded bg-red-600 px-6 py-3 font-bold text-white"
        >
          로그인
        </button>
      )}
    </header>
  );
}