"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

type LikeButtonProps = {
  id: string | number;
  likes: number;
};

export default function LikeButton({ id, likes }: LikeButtonProps) {
  const supabase = createSupabaseClient();

  const [likeCount, setLikeCount] = useState(likes ?? 0);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLikedState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("liked_videos")
        .select("id")
        .eq("user_id", user.id)
        .eq("video_id", id)
        .maybeSingle();

      setLiked(!!data);
      setIsLoading(false);
    }

    loadLikedState();
  }, [id]);

  async function handleLike() {
    if (isLoading) return;

    setIsLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("로그인이 필요합니다.");
      setIsLoading(false);
      return;
    }

    if (liked) {
      const nextLikes = Math.max(likeCount - 1, 0);

      const { error: deleteError } = await supabase
        .from("liked_videos")
        .delete()
        .eq("user_id", user.id)
        .eq("video_id", id);

      const { error: updateError } = await supabase
        .from("videos")
        .update({ likes: nextLikes })
        .eq("id", id);

      if (deleteError || updateError) {
        alert("좋아요 취소에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      setLiked(false);
      setLikeCount(nextLikes);
      setIsLoading(false);
      return;
    }

    const nextLikes = likeCount + 1;

    const { error: insertError } = await supabase.from("liked_videos").insert({
      user_id: user.id,
      video_id: id,
    });

    const { error: updateError } = await supabase
      .from("videos")
      .update({ likes: nextLikes })
      .eq("id", id);

    if (insertError || updateError) {
      alert("좋아요 저장에 실패했습니다.");
      setIsLoading(false);
      return;
    }

    setLiked(true);
    setLikeCount(nextLikes);
    setIsLoading(false);
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-60 ${
        liked
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
      }`}
    >
      <span>{liked ? "❤️" : "🤍"}</span>
      <span>좋아요 {likeCount.toLocaleString()}</span>
    </button>
  );
}