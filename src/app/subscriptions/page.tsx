import Link from "next/link";
import { redirect } from "next/navigation";
import VideoCard from "@/components/VideoCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("channel_user_id")
    .eq("subscriber_id", user.id);

  const channelUserIds =
    subscriptions?.map((item) => item.channel_user_id) ?? [];

  if (channelUserIds.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">구독</h1>
            <p className="mt-1 text-sm text-gray-500">
              구독한 채널의 최신 영상을 확인할 수 있습니다.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            홈으로
          </Link>
        </div>

        <div className="rounded-xl bg-white p-10 text-center shadow">
          <p className="text-lg font-semibold">아직 구독한 채널이 없습니다.</p>
          <p className="mt-2 text-sm text-gray-500">
            마음에 드는 채널을 구독하면 이곳에 영상이 표시됩니다.
          </p>
        </div>
      </main>
    );
  }

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .in("user_id", channelUserIds)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">구독</h1>
          <p className="mt-1 text-sm text-gray-500">
            구독한 채널의 최신 영상을 확인할 수 있습니다.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          홈으로
        </Link>
      </div>

      {!videos || videos.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <p className="text-lg font-semibold">구독한 채널의 영상이 없습니다.</p>
          <p className="mt-2 text-sm text-gray-500">
            구독한 채널이 영상을 올리면 이곳에 표시됩니다.
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