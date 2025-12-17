import { NextResponse } from "next/server";
import { db } from "../../../db";
import { reports } from "../../../db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const data = await db
            .select()
            .from(reports)
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
