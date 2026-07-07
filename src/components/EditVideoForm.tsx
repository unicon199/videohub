"use client";

import { useState, useTransition } from "react";
import { updateVideo } from "@/actions/video";

const CATEGORIES = [
  "AI 드라마",
  "AI 숏폼",
  "AI 뮤직비디오",
  "AI 공포",
  "AI 애니메이션",
  "AI 숏폼",
] as const;

const AI_TOOLS = ["Runway", "Kling", "Pika", "Veo", "Sora", "기타"] as const;

type Video = {
  id: number;
  title: string;
  description: string | null;
  creator: string | null;
  category: string | null;
  ai_tool: string | null;
};

type Props = {
  video: Video;
};

export default function EditVideoForm({ video }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        await updateVideo(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "수정 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="id" value={video.id} />

      <div>
        <label className="mb-2 block font-semibold">제목</label>
        <input
          name="title"
          type="text"
          defaultValue={video.title}
          className="w-full rounded border p-3"
          disabled={isPending}
          required
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold">설명</label>
        <textarea
          name="description"
          defaultValue={video.description ?? ""}
          className="h-32 w-full rounded border p-3"
          disabled={isPending}
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold">제작자</label>
        <input
          name="creator"
          type="text"
          defaultValue={video.creator ?? ""}
          className="w-full rounded border p-3"
          disabled={isPending}
          required
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold">카테고리</label>
        <select
          name="category"
          defaultValue={video.category ?? "AI 숏폼"}
          className="w-full rounded border p-3"
          disabled={isPending}
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
          name="ai_tool"
          defaultValue={video.ai_tool ?? "기타"}
          className="w-full rounded border p-3"
          disabled={isPending}
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
        disabled={isPending}
        className="w-full rounded bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "수정 중..." : "수정 완료"}
      </button>
    </form>
  );
}