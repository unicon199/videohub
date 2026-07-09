import Link from "next/link";
import HomeLayout from "@/components/HomeLayout";
import VideoCard from "@/components/VideoCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    category?: string;
  }>;
};

const categories = ["전체", "AI", "게임", "음악", "브이로그", "교육", "쇼츠", "기타"];

export default async function Home({ searchParams }: Props) {
  const { q, sort, category } = await searchParams;

  const keyword = q?.trim();
  const selectedCategory = category ?? "전체";

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("videos")
    .select(
      "id, user_id, title, description, creator, views, likes, thumbnail_url, video_url, category, ai_tool, created_at"
    );

  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,description.ilike.%${keyword}%,creator.ilike.%${keyword}%,category.ilike.%${keyword}%,ai_tool.ilike.%${keyword}%`
    );
  }

  if (selectedCategory !== "전체") {
    query = query.eq("category", selectedCategory);
  }

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

  const { data: videos, error } = await query;

  return (
    <main className="min-h-screen bg-gray-100">
     <HomeLayout>
        <div className="px-8 pt-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => {
              const isActive = selectedCategory === item;
              const params = new URLSearchParams();

              if (keyword) params.set("q", keyword);
              if (sort) params.set("sort", sort);
              if (item !== "전체") params.set("category", item);

              const href = params.toString() ? `/?${params.toString()}` : "/";

              return (
                <Link
                  key={item}
                  href={href}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </div>
        </div>

        {keyword && (
          <div className="px-8 pt-4 text-lg font-semibold">
            &quot;{keyword}&quot; 검색 결과
          </div>
        )}

        {selectedCategory !== "전체" && (
          <div className="px-8 pt-2 text-sm text-gray-500">
            선택한 카테고리: {selectedCategory}
          </div>
        )}

        {error && (
          <div className="p-8 text-red-600">
            영상을 불러오지 못했습니다: {error.message}
          </div>
        )}

        {!error && (!videos || videos.length === 0) && (
          <div className="p-8 text-gray-500">
            {keyword || selectedCategory !== "전체"
              ? "조건에 맞는 영상이 없습니다."
              : "아직 업로드된 영상이 없습니다."}
          </div>
        )}

        {!error && videos && videos.length > 0 && (
          <section className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2 lg:grid-cols-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                userId={video.user_id}
                title={video.title}
                creator={video.creator ?? "알 수 없는 채널"}
                views={video.views ?? 0}
                thumbnailUrl={video.thumbnail_url}
              />
            ))}
          </section>
        )}
    </HomeLayout>
  </main>
  );
}