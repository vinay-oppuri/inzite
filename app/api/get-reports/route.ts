import { NextResponse } from "next/server";
import { db } from "../../../db";
import { reports } from "../../../db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const data = await db
            .select()
            .from(reports)
            .where(eq(reports.userId, userId))
            .orderBy(desc(reports.created_at));

        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Error fetching reports:", error);
        return NextResponse.json(
            { error: "Failed to fetch reports" },
            { status: 500 }
        );
    }
}
