import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { chats } from "../../../../db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ user_id: string }> }
) {
    const { user_id } = await params;

    try {
        const history = await db
            .select()
            .from(chats)
            .where(eq(chats.user_id, user_id))
            .orderBy(asc(chats.created_at));

        return NextResponse.json({ chats: history });
    } catch (error) {
        console.error("Failed to fetch chats:", error);
        return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
    }
}
