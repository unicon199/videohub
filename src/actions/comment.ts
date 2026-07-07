"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createComment(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const videoId = Number(formData.get("video_id"));
  const content = String(formData.get("content") ?? "").trim();

  if (!videoId) {
    throw new Error("영상 ID가 없습니다.");
  }

  if (!content) {
    throw new Error("댓글 내용을 입력해 주세요.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { error } = await supabase.from("comments").insert({
    video_id: videoId,
    user_id: user.id,
    user_email: user.email ?? "unknown",
    content,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/video/${videoId}`);
}

export async function deleteComment(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const commentId = Number(formData.get("comment_id"));
  const videoId = Number(formData.get("video_id"));

  if (!commentId || !videoId) {
    throw new Error("댓글 정보가 없습니다.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/video/${videoId}`);
}