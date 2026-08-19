const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portfolio-image`;

export async function getSignedImage(path: string): Promise<string> {
    const response = await fetch(
        `${functionUrl}?path=${encodeURIComponent(path)}`,
    );

    if (!response.ok) {
        throw new Error("Could not load image");
    }

    const data: { url: string } = await response.json();
    return data.url;
}