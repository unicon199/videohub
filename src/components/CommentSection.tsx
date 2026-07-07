"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { createComment, deleteComment } from "@/actions/comment";

type Comment = {
  id: number;
  video_id: number;
  user_id: string;
  user_email: string;
  content: string;
  created_at: string;
  profile?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

type Props = {
  videoId: number;
  comments: Comment[];
  currentUserId?: string;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("ko-KR");
}

export default function CommentSection({
  videoId,
  comments,
  currentUserId,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        await createComment(formData);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "댓글 등록 실패");
      }
    });
  }

  function handleDelete(commentId: number) {
    const ok = confirm("댓글을 삭제할까요?");
    if (!ok) return;

    const formData = new FormData();
    formData.set("comment_id", String(commentId));
    formData.set("video_id", String(videoId));

    setError(null);

    startTransition(async () => {
      try {
        await deleteComment(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "댓글 삭제 실패");
      }
    });
  }

  return (
    <section className="mx-auto mt-8 max-w-5xl rounded-xl bg-white p-6 shadow">
      <h2 className="mb-5 text-2xl font-bold">댓글 {comments.length}개</h2>

      <form ref={formRef} action={handleCreate} className="mb-8">
        <input type="hidden" name="video_id" value={videoId} />

        <textarea
          name="content"
          placeholder="댓글을 입력하세요"
          className="h-24 w-full rounded-lg border p-3 outline-none focus:border-red-500"
          disabled={isPending}
          required
        />

        {error && (
          <p className="mt-2 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? "처리 중..." : "댓글 등록"}
          </button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="text-gray-500">아직 댓글이 없습니다.</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => {
            const isMine = currentUserId === comment.user_id;

            const displayName =
              comment.profile?.username ??
              comment.user_email?.split("@")[0] ??
              "사용자";

            const avatarUrl = comment.profile?.avatar_url;

            return (
              <div key={comment.id} className="flex gap-3 border-t pt-5">
                <Link href={`/channel/${comment.user_id}`} className="shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="댓글 작성자 프로필 사진"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/channel/${comment.user_id}`}
                      className="font-bold hover:underline"
                    >
                      {displayName}
                    </Link>

                    <span className="text-xs text-gray-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>

                  <p className="mt-1 whitespace-pre-wrap text-gray-800">
                    {comment.content}
                  </p>
                </div>

                {isMine && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    disabled={isPending}
                    className="shrink-0 text-sm font-bold text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}