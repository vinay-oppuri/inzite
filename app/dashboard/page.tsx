import { auth } from "@/lib/auth"
import DashboardView, { DashboardErrorState, DashboardLoadingState } from "@/modules/dashboard/ui/views/dashboard-view"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { HydrationBoundary } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"

const Page = async () => {
        const session = await auth.api.getSession({
            headers: await headers()
        })
    
        if(!session) {
            redirect('/login')
        }
    return (
        <HydrationBoundary state={null}>
            <Suspense fallback={<DashboardLoadingState />}>
                <ErrorBoundary fallback={<DashboardErrorState />}>
                    <DashboardView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}
export default Page