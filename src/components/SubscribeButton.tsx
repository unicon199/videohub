"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

type Props = {
  targetUserId: string;
  currentUserId?: string;
  initialSubscribed: boolean;
  initialCount: number;
};

export default function SubscribeButton({
  targetUserId,
  currentUserId,
  initialSubscribed,
  initialCount,
}: Props) {
  const supabase = createSupabaseClient();

  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (currentUserId === targetUserId) return;

    setLoading(true);

    if (subscribed) {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("subscriber_id", currentUserId)
        .eq("subscribed_to_id", targetUserId);

      if (!error) {
        setSubscribed(false);
        setCount((prev) => Math.max(prev - 1, 0));
      }
    } else {
      const { error } = await supabase.from("subscriptions").insert({
        subscriber_id: currentUserId,
        subscribed_to_id: targetUserId,
      });

      if (!error) {
        setSubscribed(true);
        setCount((prev) => prev + 1);
      }
    }

    setLoading(false);
  };

  if (currentUserId === targetUserId) {
    return null;
  }
  
  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        subscribed
          ? "bg-gray-200 text-gray-800"
          : "bg-black text-white"
      }`}
    >
      {subscribed ? "구독중" : "구독"} {count}
    </button>
  );
}