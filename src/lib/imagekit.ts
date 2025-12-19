import ImageKit from "imagekit-javascript";

const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
// Use local API for auth
const authenticationEndpoint = `${window.location.origin}/api/imagekit-auth`;

// ImageKit is initialized locally.
// For production, ensure VITE_IMAGEKIT_URL_ENDPOINT and VITE_IMAGEKIT_PUBLIC_KEY are set.

let imagekit: any = null;

try {
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
