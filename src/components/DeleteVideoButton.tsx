"use client";

import { useState, useTransition } from "react";
import { deleteVideo } from "@/actions/video";

type Props = {
  id: number;
};

export default function DeleteVideoButton({ id }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const ok = confirm("정말 이 영상을 삭제할까요?");
    if (!ok) return;

    setError(null);

    startTransition(async () => {
      try {
        await deleteVideo(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "삭제 중..." : "삭제"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}