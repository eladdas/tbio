
import { storage } from "./server/storage";
import { insertPageSchema } from "./shared/schema";

async function test() {
    console.log("Starting test...");

    const testData = {
        title: "Test Page " + Date.now(),
        title_ar: "صفحة تجريبية",
        slug: "test-page-" + Date.now(),
        content: "Content",
        content_ar: "المحتوى",
        is_active: true,
        show_in_footer: true,
        display_order: 0,
    };

    try {
        console.log("Validating data...");
        const validation = insertPageSchema.safeParse(testData);
        if (!validation.success) {
            console.error("Validation failed:", validation.error.format());
            return;
        }

        console.log("Attempting to create page via storage.createPage...");
        const result = await storage.createPage(validation.data);
        console.log("Success! Created page ID:", result.id);

        // Cleanup
        // await storage.deletePage(result.id);
        // console.log("Cleaned up.");
    } catch (error) {
        console.error("Caught error during page creation:");
        console.error(error);
    }
}

test();
