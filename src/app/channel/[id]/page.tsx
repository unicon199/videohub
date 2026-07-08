import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import SubscribeButton from "@/components/SubscribeButton";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const { count: followerCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("subscribed_to_id", id);

  const { data: existingSubscription } =
    user && user.id !== id
      ? await supabase
          .from("subscriptions")
          .select("id")
          .eq("subscriber_id", user.id)
          .eq("subscribed_to_id", id)
          .maybeSingle()
      : { data: null };

  const totalVideos = videos?.length ?? 0;
  const totalViews =
    videos?.reduce((sum, video) => sum + (video.views ?? 0), 0) ?? 0;
  const totalLikes =
    videos?.reduce((sum, video) => sum + (video.likes ?? 0), 0) ?? 0;

  const displayName = profile.username ?? "이름 없는 채널";

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="h-40 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-400" />

          <div className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="채널 프로필 사진"
                    className="-mt-20 h-32 w-32 rounded-full border-4 border-white object-cover shadow"
                  />
                ) : (
                  <div className="-mt-20 flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gray-300 text-5xl font-bold text-gray-700 shadow">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div>
                  <h1 className="text-3xl font-bold">{displayName}</h1>

                  <p className="mt-1 text-sm text-gray-500">
                    구독자 {(followerCount ?? 0).toLocaleString()}명 · 영상{" "}
                    {totalVideos.toLocaleString()}개
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    총 조회수 {totalViews.toLocaleString()}회 · 좋아요{" "}
                    {totalLikes.toLocaleString()}개
                  </p>

                  {profile.bio && (
                    <p className="mt-3 max-w-2xl whitespace-pre-line text-sm text-gray-700">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {user?.id === id ? (
  <Link
    href="/profile/edit"
    className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-gray-200"
  >
    프로필 수정
  </Link>
) : (
  <SubscribeButton
    targetUserId={id}
    currentUserId={user?.id}
    initialSubscribed={!!existingSubscription}
    initialCount={followerCount ?? 0}
  />
)}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="border-b border-gray-300">
            <button className="border-b-2 border-black px-4 py-3 font-bold">
              동영상
            </button>
            <button className="px-4 py-3 font-bold text-gray-500">정보</button>
          </div>

          <div className="mt-6">
            {videos && videos.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    id={video.id}
                    userId={video.user_id}
                    title={video.title}
                    creator={video.creator ?? displayName}
                    views={video.views ?? 0}
                    thumbnailUrl={video.thumbnail_url}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow">
                아직 업로드한 영상이 없습니다.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}