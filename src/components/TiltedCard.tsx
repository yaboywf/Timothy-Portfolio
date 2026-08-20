import { useRef, type ReactNode } from "react";
import { SignedImage } from "@/components/SignedImage";
import "./tiltedcard.css";

export interface TiltedCardProps {
	imageSrc: string;
	altText?: string;
	captionText?: string;
	containerHeight?: string | number;
	containerWidth?: string | number;
	imageHeight?: string | number;
	imageWidth?: string | number;
	scaleOnHover?: number;
	rotateAmplitude?: number;
	showMobileWarning?: boolean;
	showTooltip?: boolean;
	overlayContent?: ReactNode;
	displayOverlayContent?: boolean;
	isSignedImage?: boolean;
}

export default function TiltedCard({
	imageSrc,
	altText = "Tilted card image",
	captionText = "",
	containerHeight = "300px",
	containerWidth = "100%",
	imageHeight = "300px",
	imageWidth = "300px",
	scaleOnHover = 1.1,
	rotateAmplitude = 14,
	showMobileWarning = false,
	showTooltip = true,
	overlayContent = null,
	displayOverlayContent = true,
	isSignedImage = false,
}: TiltedCardProps) {
	const figureRef = useRef<HTMLElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);
	const captionRef = useRef<HTMLElement>(null);
	const lastY = useRef(0);

	function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
		const figure = figureRef.current;
		const inner = innerRef.current;
		const caption = captionRef.current;

		if (!figure || !inner) return;

		const rect = figure.getBoundingClientRect();
		const offsetX = event.clientX - rect.left - rect.width / 2;
		const offsetY = event.clientY - rect.top - rect.height / 2;

		const rotateX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
		const rotateY = (offsetX / (rect.width / 2)) * rotateAmplitude;

		inner.style.setProperty("--rotate-x", `${rotateX}deg`);
		inner.style.setProperty("--rotate-y", `${rotateY}deg`);

		if (caption) {
			const velocityY = offsetY - lastY.current;

			caption.style.setProperty("--caption-x", `${event.clientX - rect.left}px`);
			caption.style.setProperty("--caption-y", `${event.clientY - rect.top}px`);
			caption.style.setProperty("--caption-rotate", `${-velocityY * 0.6}deg`);
		}

		lastY.current = offsetY;
	}

	function handleMouseEnter() {
		innerRef.current?.style.setProperty("--scale", String(scaleOnHover));
		captionRef.current?.style.setProperty("--caption-opacity", "1");
	}

	function handleMouseLeave() {
		const inner = innerRef.current;
		const caption = captionRef.current;

		inner?.style.setProperty("--scale", "1");
		inner?.style.setProperty("--rotate-x", "0deg");
		inner?.style.setProperty("--rotate-y", "0deg");

		caption?.style.setProperty("--caption-opacity", "0");
		caption?.style.setProperty("--caption-rotate", "0deg");
	}

	return (
		<figure
			ref={figureRef}
			className="tilted-card-figure"
			style={{ height: containerHeight, width: containerWidth }}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{showMobileWarning && (
				<div className="tilted-card-mobile-alert">
					This effect is not optimized for mobile. Check on desktop.
				</div>
			)}

			<div
				ref={innerRef}
				className="tilted-card-inner"
				style={{ width: imageWidth, height: imageHeight }}
			>
				{isSignedImage ? (
					<SignedImage
						path={imageSrc}
						alt={altText}
						className="tilted-card-img"
						style={{ width: imageWidth, height: imageHeight }}
					/>
				) : (
					<img
						src={imageSrc}
						alt={altText}
						className="tilted-card-img"
						style={{ width: imageWidth, height: imageHeight }}
					/>
				)}

				{displayOverlayContent && overlayContent && (
					<div className="tilted-card-overlay">{overlayContent}</div>
				)}
			</div>

			{showTooltip && (
				<figcaption ref={captionRef} className="tilted-card-caption">
					{captionText}
				</figcaption>
			)}
		</figure>
	);
}