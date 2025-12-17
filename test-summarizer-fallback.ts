import { Summarizer } from './lib/core/summarizer';

// Manually mock the GoogleGenerativeAI behavior by overwriting the prototype or method
// Since we can't easily mock the import in ts-node without jest, we'll subclass or monkey-patch if possible.
// A simpler way for this specific test is to modify the Summarizer instance directly if possible, 
// or just rely on the fact that we can't easily mock the constructor here without a DI framework.

// Alternative: We can just create a temporary test file that imports a modified version of the class, 
// but since we modified the actual file, we can try to trigger the error by passing an invalid API key 
// (which is already the case if we don't set GOOGLE_KEY_REPORT correctly, but we want to be sure).

// Let's try to monkey-patch the `model` property of the summarizer instance.
// We need to cast to any to access private property for testing purposes.

async function testFallback() {
    const summarizer = new Summarizer();

    // Monkey-patch the model to force an error
    (summarizer as any).model = {
        generateContent: async () => {
            throw new Error("Simulated Quota Exceeded");
        }
    };

    const mockContexts = [
        "Trend 1: Pet ownership is rising globally.",
        "Trend 2: Mobile apps for pet care are becoming popular.",
        "Competitor A: Offers dog walking services.",
        "Competitor B: Provides pet taxi services."
    ];

    console.log("Testing Summarizer Fallback...");
    const result = await summarizer.summarize("uber for pets", mockContexts);

    console.log("\n--- Result ---");
    console.log(JSON.stringify(result, null, 2));
}

testFallback();
