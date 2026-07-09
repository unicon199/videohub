import Link from "next/link";
import { redirect } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: history } = await supabase
    .from("watch_history")
    .select(
      `
      watched_at,
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
    .order("watched_at", { ascending: false });

  const videos =
    history
      ?.map((item) => item.videos)
      .filter((video) => video !== null) ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">시청기록</h1>
          <p className="mt-1 text-sm text-gray-500">
            최근 시청한 영상을 확인할 수 있습니다.
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
          <p className="text-lg font-semibold">아직 시청기록이 없습니다.</p>
          <p className="mt-2 text-sm text-gray-500">
            영상을 시청하면 이곳에 기록됩니다.
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