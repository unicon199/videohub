import { redirect } from "next/navigation";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, email, avatar_url, bio, created_at")
    .eq("id", user.id)
    .maybeSingle();  

  const { count: followingCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("subscriber_id", user.id);

  const { count: followerCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("subscribed_to_id", user.id);

    const { data: followingList } = await supabase
    .from("subscriptions")
    .select("subscribed_to_id, created_at")
    .eq("subscriber_id", user.id)
    .order("created_at", { ascending: false });
  
  const subscribedUserIds =
    followingList?.map((item) => item.subscribed_to_id) ?? [];
  
  const { data: subscribedChannels } =
    subscribedUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, username, email")
          .in("id", subscribedUserIds)
      : { data: [] };

  const totalVideos = videos?.length ?? 0;
  const totalViews =
    videos?.reduce((sum, video) => sum + (video.views ?? 0), 0) ?? 0;
  const totalLikes =
    videos?.reduce((sum, video) => sum + (video.likes ?? 0), 0) ?? 0;

    const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("ko-KR")
    : user.created_at
      ? new Date(user.created_at).toLocaleDateString("ko-KR")
      : "-";

    const displayName =
    profile?.username ?? user.email?.split("@")[0] ?? "사용자";

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <div className="p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 text-3xl font-bold">마이페이지</h1>

          <section className="mb-8 rounded-2xl bg-white p-8 shadow">
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-4xl font-bold text-red-600">
                {displayName.slice(0, 1).toUpperCase()}
              </div>

              <div>
  <h2 className="text-2xl font-bold">{displayName}</h2>

  <p className="mt-1 text-gray-500">
    {profile?.email ?? user.email}
  </p>

  {profile?.bio && (
    <p className="mt-3 whitespace-pre-line text-gray-700">
      {profile.bio}
    </p>
  )}

  <p className="mt-2 text-sm text-gray-400">
    가입일: {joinedDate}
  </p>

  <Link
    href="/profile/edit"
    className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-black"
  >
    프로필 수정
  </Link>
</div>
            </div>

            <div className="mt-8 grid grid-cols-5 gap-4">
              <div className="rounded-xl bg-gray-100 p-5">
                <div className="text-sm text-gray-500">🎬 업로드 영상</div>
                <div className="mt-2 text-3xl font-bold">{totalVideos}</div>
              </div>

              <div className="rounded-xl bg-gray-100 p-5">
                <div className="text-sm text-gray-500">👁 총 조회수</div>
                <div className="mt-2 text-3xl font-bold">
                  {totalViews.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-gray-100 p-5">
                <div className="text-sm text-gray-500">❤ 총 좋아요</div>
                <div className="mt-2 text-3xl font-bold">
                  {totalLikes.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-gray-100 p-5">
                <div className="text-sm text-gray-500">👥 구독자</div>
                <div className="mt-2 text-3xl font-bold">
                  {followerCount ?? 0}
                </div>
              </div>

              <div className="rounded-xl bg-gray-100 p-5">
                <div className="text-sm text-gray-500">✅ 구독중</div>
                <div className="mt-2 text-3xl font-bold">
                  {followingCount ?? 0}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8 rounded-2xl bg-white p-8 shadow">
            <h2 className="mb-4 text-2xl font-bold">
              내가 구독한 채널 ({followingCount ?? 0})
            </h2>

            {!subscribedChannels || subscribedChannels.length === 0 ? (
              <p className="text-gray-500">아직 구독한 채널이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {subscribedChannels.map((channel) => (
  <Link
    key={channel.id}
    href={`/channel/${channel.id}`}
    className="block rounded-xl bg-gray-100 p-5 transition hover:bg-gray-200"
  >
    <div className="font-bold">
      {channel.username ?? "이름 없는 채널"}
    </div>
    <div className="mt-1 text-sm text-gray-500">{channel.email}</div>
    <div className="mt-1 text-sm text-gray-500">구독중</div>
  </Link>
))}
              </div>
            )}
          </section>

          <h2 className="mb-4 text-2xl font-bold">
            내가 올린 영상 ({totalVideos})
          </h2>

          {totalVideos === 0 ? (
            <div className="rounded-xl bg-white p-8 text-gray-500 shadow">
              아직 업로드한 영상이 없습니다.
            </div>
          ) : (
            <section className="grid grid-cols-4 gap-6">
              {videos?.map((video) => (
                <VideoCard
                  key={video.id}
                  id={video.id}
                  userId={video.user_id}
                  title={video.title}
                  creator={video.creator ?? "익명"}
                  views={video.views ?? 0}
                  thumbnailUrl={video.thumbnail_url}
                />
              ))}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}