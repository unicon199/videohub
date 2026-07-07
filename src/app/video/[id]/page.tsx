import EditVideoButton from "@/components/EditVideoButton";
import DeleteVideoButton from "@/components/DeleteVideoButton";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import SubscribeButton from "@/components/SubscribeButton";
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

  const { data: video } = await supabase
    .from("videos")
    .select(
      "id, title, description, video_url, creator, category, ai_tool, duration, views, likes, created_at, user_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (!video) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">영상을 찾을 수 없습니다.</h1>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, video_id, user_id, user_email, content, created_at")
    .eq("video_id", video.id)
    .order("created_at", { ascending: false });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("subscriber_id", user?.id ?? "")
    .eq("subscribed_to_id", video.user_id)
    .maybeSingle();

  const { count: subscriberCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("subscribed_to_id", video.user_id);

  const isOwner = user?.id === video.user_id;
  const updatedViews = (video.views ?? 0) + 1;

  await supabase.from("videos").update({ views: updatedViews }).eq("id", id);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <video controls className="aspect-video w-full rounded-xl bg-black">
          <source src={video.video_url} type="video/mp4" />
        </video>

        <h1 className="mt-6 text-3xl font-bold">{video.title}</h1>

        <div className="mt-2 text-gray-500">
          {video.creator} · 조회수 {updatedViews.toLocaleString()}회
        </div>

        <div className="mt-3">
          <SubscribeButton
            targetUserId={video.user_id}
            currentUserId={user?.id}
            initialSubscribed={!!subscription}
            initialCount={subscriberCount ?? 0}
          />
        </div>

        <div className="mt-4 flex gap-3">
          <LikeButton id={video.id} likes={video.likes ?? 0} />

          {isOwner && (
            <>
              <EditVideoButton id={video.id} />
              <DeleteVideoButton id={video.id} />
            </>
          )}
        </div>

        <div className="mt-4 rounded-lg bg-white p-5 shadow">
          <p>{video.description}</p>

          <div className="mt-4 text-sm text-gray-500">
            AI Tool : {video.ai_tool}
          </div>

          <div className="text-sm text-gray-500">
            카테고리 : {video.category}
          </div>

          <div className="text-sm text-gray-500">
            업로드 : {formatDate(video.created_at)}
          </div>

          <div className="text-sm text-gray-500">
            길이 : {video.duration}
          </div>
        </div>
      </div>

      <CommentSection
        videoId={video.id}
        comments={comments ?? []}
        currentUserId={user?.id}
      />
    </main>
  );
}