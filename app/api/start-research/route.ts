import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client";

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        await inngest.send({
            name: "workflow/research",
            data: { query },
        });

        return NextResponse.json({ success: true, message: "Research started" });
    } catch (error) {
        console.error("Failed to start research:", error);
        return NextResponse.json(
            { error: "Failed to start research" },
            { status: 500 }
        );
    }
}
