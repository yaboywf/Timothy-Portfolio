import { supabase } from "@/lib/supabase";

const STORAGE_BUCKET = "portfolio-images";

export function getStorageImageUrl(path: string): string {
    if (!path) return "";
    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("data:") ||
        path.startsWith("/")
    ) {
        return path;
    }
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

