import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { chats } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ user_id: string }> }
) {
    const { user_id } = await params;

    try {
        await db.delete(chats).where(eq(chats.user_id, user_id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to clear chats:", error);
        return NextResponse.json({ error: "Failed to clear chats" }, { status: 500 });
    }
}
