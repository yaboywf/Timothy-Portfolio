import { type ImgHTMLAttributes } from "react";
import { getSignedImage } from "@/lib/signed-image";
import { useQuery } from "@tanstack/react-query";

type SignedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
	path: string;
};

export function SignedImage({ path, alt, ...props }: SignedImageProps) {
	const { data: url, isLoading, error } = useQuery({
		queryKey: ["signed-image", path],
		queryFn: () => getSignedImage(path),
		staleTime: 2 * 60 * 60 * 1000,
	});

	if (isLoading) {
		return <div>Loading image...</div>;
	}

	if (error) {
		return <div>Error loading image...</div>;
	}

	return <img src={url} alt={alt} {...props} />;
}