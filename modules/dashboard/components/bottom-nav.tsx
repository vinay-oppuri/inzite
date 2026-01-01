'use client';

import { useRouter, usePathname } from "next/navigation";
import { LimelightNav } from "../../../components/ui/limelight-nav";
import { Home, Compass, LayoutDashboard, Workflow, BarChartHorizontal, MessageCircle } from "lucide-react";

export const BottomNav = () => {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        {
            id: 'dashboard',
            icon: <LayoutDashboard />,
            label: 'Reports',
            onClick: () => router.push('/dashboard')
        },
        {
            id: 'explore',
            icon: <MessageCircle />,
            label: 'Explore',
            onClick: () => router.push('/dashboard/chats')
        },
        {
            id: 'workflow',
            icon: <Workflow />,
            label: 'Workflow',
            onClick: () => router.push('/dashboard/workflow')
        },
        {
            id: 'reports',
            icon: <BarChartHorizontal />,
            label: 'Reports',
            onClick: () => router.push('/dashboard/reports')
        },
    ];

    const activeIndex = navItems.findIndex(item => {
        if (item.id === 'dashboard') return pathname === '/dashboard' || pathname === '/';
        return pathname.includes(item.id);
    });

    // Default to 0 if no match
    const finalActiveIndex = activeIndex === -1 ? 0 : activeIndex;

    return (
        <div className="fixed bottom-2 left-2 z-50">
            <LimelightNav
                key={pathname}
                defaultActiveIndex={finalActiveIndex}
                items={navItems}
                className="bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl rounded-full h-14 px-2"
                iconClassName="text-white/50 hover:text-white transition-colors"
                limelightClassName="bg-primary shadow-[0_0_20px_var(--primary)]"
            />
        </div>
    );
};