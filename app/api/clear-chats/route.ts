import { NextResponse } from "next/server";
import { db } from "../../../db";
import { chats } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('userId');

    if (!user_id) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        await db.delete(chats).where(eq(chats.user_id, user_id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to clear chats:", error);
        return NextResponse.json({ error: "Failed to clear chats" }, { status: 500 });
    }
}
