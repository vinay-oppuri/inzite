'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart, LayoutGrid, MessageCircle, Workflow } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useEffect, useState } from "react";

const navitems = [
    {
        href: "/dashboard",
        title: "Dashboard",
        icon: LayoutGrid,
    },
    {
        href: "/dashboard/workflow",
        title: "Workflow",
        icon: Workflow,
    },
    {
        href: "/dashboard/chats",
        title: "Chats",
        icon: MessageCircle,
    },
    {
        href: "/dashboard/reports",
        title: "Reports",
        icon: BarChart,
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <Sidebar>
            <SidebarHeader>
                <Link href="/" className="flex items-center justify-center py-6">
                    <Logo className="w-auto h-6 text-primary" />
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {navitems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={isActive}
                                        className={cn(
                                            "flex items-center gap-3 h-12 rounded-lg px-4 border border-transparent transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:scale-105",
                                            isActive && "bg-primary/10 text-primary border-primary/20"
                                        )}
                                    >
                                        <Link href={item.href} className="flex items-center gap-3 w-full">
                                            <Icon className="h-5 w-5 shrink-0" />
                                            <span className="text-sm font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-border/50">
                <div className="flex items-center justify-between gap-2 px-2">
                    <span className="text-sm text-muted-foreground font-medium">Theme</span>
                    <ModeToggle />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}