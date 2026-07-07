import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { createSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const { q, sort } = await searchParams;

  const keyword = q?.trim();

  const supabase = createSupabaseClient();

  let query = supabase
    .from("videos")
    .select(
      "id, title, description, creator, views, thumbnail_url, video_url, category, ai_tool, created_at"
    );

    switch (sort) {
      case "views":
        query = query.order("views", { ascending: false });
        break;
    
      case "likes":
        query = query.order("likes", { ascending: false });
        break;
    
      default:
        query = query.order("created_at", { ascending: false });
    }
  

  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,description.ilike.%${keyword}%,creator.ilike.%${keyword}%,category.ilike.%${keyword}%,ai_tool.ilike.%${keyword}%`
    );
  }

  const { data: videos, error } = await query;

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      {keyword && (
        <div className="px-8 pt-6 text-lg font-semibold">
          &quot;{keyword}&quot; 검색 결과
        </div>
      )}

      {error && (
        <div className="p-8 text-red-600">
          영상을 불러오지 못했습니다: {error.message}
        </div>
      )}

      {!error && (!videos || videos.length === 0) && (
        <div className="p-8 text-gray-500">
          {keyword ? "검색 결과가 없습니다." : "아직 업로드된 영상이 없습니다."}
        </div>
      )}

      {!error && videos && videos.length > 0 && (
        <section className="grid grid-cols-4 gap-6 p-8">
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
        </section>
      )}
    </main>
  );
}