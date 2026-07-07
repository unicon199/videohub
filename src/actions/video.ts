"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteVideo(videoId: number) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data: video, error: videoError } = await supabase
    .from("videos")
    .select("id, user_id, video_path, thumbnail_path")
    .eq("id", videoId)
    .maybeSingle();

  if (videoError) throw new Error(videoError.message);
  if (!video) throw new Error("영상을 찾을 수 없습니다.");
  if (video.user_id !== user.id) throw new Error("삭제 권한이 없습니다.");

  const filesToDelete = [video.video_path, video.thumbnail_path].filter(
    Boolean,
  ) as string[];

  if (filesToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("videos")
      .remove(filesToDelete);

    if (storageError) {
      throw new Error(`Storage 삭제 실패: ${storageError.message}`);
    }
  }

  const { error: deleteError } = await supabase
    .from("videos")
    .delete()
    .eq("id", videoId)
    .eq("user_id", user.id);

  if (deleteError) throw new Error(deleteError.message);

  redirect("/");
}

export async function updateVideo(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const videoId = Number(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const creator = String(formData.get("creator") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const aiTool = String(formData.get("ai_tool") ?? "").trim();

  if (!videoId) throw new Error("영상 ID가 없습니다.");
  if (!title) throw new Error("제목을 입력해 주세요.");
  if (!creator) throw new Error("제작자를 입력해 주세요.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data: video, error: videoError } = await supabase
    .from("videos")
    .select("id, user_id")
    .eq("id", videoId)
    .maybeSingle();

  if (videoError) throw new Error(videoError.message);
  if (!video) throw new Error("영상을 찾을 수 없습니다.");
  if (video.user_id !== user.id) throw new Error("수정 권한이 없습니다.");

  const { error: updateError } = await supabase
    .from("videos")
    .update({
      title,
      description,
      creator,
      category,
      ai_tool: aiTool,
    })
    .eq("id", videoId)
    .eq("user_id", user.id);

  if (updateError) throw new Error(updateError.message);

  redirect(`/video/${videoId}`);
}