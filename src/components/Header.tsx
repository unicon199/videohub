"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

type Profile = {
  username: string | null;
  avatar_url: string | null;
};

type HeaderProps = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "latest");
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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

  useEffect(() => {
    setKeyword(searchParams.get("q") ?? "");
    setSort(searchParams.get("sort") ?? "latest");
  }, [searchParams]);

  const displayName = profile?.username ?? email?.split("@")[0] ?? "사용자";

  function moveToSearch(nextKeyword: string, nextSort: string) {
    const trimmed = nextKeyword.trim();
    const currentCategory = searchParams.get("category");

    const params = new URLSearchParams();

    if (trimmed) {
      params.set("q", trimmed);
    }

    if (nextSort !== "latest") {
      params.set("sort", nextSort);
    }

    if (currentCategory) {
      params.set("category", currentCategory);
    }

    const queryString = params.toString();

    router.push(queryString ? `/?${queryString}` : "/");
  }

  function handleSearch() {
    moveToSearch(keyword, sort);
    setIsMobileSearchOpen(false);
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
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="flex h-[73px] items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-1 sm:gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="메뉴 열기"
            className="shrink-0 rounded-full px-3 py-2 text-xl hover:bg-gray-100"
          >
            ☰
          </button>

          <h1
            onClick={() => router.push("/")}
            className="cursor-pointer truncate text-xl font-bold text-red-600 sm:text-2xl"
          >
            VideoHub
          </h1>
        </div>

        <div className="hidden flex-1 items-center justify-center gap-3 md:flex">
          <input
            type="text"
            placeholder="영상을 검색하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="w-full max-w-[420px] rounded-full border border-gray-200 px-6 py-2 outline-none focus:border-gray-400"
          />

          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 outline-none"
          >
            <option value="latest">최신순</option>
            <option value="views">조회수순</option>
            <option value="likes">좋아요순</option>
          </select>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="검색 열기"
            className="rounded-full p-2 text-xl hover:bg-gray-100 md:hidden"
          >
            🔍
          </button>

          {email ? (
            <>
              <button
                type="button"
                onClick={() => router.push("/upload")}
                className="hidden rounded bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700 lg:block"
              >
                + 업로드
              </button>

              <button
                type="button"
                onClick={() => router.push("/mypage")}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 sm:px-2"
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

                <span className="hidden max-w-[120px] truncate text-sm font-bold text-gray-700 xl:block">
                  {displayName}
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded bg-gray-800 px-5 py-3 font-bold text-white hover:bg-gray-900 sm:block"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 sm:px-6 sm:py-3"
            >
              로그인
            </button>
          )}
        </div>
      </div>

      {isMobileSearchOpen && (
        <div className="absolute inset-x-0 top-0 z-50 flex h-[73px] items-center gap-2 border-b bg-white px-3 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            aria-label="검색 닫기"
            className="shrink-0 rounded-full p-2 text-xl hover:bg-gray-100"
          >
            ←
          </button>

          <input
            type="text"
            autoFocus
            placeholder="영상을 검색하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-2 outline-none focus:border-gray-400"
          />

          <button
            type="button"
            onClick={handleSearch}
            className="shrink-0 rounded-full bg-gray-100 p-2 text-lg hover:bg-gray-200"
            aria-label="검색 실행"
          >
            🔍
          </button>
        </div>
      )}
    </header>
  );
}