import { useEffect, useMemo, type ImgHTMLAttributes } from "react";
import { getSignedImage } from "@/lib/signed-image";
import { useQuery } from "@tanstack/react-query";

type SignedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
	path: string;
};

async function getImageBlob(path: string): Promise<Blob> {
	const signedUrl = await getSignedImage(path);
	const response = await fetch(signedUrl);

	if (!response.ok) {
		throw new Error("Could not download image");
	}

	return response.blob();
}

export function SignedImage({ path, alt, ...props }: SignedImageProps) {
	const { data: blob, isLoading, error } = useQuery({
		queryKey: ["signed-image", path],
		queryFn: () => getImageBlob(path),
		staleTime: 2 * 60 * 60 * 1000,
	});

	const url = useMemo(
		() => (blob ? URL.createObjectURL(blob) : undefined),
		[blob],
	);

	useEffect(() => {
		return () => {
			if (url) URL.revokeObjectURL(url);
		};
	}, [url]);

	if (isLoading) return <div>Loading image...</div>;
	if (error || !url) return <div>Error loading image...</div>;

	return <img src={url} alt={alt} {...props} />;
}