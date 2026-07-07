import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ChannelPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    return (
      <div>
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-10">
          <h1 className="text-2xl font-bold">채널을 찾을 수 없습니다.</h1>
        </main>
      </div>
    );
  }

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const totalVideos = videos?.length ?? 0;
  const totalViews =
    videos?.reduce((sum, video) => sum + (video.views ?? 0), 0) ?? 0;
  const totalLikes =
    videos?.reduce((sum, video) => sum + (video.likes ?? 0), 0) ?? 0;

  return (
    <div>
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-8 rounded-xl bg-white p-6 shadow">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold text-gray-600">
              {profile.username?.slice(0, 1).toUpperCase() ?? "U"}
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {profile.username ?? "이름 없는 채널"}
              </h1>

              <p className="mt-1 text-sm text-gray-500">{profile.email}</p>

              {profile.bio && (
                <p className="mt-3 text-gray-700">{profile.bio}</p>
              )}

              <div className="mt-4 flex gap-4 text-sm text-gray-600">
                <span>영상 {totalVideos}개</span>
                <span>조회수 {totalViews}회</span>
                <span>좋아요 {totalLikes}개</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">업로드한 영상</h2>

          {videos && videos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          ) : (
            <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
              아직 업로드한 영상이 없습니다.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}