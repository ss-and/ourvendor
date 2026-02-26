"use client";

import { useSearchParams } from "next/navigation";
import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatSearchParamReader() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  return <ChatInterface initialQuery={q} />;
}
