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
import { Logo } from "@/components/common/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart, LayoutGrid, MessageCircle, Workflow, Loader2, MessageSquare } from "lucide-react";
import { ModeToggle } from "@/components/common/mode-toggle";
import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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
    // Chats is handled manually
    {
        href: "/dashboard/reports",
        title: "Reports",
        icon: BarChart,
    },
];

interface Session {
    id: string;
    title: string;
}

export function DashboardSidebar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loadingChats, setLoadingChats] = useState(true);

    useEffect(() => {
        setMounted(true);
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/chat/sessions');
            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions || []);
            }
        } catch (error) {
            console.error("Failed to load chats", error);
        } finally {
            setLoadingChats(false);
        }
    };

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
                    <SidebarMenu className="gap-2">
                        {/* Static Items */}
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={pathname === "/dashboard"}
                                className={cn(
                                    "flex items-center gap-3 h-10 rounded-lg px-3 transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                    pathname === "/dashboard" && "bg-primary/10 text-primary font-semibold hover:bg-primary/10 hover:text-primary"
                                )}
                                asChild
                            >
                                <Link href="/dashboard">
                                    <LayoutGrid className="h-4 w-4 shrink-0" />
                                    <span className="text-sm">Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={pathname === "/dashboard/workflow"}
                                className={cn(
                                    "flex items-center gap-3 h-10 rounded-lg px-3 transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                    pathname === "/dashboard/workflow" && "bg-primary/10 text-primary font-semibold hover:bg-primary/10 hover:text-primary"
                                )}
                                asChild
                            >
                                <Link href="/dashboard/workflow">
                                    <Workflow className="h-4 w-4 shrink-0" />
                                    <span className="text-sm">Workflow</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/* Accordion for Chats */}
                        <SidebarMenuItem>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="chats" className="border-none">
                                    <AccordionTrigger className={cn(
                                        "flex items-center gap-3 h-10 rounded-lg px-3 transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:no-underline py-0 [&[data-state=open]]:text-foreground",
                                        pathname.startsWith("/dashboard/chats") && "text-primary font-semibold"
                                    )}>
                                        <div className="flex items-center gap-3 flex-1">
                                            <MessageCircle className="h-4 w-4 shrink-0" />
                                            <span className="text-sm">Chats</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-2 pt-1 px-2">
                                        <div className="flex flex-col gap-1 pl-4 border-l border-border/40 ml-4 py-1">
                                            <Link
                                                href="/dashboard/chats"
                                                className={cn(
                                                    "flex items-center gap-2 py-2 px-3 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                                    pathname === "/dashboard/chats" && !pathname.includes("?") && "bg-primary/10 text-primary font-medium"
                                                )}
                                            >
                                                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/20" />
                                                </div>
                                                <span className="text-xs font-medium">New Chat</span>
                                            </Link>

                                            {loadingChats ? (
                                                <div className="flex items-center gap-2 py-2 px-3 text-xs text-muted-foreground/50">
                                                    <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                                                </div>
                                            ) : sessions.slice(0, 5).map(session => (
                                                <Link
                                                    key={session.id}
                                                    href={`/dashboard/chats?sessionId=${session.id}`}
                                                    className={cn(
                                                        "flex flex-row items-center gap-2 py-2 px-3 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 truncate max-w-full",
                                                        pathname.includes(session.id) && "bg-primary/10 text-primary font-medium"
                                                    )}
                                                >
                                                    <MessageSquare className="w-3 h-3 shrink-0 opacity-40" />
                                                    <span className="truncate flex-1 text-xs">{session.title}</span>
                                                </Link>
                                            ))}

                                            {sessions.length > 5 && (
                                                <Link
                                                    href="/dashboard/chats"
                                                    className="text-[10px] text-muted-foreground/60 hover:text-primary px-3 py-1 mt-1 transition-colors"
                                                >
                                                    View all chats...
                                                </Link>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={pathname === "/dashboard/reports"}
                                className={cn(
                                    "flex items-center gap-3 h-10 rounded-lg px-3 transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                    pathname === "/dashboard/reports" && "bg-primary/10 text-primary font-semibold hover:bg-primary/10 hover:text-primary"
                                )}
                                asChild
                            >
                                <Link href="/dashboard/reports">
                                    <BarChart className="h-4 w-4 shrink-0" />
                                    <span className="text-sm">Reports</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
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