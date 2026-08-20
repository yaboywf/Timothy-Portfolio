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
	const [state, setState] = useState<{ path: string; url?: string; error: boolean }>({
		path,
		url: undefined,
		error: false,
	});

	if (state.path !== path) {
		setState({ path, url: undefined, error: false });
	}

	useEffect(() => {
		if (!path) return;

		let cancelled = false;

		getCachedSignedImage(path)
			.then((signedUrl) => {
				if (!cancelled) setState({ path, url: signedUrl, error: false });
			})
			.catch(() => {
				if (!cancelled) setState({ path, url: undefined, error: true });
			});

		return () => {
			cancelled = true;
		};
	}, [path]);

	if (!path) return <div style={{ color: "#888", fontStyle: "italic", fontSize: "0.85rem" }}>No image selected</div>;
	if (state.error) return <div>Error loading image...</div>;
	if (!state.url) return <div>Loading image...</div>;

	return <img src={state.url} alt={alt} {...props} />;
}