import { redirect } from "next/navigation";
import Header from "@/components/Header";
import AvatarUpload from "@/components/AvatarUpload";
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
    .select("username, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <div className="p-8">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
          <h1 className="mb-6 text-3xl font-bold">프로필 수정</h1>

          <AvatarUpload userId={user.id} avatarUrl={profile?.avatar_url} />

          <form action={updateProfile} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block font-bold">이름</label>
              <input
                name="username"
                defaultValue={profile?.username ?? ""}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold">소개</label>
              <textarea
                name="bio"
                defaultValue={profile?.bio ?? ""}
                className="h-32 w-full rounded-lg border px-4 py-3"
                placeholder="소개를 입력하세요"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-black py-3 font-bold text-white hover:bg-gray-800"
            >
              저장하기
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}