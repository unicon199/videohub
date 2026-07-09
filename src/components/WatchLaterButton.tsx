"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

type Props = {
  videoId: number;
};

export default function WatchLaterButton({ videoId }: Props) {
  const supabase = createSupabaseClient();

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("watch_later")
        .select("id")
        .eq("user_id", user.id)
        .eq("video_id", videoId)
        .maybeSingle();

      setSaved(!!data);
      setLoading(false);
    }

    load();
  }, [videoId]);

  async function toggleWatchLater() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (saved) {
      await supabase
        .from("watch_later")
        .delete()
        .eq("user_id", user.id)
        .eq("video_id", videoId);

      setSaved(false);
    } else {
      await supabase.from("watch_later").insert({
        user_id: user.id,
        video_id: videoId,
      });

      setSaved(true);
    }
  }

  if (loading) return null;

  return (
    <button
      onClick={toggleWatchLater}
      className={`rounded-lg px-4 py-2 font-semibold transition ${
        saved
          ? "bg-yellow-500 text-white hover:bg-yellow-600"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
      }`}
    >
      {saved ? "★ 저장됨" : "☆ 나중에 보기"}
    </button>
  );
}