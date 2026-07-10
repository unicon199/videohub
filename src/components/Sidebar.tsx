"use client";

import { useRouter } from "next/navigation";

type SidebarProps = {
  isOpen: boolean;
};

export default function Sidebar({ isOpen }: SidebarProps) {
  const router = useRouter();

  const menuItems = [
    { label: "홈", icon: "🏠", path: "/" },
    { label: "구독", icon: "📺", path: "/subscriptions" },
    { label: "시청기록", icon: "🕒", path: "/history" },
    { label: "나중에 보기", icon: "⭐", path: "/watch-later" },
    { label: "좋아요", icon: "❤️", path: "/liked" },
  ];

  return (
    <aside
      className={`fixed left-0 top-[73px] h-[calc(100vh-73px)] border-r bg-white py-4 transition-all duration-300 ${
        isOpen ? "w-60 px-3" : "w-20 px-2"
      }`}
    >
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex w-full items-center rounded-xl py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100 ${
              isOpen
                ? "justify-start gap-4 px-4"
                : "justify-center px-0"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>

            {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="my-4 border-t" />

      <button
        onClick={() => router.push("/mypage")}
        className={`flex w-full items-center rounded-xl py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100 ${
          isOpen
            ? "justify-start gap-4 px-4"
            : "justify-center px-0"
        }`}
      >
        <span className="text-2xl">👤</span>
        {isOpen && <span>마이페이지</span>}
      </button>

      <button
        onClick={() => router.push("/upload")}
        className={`flex w-full items-center rounded-xl py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100 ${
          isOpen
            ? "justify-start gap-4 px-4"
            : "justify-center px-0"
        }`}
      >
        <span className="text-2xl">📤</span>
        {isOpen && <span>업로드</span>}
      </button>
    </aside>
  );
}