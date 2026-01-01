import { NextResponse } from "next/server";
import { inngest } from "../../../inngest/client";
import { db } from "../../../db";
import { research_sessions } from "../../../db/schema";
import { v4 as uuidv4 } from "uuid";
import { auth } from "../../../lib/auth"; // Import auth
import { headers } from "next/headers";

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        // 1. Get User Session
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const sessionId = uuidv4();

        // Create a new research session
        await db.insert(research_sessions).values({
            sessionId,
            status: "processing",
            currentStep: "Initializing Research Workflow...",
            logs: [],
        });

        await inngest.send({
            name: "workflow/research",
            data: { query, sessionId, userId }, // Pass userId
        });

        return NextResponse.json({ success: true, message: "Research started", sessionId });
    } catch (error) {
        console.error("Failed to start research:", error);
        return NextResponse.json(
            { error: "Failed to start research" },
            { status: 500 }
        );
    }
}
