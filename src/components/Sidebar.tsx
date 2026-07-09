"use client";

import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const menuItems = [
    { label: "홈", icon: "🏠", path: "/" },
    { label: "구독", icon: "📺", path: "/subscriptions" },
    { label: "시청기록", icon: "🕒", path: "/history" },
    { label: "나중에 보기", icon: "⭐", path: "/watch-later" },
    { label: "좋아요", icon: "❤️", path: "/liked" },
  ];

  return (
    <aside className="fixed left-0 top-[73px] h-[calc(100vh-73px)] w-60 border-r bg-white px-3 py-4">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-100"
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="my-4 border-t" />

      <button
        onClick={() => router.push("/mypage")}
        className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-100"
      >
        <span className="text-xl">👤</span>
        <span>마이페이지</span>
      </button>

      <button
        onClick={() => router.push("/upload")}
        className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-100"
      >
        <span className="text-xl">📤</span>
        <span>업로드</span>
      </button>
    </aside>
  );
}