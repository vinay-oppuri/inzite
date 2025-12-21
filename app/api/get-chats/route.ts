import { NextResponse } from "next/server";
import { db } from "../../../db";
import { chats } from "../../../db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('userId');

    if (!user_id) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

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
