import Link from "next/link";

type RelatedVideoCardProps = {
  id: string;
  title: string;
  creator: string;
  views: number;
  thumbnailUrl: string | null;
  createdAt: string;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "오늘";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;

  return `${Math.floor(diffDays / 365)}년 전`;
}

export default function RelatedVideoCard({
  id,
  title,
  creator,
  views,
  thumbnailUrl,
  createdAt,
}: RelatedVideoCardProps) {
  return (
    <Link href={`/video/${id}`} className="group flex gap-3 rounded-lg p-2 hover:bg-gray-200">
      <div className="h-30 w-50 shrink-0 overflow-hidden rounded-lg bg-gray-300">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
            No Image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
      <h3 className="line-clamp-2 text-[15px] font-semibold leading-5 text-gray-900">
          {title}
        </h3>

        <p className="mt-1 truncate text-xs text-gray-500">{creator}</p>

        <p className="mt-1 text-xs text-gray-400">
          조회수 {views.toLocaleString()}회 · {formatDate(createdAt)}
        </p>
      </div>
    </Link>
  );
}