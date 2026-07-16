import Link from "next/link";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import SubscribeButton from "@/components/SubscribeButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ChannelPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    tab?: string;
  }>;
};

type ChannelTab = "home" | "videos" | "about";

export default async function ChannelPage({
  params,
  searchParams,
}: ChannelPageProps) {
  const { id } = await params;
  const { tab } = await searchParams;

  const activeTab: ChannelTab =
    tab === "videos" || tab === "about" ? tab : "home";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />

        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h1 className="text-2xl font-bold">
              채널을 찾을 수 없습니다.
            </h1>

            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black"
            >
              홈으로
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { data: videos } = await supabase
    .from("videos")
    .select(
      "id, user_id, title, creator, views, likes, thumbnail_url, created_at"
    )
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const { count: followerCount } = await supabase
    .from("subscriptions")
    .select("*", {
      count: "exact",
      head: true,
    })
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

  const channelVideos = videos ?? [];

  const totalVideos = channelVideos.length;

  const totalViews = channelVideos.reduce(
    (sum, video) => sum + (video.views ?? 0),
    0
  );

  const totalLikes = channelVideos.reduce(
    (sum, video) => sum + (video.likes ?? 0),
    0
  );

  const displayName = profile.username ?? "이름 없는 채널";

  const recentVideos = channelVideos.slice(0, 3);

  function renderVideoGrid(
    targetVideos: typeof channelVideos,
    emptyMessage: string
  ) {
    if (targetVideos.length === 0) {
      return (
        <div className="rounded-2xl bg-white p-12 text-center text-gray-500 shadow-sm">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {targetVideos.map((video) => (
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {/* 채널 배너 및 프로필 */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-slate-950 via-slate-700 to-slate-400 sm:h-48" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${displayName} 채널 프로필`}
                    className="-mt-14 h-28 w-28 shrink-0 rounded-full border-4 border-white object-cover shadow-md sm:-mt-16 sm:h-36 sm:w-36"
                  />
                ) : (
                  <div className="-mt-14 flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gray-300 text-4xl font-bold text-gray-700 shadow-md sm:-mt-16 sm:h-36 sm:w-36 sm:text-5xl">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
                    {displayName}
                  </h1>

                  <p className="mt-2 text-sm text-gray-500">
                    구독자 {(followerCount ?? 0).toLocaleString()}명
                    {" · "}
                    영상 {totalVideos.toLocaleString()}개
                  </p>

                  {profile.bio && (
                    <p className="mt-3 max-w-2xl line-clamp-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 pb-1">
                {user?.id === id ? (
                  <Link
                    href="/profile/edit"
                    className="inline-flex rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-gray-200"
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
          </div>

          {/* 채널 탭 */}
          <nav className="flex overflow-x-auto border-t px-3 sm:px-6">
            <Link
              href={`/channel/${id}`}
              className={`shrink-0 border-b-2 px-5 py-4 text-sm font-bold transition ${
                activeTab === "home"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              홈
            </Link>

            <Link
              href={`/channel/${id}?tab=videos`}
              className={`shrink-0 border-b-2 px-5 py-4 text-sm font-bold transition ${
                activeTab === "videos"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              동영상
            </Link>

            <Link
              href={`/channel/${id}?tab=about`}
              className={`shrink-0 border-b-2 px-5 py-4 text-sm font-bold transition ${
                activeTab === "about"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              정보
            </Link>
          </nav>
        </section>

        {/* 홈 탭 */}
        {activeTab === "home" && (
          <div className="mt-8 space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">최근 업로드</h2>

                {totalVideos > 3 && (
                  <Link
                    href={`/channel/${id}?tab=videos`}
                    className="rounded-full px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-200"
                  >
                    모두 보기
                  </Link>
                )}
              </div>

              {renderVideoGrid(
                recentVideos,
                "아직 업로드한 영상이 없습니다."
              )}
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  전체 영상
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {totalVideos.toLocaleString()}개
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  총 조회수
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {totalViews.toLocaleString()}회
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  받은 좋아요
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {totalLikes.toLocaleString()}개
                </p>
              </div>
            </section>
          </div>
        )}

        {/* 동영상 탭 */}
        {activeTab === "videos" && (
          <section className="mt-8">
            <div className="mb-5">
              <h2 className="text-xl font-bold">동영상</h2>
              <p className="mt-1 text-sm text-gray-500">
                이 채널이 업로드한 모든 영상입니다.
              </p>
            </div>

            {renderVideoGrid(
              channelVideos,
              "아직 업로드한 영상이 없습니다."
            )}
          </section>
        )}

        {/* 정보 탭 */}
        {activeTab === "about" && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold">채널 소개</h2>

              {profile.bio ? (
                <p className="mt-5 whitespace-pre-line leading-7 text-gray-700">
                  {profile.bio}
                </p>
              ) : (
                <p className="mt-5 text-gray-500">
                  작성된 채널 소개가 없습니다.
                </p>
              )}
            </div>

            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">채널 통계</h2>

              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between border-b pb-4">
                  <dt className="text-gray-500">구독자</dt>
                  <dd className="font-bold">
                    {(followerCount ?? 0).toLocaleString()}명
                  </dd>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <dt className="text-gray-500">영상</dt>
                  <dd className="font-bold">
                    {totalVideos.toLocaleString()}개
                  </dd>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <dt className="text-gray-500">총 조회수</dt>
                  <dd className="font-bold">
                    {totalViews.toLocaleString()}회
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">좋아요</dt>
                  <dd className="font-bold">
                    {totalLikes.toLocaleString()}개
                  </dd>
                </div>
              </dl>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}