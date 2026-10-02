// src/lib/storage.ts

const IMAGE_URL = import.meta.env.VITE_NEON_STORAGE_URL;

export function getStorageImageUrl(path: string): string {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:") || path.startsWith("/")) {
        return path;
    }

    return `${IMAGE_URL}/?key=${encodeURIComponent(path)}`;
}
