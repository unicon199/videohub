import Link from "next/link";
import { redirect } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LikedPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: likedVideos } = await supabase
    .from("liked_videos")
    .select(
      `
      video_id,
      videos (*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const videos =
    likedVideos
      ?.map((item: any) => item.videos)
      .filter(Boolean) ?? [];

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">좋아요 표시한 영상</h1>
          <p className="mt-2 text-gray-500">
            좋아요를 누른 영상을 다시 볼 수 있습니다.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white"
        >
          홈으로
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
          <h2 className="text-3xl font-bold">
            아직 좋아요한 영상이 없습니다.
          </h2>

          <p className="mt-3 text-lg text-gray-500">
            마음에 드는 영상에 좋아요를 눌러보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {videos.map((video: any) => (
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