import ImageKit from "imagekit-javascript";

const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
// Use local API for auth
const authenticationEndpoint = `${window.location.origin}/api/imagekit-auth`;

let imagekit: any = null;

try {
    console.log("ImageKit Config:", {
        urlEndpoint: urlEndpoint ? "Set" : "Missing",
        publicKey: publicKey ? "Set" : "Missing",
        endpointValue: urlEndpoint // Temporary: check if it's correct
    });

    if (urlEndpoint && publicKey) {
        imagekit = new ImageKit({
            urlEndpoint,
            publicKey,
            authenticationEndpoint
        } as any);
    }
} catch (e) {
    console.error("Failed to initialize ImageKit", e);
}

export const uploadImage = async (file: File): Promise<string> => {
    if (!imagekit) {
        console.warn("ImageKit is not initialized. Check .env variables.");
        throw new Error("ImageKit not configured. Please check your .env file.");
    }

    // DEBUG: Verify auth endpoint manually
    try {
        const authTest = await fetch(imagekit.options.authenticationEndpoint);
        const authText = await authTest.text();
        console.log("Auth Endpoint Debug:", {
            status: authTest.status,
            contentType: authTest.headers.get("content-type"),
            bodyPreview: authText.substring(0, 200)
        });

        if (!authText.includes("token") || !authText.includes("signature")) {
            console.error("Auth endpoint is NOT returning a valid token. It returned:", authText);
        }
    } catch (e) {
        console.error("Failed to reach auth endpoint:", e);
    }

    try {
        const response = await imagekit.upload({
            file: file,
            fileName: file.name,
            tags: ["valuation-app"]
        });
        return response.url;
    } catch (error) {
        console.error("Upload failed", error);
        throw error;
    }
};
