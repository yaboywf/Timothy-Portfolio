import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { getSignedImage } from "@/lib/signed-image";

type SignedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
	path: string;
};

const CACHE_DURATION = 2 * 60 * 60 * 1000;

const imageCache = new Map<
	string,
	{ url: string; expiresAt: number }
>();

async function getCachedSignedImage(path: string) {
	const cached = imageCache.get(path);

	if (cached && cached.expiresAt > Date.now()) {
		return cached.url;
	}

	const url = await getSignedImage(path);

	imageCache.set(path, {
		url,
		expiresAt: Date.now() + CACHE_DURATION,
	});

	return url;
}

export function SignedImage({ path, alt, ...props }: SignedImageProps) {
	const [url, setUrl] = useState<string>();
	const [error, setError] = useState(false);

	useEffect(() => {
		let cancelled = false;

		setUrl(undefined);
		setError(false);

		getCachedSignedImage(path)
			.then((signedUrl) => {
				if (!cancelled) setUrl(signedUrl);
			})
			.catch(() => {
				if (!cancelled) setError(true);
			});

		return () => {
			cancelled = true;
		};
	}, [path]);

	if (error) return <div>Error loading image...</div>;
	if (!url) return <div>Loading image...</div>;

	return <img src={url} alt={alt} {...props} />;
}