import DashboardNavbar from '@/modules/dashboard/components/dashboard-navbar';
import { DashboardSidebar } from '@/modules/dashboard/components/dashboard-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BottomNav } from '@/modules/dashboard/components/bottom-nav';

import { ChatInterface } from "@/components/common/chat-interface";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col bg-background/90">
          <DashboardNavbar />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
      <ChatInterface />
    </SidebarProvider>
  );
};
export default Layout;
