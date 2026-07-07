"use client";

import Link from "next/link";

type Props = {
  id: number;
};

export default function EditVideoButton({ id }: Props) {
  return (
    <Link
      href={`/video/${id}/edit`}
      className="rounded bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700"
    >
      수정
    </Link>
  );
}