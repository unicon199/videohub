"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

type HomeLayoutProps = {
  children: React.ReactNode;
};

const SIDEBAR_STORAGE_KEY = "videohub-sidebar-open";
const MOBILE_BREAKPOINT = 768;

export default function HomeLayout({ children }: HomeLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    function checkScreenSize() {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;

      setIsMobile(mobile);

      if (mobile) {
        setIsSidebarOpen(false);
        return;
      }

      const savedSidebarState = localStorage.getItem(
        SIDEBAR_STORAGE_KEY
      );

      setIsSidebarOpen(
        savedSidebarState === null
          ? true
          : savedSidebarState === "true"
      );
    }

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    setIsReady(true);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  function toggleSidebar() {
    setIsSidebarOpen((prev) => {
      const nextState = !prev;

      if (!isMobile) {
        localStorage.setItem(
          SIDEBAR_STORAGE_KEY,
          String(nextState)
        );
      }

      return nextState;
    });
  }

  function closeMobileSidebar() {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }

  if (!isReady) {
    return null;
  }

  return (
    <>
      <Header onMenuClick={toggleSidebar} />

      <Sidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onNavigate={closeMobileSidebar}
      />

      {isMobile && isSidebarOpen && (
        <button
          type="button"
          aria-label="사이드바 닫기"
          onClick={closeMobileSidebar}
          className="fixed inset-0 top-[73px] z-30 bg-black/40"
        />
      )}

      <main
        className={`transition-all duration-300 ${
          isMobile
            ? "ml-0"
            : isSidebarOpen
              ? "ml-60"
              : "ml-20"
        }`}
      >
        {children}
      </main>
    </>
  );
}