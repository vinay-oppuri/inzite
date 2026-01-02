import ReportsView, { ReportsErrorState, ReportsLoadingState } from "@/modules/reports/views/reports-view"
import { HydrationBoundary } from "@tanstack/react-query"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

const Page = () => {
  return (
    <HydrationBoundary state={null}>
      <Suspense fallback={<ReportsLoadingState />}>
        <ErrorBoundary fallback={<ReportsErrorState />}>
          <ReportsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}
export default Page