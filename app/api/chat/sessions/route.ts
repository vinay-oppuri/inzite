import { NextResponse } from "next/server";
import { db } from "@/db";
import { chat_sessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const sessions = await db.select().from(chat_sessions)
            .where(eq(chat_sessions.userId, userId))
            .orderBy(desc(chat_sessions.updatedAt));

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error("Failed to fetch chat sessions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
