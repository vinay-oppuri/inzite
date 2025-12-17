import { NextResponse } from "next/server";
import { db } from "../../../db";
import { reports } from "../../../db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
    try {
        const latestReport = await db
            .select()
            .from(reports)
            .orderBy(desc(reports.created_at))
            .limit(1);

        if (!latestReport.length) {
            // Try fallback file
            try {
                const fs = await import("fs/promises");
                const path = await import("path");
                const filePath = path.join(process.cwd(), "generated", "latest-report.json");
                const fileContent = await fs.readFile(filePath, "utf-8");
                return NextResponse.json(JSON.parse(fileContent));
            } catch {
                return NextResponse.json(null);
            }
        }

        return NextResponse.json(latestReport[0]);
    } catch (error) {
        console.error("Failed to fetch latest report from DB:", error);
        // Fallback: Try reading from file
        try {
            const fs = await import("fs/promises");
            const path = await import("path");
            const filePath = path.join(process.cwd(), "generated", "latest-report.json");
            const fileContent = await fs.readFile(filePath, "utf-8");
            return NextResponse.json(JSON.parse(fileContent));
        } catch (fileError) {
            console.error("Failed to fetch latest report from file fallback:", fileError);
            return NextResponse.json(
                { error: "Failed to fetch latest report" },
                { status: 500 }
            );
        }
    }
}
