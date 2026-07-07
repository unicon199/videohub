"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

type LikeButtonProps = {
  id: number;
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
      className="mt-4 rounded-full bg-white px-5 py-2 font-bold shadow hover:bg-gray-100 disabled:opacity-60"
    >
      ❤️ 좋아요 {likeCount.toLocaleString()}개
    </button>
  );
}