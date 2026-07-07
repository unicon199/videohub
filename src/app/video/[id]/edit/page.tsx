import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import EditVideoForm from "@/components/EditVideoForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditVideoPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!video) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-3xl font-bold">
          영상 수정
        </h1>

        <EditVideoForm video={video} />
      </div>
    </main>
  );
}