import { NextResponse } from "next/server";
import { VectorStoreManager } from "@/lib/core/rag-manager";
import { LLMClient } from "@/lib/llm-client";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { chat_sessions, messages as messagesTable } from "@/db/schema";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm"; // Add drizzle-orm imports

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const { messages, sessionId } = body; // Expect sessionId in body if existing chat

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        const userQuery = lastMessage.content;

        // --- Session Management ---
        let currentSessionId = sessionId;

        if (!currentSessionId) {
            // New Session: Create it with title from first message
            const title = userQuery.slice(0, 50) + (userQuery.length > 50 ? "..." : "");
            const [newSession] = await db.insert(chat_sessions).values({
                userId,
                title,
            }).returning({ id: chat_sessions.id });
            currentSessionId = newSession.id;
        } else {
            // Validate existing session ownership
            const existingSession = await db.select().from(chat_sessions)
                .where(and(eq(chat_sessions.id, currentSessionId), eq(chat_sessions.userId, userId)))
                .limit(1);

            if (!existingSession.length) {
                return NextResponse.json({ error: "Session not found or access denied" }, { status: 404 });
            }
        }

        // Save User Message
        await db.insert(messagesTable).values({
            sessionId: currentSessionId,
            role: "user",
            content: userQuery,
        });


        // 1. Retrieve Context
        const ragManager = new VectorStoreManager();
        const results = await ragManager.search(userQuery, 5, userId); // Retrieve top 5 chunks filtered by userId

        const context = results.map(r => r.content).join("\n\n---\n\n");

        // 2. Generate Answer
        const llmClient = new LLMClient();
        const systemPrompt = `
        You are an intelligent assistant for Inzite, helping users understand their research reports.
        Answer the user's question based strictly on the provided context.
        If the answer is not found in the context, politely say so, but try to be helpful if it's a general question related to the topic.
        
        Context from Reports:
        ${context}

        Question:
        ${userQuery}
        `;

        const response = await llmClient.generate(systemPrompt, { temperature: 0.3 });
        const assistantResponse = response.text;

        // Save Assistant Message
        await db.insert(messagesTable).values({
            sessionId: currentSessionId,
            role: "assistant",
            content: assistantResponse,
        });

        // Return response AND the sessionId so the frontend can track context
        return NextResponse.json({
            role: "assistant",
            content: assistantResponse,
            sessionId: currentSessionId
        });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
