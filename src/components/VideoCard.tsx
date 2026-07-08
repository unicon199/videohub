import Link from "next/link";

type VideoCardProps = {
  id: number;
  userId: string;
  title: string;
  creator: string;
  views: number;
  thumbnailUrl?: string | null;
};

export default function VideoCard({
  id,
  userId,
  title,
  creator,
  views,
  thumbnailUrl,
}: VideoCardProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow transition hover:scale-[1.02] hover:shadow-xl">
      <Link href={`/video/${id}`}>
        <div className="aspect-video bg-gray-300">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/video/${id}`}>
          <h2 className="font-bold hover:underline">{title}</h2>
        </Link>

        <Link
          href={`/channel/${userId}`}
          className="text-sm text-gray-500 hover:text-black hover:underline"
        >
          {creator}
        </Link>

        <p className="text-sm text-gray-400">
          조회수 {views.toLocaleString()}회
        </p>
      </div>
    </div>
  );
}