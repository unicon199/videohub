"use client";

import { usePathname, useRouter } from "next/navigation";

type SidebarProps = {
  isOpen: boolean;
  isMobile: boolean;
  onNavigate?: () => void;
};

type MenuItem = {
  label: string;
  icon: string;
  path: string;
};

export default function Sidebar({
  isOpen,
  isMobile,
  onNavigate,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const mainMenuItems: MenuItem[] = [
    { label: "홈", icon: "🏠", path: "/" },
    { label: "구독", icon: "📺", path: "/subscriptions" },
    { label: "시청기록", icon: "🕒", path: "/history" },
    { label: "나중에 보기", icon: "⭐", path: "/watch-later" },
    { label: "좋아요", icon: "❤️", path: "/liked" },
  ];

  const accountMenuItems: MenuItem[] = [
    { label: "마이페이지", icon: "👤", path: "/mypage" },
    { label: "업로드", icon: "📤", path: "/upload" },
  ];

  const showExpandedMenu = isMobile || isOpen;

  function isActive(path: string) {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  }

  function handleNavigate(path: string) {
    router.push(path);
    onNavigate?.();
  }

  function renderMenuItem(item: MenuItem) {
    const active = isActive(item.path);

    return (
      <button
        key={item.path}
        type="button"
        onClick={() => handleNavigate(item.path)}
        className={`flex w-full rounded-xl text-sm font-semibold transition-colors ${
          showExpandedMenu
            ? "items-center justify-start gap-4 px-4 py-3"
            : "min-h-[64px] flex-col items-center justify-center gap-1 px-1 py-2"
        } ${
          active
            ? "bg-gray-200 text-black"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <span
          className={`leading-none ${
            showExpandedMenu ? "text-2xl" : "text-[22px]"
          }`}
          aria-hidden="true"
        >
          {item.icon}
        </span>

        <span
          className={
            showExpandedMenu
              ? ""
              : "w-full truncate text-center text-[10px] font-medium leading-none"
          }
        >
          {item.label}
        </span>
      </button>
    );
  }

  return (
    <aside
      className={`fixed left-0 top-[73px] z-40 h-[calc(100vh-73px)] overflow-y-auto border-r bg-white py-4 transition-all duration-300 ${
        isMobile
          ? `w-60 px-3 ${
              isOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }`
          : isOpen
            ? "w-60 translate-x-0 px-3"
            : "w-20 translate-x-0 px-2"
      }`}
    >
      <nav
        className={
          showExpandedMenu ? "space-y-1" : "space-y-2"
        }
      >
        {mainMenuItems.map(renderMenuItem)}
      </nav>

      <div
        className={
          showExpandedMenu
            ? "my-4 border-t"
            : "my-5 border-t"
        }
      />

      <nav
        className={
          showExpandedMenu ? "space-y-1" : "space-y-2"
        }
      >
        {accountMenuItems.map(renderMenuItem)}
      </nav>
    </aside>
  );
}