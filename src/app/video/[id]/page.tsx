import Link from "next/link";
import EditVideoButton from "@/components/EditVideoButton";
import DeleteVideoButton from "@/components/DeleteVideoButton";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import SubscribeButton from "@/components/SubscribeButton";
import WatchLaterButton from "@/components/WatchLaterButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR");
}

export default async function VideoPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!video) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-bold">영상을 찾을 수 없습니다.</h1>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", video.user_id)
    .maybeSingle();

  await supabase
    .from("videos")
    .update({
      views: (video.views ?? 0) + 1,
    })
    .eq("id", id);

  if (user) {
    await supabase.from("watch_history").upsert(
      {
        user_id: user.id,
        video_id: video.id,
        watched_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,video_id",
      }
    );
  }

  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles (
        username,
        avatar_url
      )
    `
    )
    .eq("video_id", id)
    .order("created_at", { ascending: false });

  const isOwner = user?.id === video.user_id;
  const channelName = profile?.username ?? video.creator ?? "알 수 없는 채널";
  const avatarUrl = profile?.avatar_url;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="overflow-hidden rounded-xl bg-black">
            <video
              src={video.video_url}
              controls
              className="aspect-video w-full"
            />
          </div>

          <h1 className="mt-4 text-2xl font-bold">{video.title}</h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/channel/${video.user_id}`}
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={channelName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-gray-600">
                    {channelName[0]}
                  </span>
                )}
              </div>

              <div>
                <p className="font-semibold">{channelName}</p>
                <p className="text-sm text-gray-500">채널 보기</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
  <SubscribeButton channelUserId={video.user_id} />

  <WatchLaterButton videoId={video.id} />

  <LikeButton id={video.id} likes={video.likes ?? 0} />

  {isOwner && <EditVideoButton id={video.id} />}
  {isOwner && <DeleteVideoButton id={video.id} />}
</div>
          </div>

          <div className="mt-4 rounded-xl bg-gray-100 p-4">
            <p className="text-sm font-semibold">
              조회수 {(video.views ?? 0) + 1}회 · {formatDate(video.created_at)}
            </p>

            {video.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm">
                {video.description}
              </p>
            )}
          </div>

          <CommentSection
            videoId={video.id}
            comments={comments ?? []}
            currentUserId={user?.id}
          />
        </section>
      </div>
    </main>
  );
}