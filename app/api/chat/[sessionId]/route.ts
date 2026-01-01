import { NextResponse } from "next/server";
import { db } from "@/db";
import { chat_sessions, messages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, asc, and } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        const { sessionId } = await params;

        // Verify session ownership
        const chatSession = await db.select().from(chat_sessions)
            .where(and(eq(chat_sessions.id, sessionId), eq(chat_sessions.userId, userId)))
            .limit(1);

        if (!chatSession.length) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Fetch messages
        const chatMessages = await db.select().from(messages)
            .where(eq(messages.sessionId, sessionId))
            .orderBy(asc(messages.createdAt));

        return NextResponse.json({ messages: chatMessages });
    } catch (error) {
        console.error("Failed to fetch chat messages:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
