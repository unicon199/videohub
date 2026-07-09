import Link from "next/link";
import { redirect } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WatchLaterPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: watchLater } = await supabase
    .from("watch_later")
    .select(
      `
      created_at,
      videos (
        id,
        user_id,
        title,
        creator,
        views,
        thumbnail_url
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const videos =
    watchLater
      ?.map((item) => item.videos)
      .filter((video) => video !== null) ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">나중에 보기</h1>
          <p className="mt-1 text-sm text-gray-500">
            저장한 영상을 언제든 다시 볼 수 있습니다.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          홈으로
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <p className="text-lg font-semibold">
            저장한 영상이 없습니다.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            영상을 저장하면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              userId={video.user_id}
              title={video.title}
              creator={video.creator}
              views={video.views ?? 0}
              thumbnailUrl={video.thumbnail_url}
            />
          ))}
        </div>
      )}
    </main>
  );
}