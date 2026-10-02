import type { JSX } from "preact";
import { getStorageImageUrl } from "@/lib/image";

export type StorageImageProps = JSX.IntrinsicElements["img"] & {
    path?: string;
};

export function StorageImage(props: StorageImageProps) {
    const { path, src, ...imgProps } = props;

    const imagePath = path ?? (typeof src === "string" ? src : undefined);

    if (!imagePath) {
        return (
            <div
                style={{
                    color: "#888",
                    fontStyle: "italic",
                    fontSize: "0.85rem",
                }}
            >
                No image selected
            </div>
        );
    }

    return <img {...imgProps} src={getStorageImageUrl(imagePath)} />;
}
