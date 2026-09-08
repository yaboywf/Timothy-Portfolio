import type { ImgHTMLAttributes } from "preact";
import { getStorageImageUrl } from "@/lib/image";

export type StorageImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    path?: string;
    src?: string;
};

export function StorageImage({ path, src, alt = "", ...props }: StorageImageProps) {
    const imagePath = path || src;
    if (!imagePath) {
        return <div style={{ color: "#888", fontStyle: "italic", fontSize: "0.85rem" }}>No image selected</div>;
    }

    const url = getStorageImageUrl(imagePath);
    return <img src={url} alt={alt} {...props} />;
}

