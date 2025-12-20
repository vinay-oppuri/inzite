import { NextResponse } from "next/server";
import { db } from "../../../db";
import { research_sessions } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        const session = await db
            .select()
            .from(research_sessions)
            .where(eq(research_sessions.sessionId, sessionId))
            .limit(1);

        if (!session.length) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json(session[0]);
    } catch (error) {
        console.error("Failed to get session status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
