import "dotenv/config";
import { db } from "./db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("DATABASE_URL is set:", !!process.env.DATABASE_URL);
    if (process.env.DATABASE_URL) {
        try {
            const url = new URL(process.env.DATABASE_URL);
            console.log("Database Hostname:", url.hostname);
            console.log("Database Protocol:", url.protocol);
        } catch (e) {
            console.error("Failed to parse DATABASE_URL:", e);
        }
    }
    try {
        console.log("Testing internet connectivity...");
        await fetch("https://www.google.com");
        console.log("Internet connectivity check passed.");

        if (process.env.DATABASE_URL) {
            const url = new URL(process.env.DATABASE_URL);
            const neonEndpoint = `https://${url.hostname}/sql`;
            console.log(`Testing Neon HTTP endpoint: ${neonEndpoint}`);
            const res = await fetch(neonEndpoint);
            console.log(`Neon HTTP endpoint status: ${res.status}`);
        }
    } catch (e) {
        console.error("Connectivity check failed:", e);
    }

    try {
        console.log("Testing database connection...");
        const result = await db.execute(sql`SELECT 1`);
        console.log("Connection successful!");
        console.log("Result:", result);
    } catch (error) {
        console.error("Connection failed:");
        console.error(error);
    }
}

main();
