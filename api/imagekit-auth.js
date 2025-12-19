import ImageKitLib from "imagekit";
const ImageKit = ImageKitLib.default || ImageKitLib;

export default function handler(req, res) {
    // Allow simple CORS for local development or production
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust this for production security if needed
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || process.env.VITE_IMAGEKIT_PRIVATE_KEY;
        const publicKey = process.env.VITE_IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLIC_KEY;
        const urlEndpoint = process.env.VITE_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT;

        if (!privateKey || !publicKey || !urlEndpoint) {
            console.error("Missing ImageKit Env Vars:", {
                hasPrivate: !!privateKey,
                hasPublic: !!publicKey,
                hasUrl: !!urlEndpoint
            });
            throw new Error("Missing environment variables");
        }

        const imagekit = new ImageKit({
            publicKey: publicKey.replace(/"/g, ''), // Remove potential quotes
            privateKey: privateKey.replace(/"/g, ''),
            urlEndpoint: urlEndpoint.replace(/"/g, '')
        });

        const authenticationParameters = imagekit.getAuthenticationParameters();

        res.status(200).json(authenticationParameters);
    } catch (error) {
        console.error("Auth generation error:", error);
        res.status(500).json({ error: "Could not generate auth parameters", details: error.message });
    }
}
