import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function updateProfile(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const username = String(formData.get("username") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  await supabase
    .from("profiles")
    .update({
      username,
      bio,
    })
    .eq("id", user.id);

  redirect("/mypage");
}

export default async function EditProfilePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, email, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <div className="mx-auto max-w-2xl p-8">
        <h1 className="mb-8 text-3xl font-bold">프로필 수정</h1>

        <form action={updateProfile} className="rounded-2xl bg-white p-8 shadow">
          <div className="mb-6">
            <label className="mb-2 block font-bold">이메일</label>
            <input
              value={profile?.email ?? user.email ?? ""}
              disabled
              className="w-full rounded-lg border bg-gray-100 p-3 text-gray-500"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block font-bold">채널명</label>
            <input
              name="username"
              defaultValue={profile?.username ?? ""}
              placeholder="채널명을 입력하세요"
              className="w-full rounded-lg border p-3"
              required
            />
          </div>

          <div className="mb-8">
            <label className="mb-2 block font-bold">소개글</label>
            <textarea
              name="bio"
              defaultValue={profile?.bio ?? ""}
              placeholder="채널 소개글을 입력하세요"
              rows={5}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
            >
              저장하기
            </button>

            <a
              href="/mypage"
              className="rounded-lg bg-gray-200 px-6 py-3 font-bold hover:bg-gray-300"
            >
              취소
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}