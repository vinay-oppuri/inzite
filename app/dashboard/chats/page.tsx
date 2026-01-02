import ChatView, { ChatsErrorState, ChatsLoadingState } from "@/modules/chats/views/chats-view";
import { HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const { sessionId } = await searchParams;
  return (
    <HydrationBoundary state={null}>
      <Suspense fallback={<ChatsLoadingState />}>
        <ErrorBoundary fallback={<ChatsErrorState />}>
          <ChatView initialSessionId={sessionId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
};

export default Page;