"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

type AvatarUploadProps = {
  userId: string;
  avatarUrl?: string | null;
};

export default function AvatarUpload({ userId, avatarUrl }: AvatarUploadProps) {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      alert("프로필 사진 업로드 실패");
      console.error(uploadError);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", userId);

    if (updateError) {
      alert("프로필 사진 저장 실패");
      console.error(updateError);
      setUploading(false);
      return;
    }

    setPreviewUrl(publicUrl);
    setUploading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="프로필 사진"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
            사진 없음
          </div>
        )}
      </div>

      <label className="cursor-pointer rounded bg-black px-4 py-2 text-sm text-white">
        {uploading ? "업로드 중..." : "프로필 사진 변경"}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
}