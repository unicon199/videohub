"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

type Profile = {
  username: string | null;
  avatar_url: string | null;
};

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "latest");
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createSupabaseClient();

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        setProfile(profileData);
      }
    }

    getUser();
  }, []);

  const displayName = profile?.username ?? email?.split("@")[0] ?? "사용자";

  function moveToSearch(nextKeyword: string, nextSort: string) {
    const trimmed = nextKeyword.trim();
    const currentCategory = searchParams.get("category");

    const params = new URLSearchParams();

    if (trimmed) params.set("q", trimmed);
    if (nextSort !== "latest") params.set("sort", nextSort);
    if (currentCategory) params.set("category", currentCategory);

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
            onClick={() => router.push("/history")}
            className="rounded bg-gray-100 px-5 py-3 font-bold text-gray-800 hover:bg-gray-200"
          >
            시청기록
          </button>

          <button
            onClick={() => router.push("/upload")}
            className="rounded bg-red-600 px-5 py-3 font-bold text-white"
          >
            + 업로드
          </button>

          <button
            onClick={() => router.push("/mypage")}
            className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="내 프로필 사진"
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}

            <span className="max-w-[120px] truncate text-sm font-bold text-gray-700">
              {displayName}
            </span>
          </button>

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