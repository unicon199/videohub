"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { captureVideoThumbnail, getVideoDuration } from "@/lib/video";

const CATEGORIES = [
  "AI 드라마",
  "AI 숏폼",
  "AI 뮤직비디오",
  "AI 공포",
  "AI 애니메이션",
] as const;

const AI_TOOLS = ["Runway", "Kling", "Pika", "Veo", "Sora", "기타"] as const;

export default function UploadForm() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creator, setCreator] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [aiTool, setAiTool] = useState<string>(AI_TOOLS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("영상 파일을 선택해 주세요.");
      return;
    }

    if (!title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }

    if (!creator.trim()) {
      setError("제작자 이름을 입력해 주세요.");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createSupabaseClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      const duration = await getVideoDuration(file);

      const baseName = `${Date.now()}-${crypto.randomUUID()}`;
      const fileExt = file.name.split(".").pop() ?? "mp4";
      const videoPath = `${baseName}.${fileExt}`;
      const thumbnailPath = `thumbnails/${baseName}.jpg`;

      let thumbnailUrl: string | null = null;
      let savedThumbnailPath: string | null = null;

      try {
        const thumbnailBlob = await captureVideoThumbnail(file);

        const { error: thumbnailUploadError } = await supabase.storage
          .from("videos")
          .upload(thumbnailPath, thumbnailBlob, {
            cacheControl: "3600",
            upsert: false,
            contentType: "image/jpeg",
          });

        if (!thumbnailUploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("videos").getPublicUrl(thumbnailPath);

          thumbnailUrl = publicUrl;
          savedThumbnailPath = thumbnailPath;
        }
      } catch {
        // 썸네일 생성 실패 시 영상 업로드는 계속 진행
      }

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(videoPath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`영상 업로드 실패: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("videos").getPublicUrl(videoPath);

      const { data, error: insertError } = await supabase
        .from("videos")
        .insert({
          title: title.trim(),
          description: description.trim(),
          video_url: publicUrl,
          video_path: videoPath,
          creator: creator.trim(),
          category,
          ai_tool: aiTool,
          duration,
          views: 0,
          likes: 0,
          thumbnail_url: thumbnailUrl,
          thumbnail_path: savedThumbnailPath,
          user_id: user.id,
        })
        .select("id")
        .single();

      if (insertError) {
        await supabase.storage.from("videos").remove(
          [videoPath, savedThumbnailPath].filter(Boolean) as string[],
        );

        throw new Error(`DB 저장 실패: ${insertError.message}`);
      }

      router.push(`/video/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block font-semibold">영상 파일</label>
        <input
          type="file"
          accept="video/*"
          className="w-full rounded border p-3"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={isUploading}
          required
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold">제목</label>
        <input
          type="text"
          placeholder="영상 제목을 입력하세요"
          className="w-full rounded border p-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
          required
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold">설명</label>
        <textarea
          placeholder="영상 설명을 입력하세요"
          className="h-32 w-full rounded border p-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUploading}
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold">제작자</label>
        <input
          type="text"
          placeholder="제작자 이름을 입력하세요"
          className="w-full rounded border p-3"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          disabled={isUploading}
          required
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold">카테고리</label>
        <select
          className="w-full rounded border p-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isUploading}
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block font-semibold">사용 AI Tool</label>
        <select
          className="w-full rounded border p-3"
          value={aiTool}
          onChange={(e) => setAiTool(e.target.value)}
          disabled={isUploading}
        >
          {AI_TOOLS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isUploading}
        className="w-full rounded bg-red-600 py-3 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? "업로드 중..." : "업로드"}
      </button>
    </form>
  );
}