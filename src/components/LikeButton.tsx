"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

type LikeButtonProps = {
  id: string;
  likes: number;
};

export default function LikeButton({ id, likes }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(likes ?? 0);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLike() {
    if (isLoading) return;

    setIsLoading(true);

    const nextLikes = likeCount + 1;
    setLikeCount(nextLikes);

    const supabase = createSupabaseClient();

    const { error } = await supabase
      .from("videos")
      .update({ likes: nextLikes })
      .eq("id", id);

    if (error) {
      setLikeCount(likeCount);
      alert("좋아요 저장에 실패했습니다.");
    }

    setIsLoading(false);
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-gray-200 disabled:opacity-60"
    >
      <span>❤️</span>
      <span>좋아요 {likeCount.toLocaleString()}</span>
    </button>
  );
}