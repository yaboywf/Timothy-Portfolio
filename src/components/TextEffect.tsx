import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import styles from "./textEffect.module.css";

type BlurTextProps = {
    text: string;
    delay?: number;
    animateBy?: "words" | "characters";
    threshold?: number;
    rootMargin?: string;
    className?: string;
};

export default function BlurText({
    text,
    delay = 200,
    animateBy = "words",
    threshold = 0.1,
    rootMargin = "0px",
    className = ""
}: BlurTextProps) {
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);

    const elements = useMemo(
        () => (animateBy === "words" ? text.split(" ") : text.split("")),
        [text, animateBy],
    );

    useEffect(() => {
        const element = ref.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(element);
                }
            },
            { threshold, rootMargin },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    return (
        <p
            ref={ref}
            className={className}
            style={{ display: "flex", flexWrap: "wrap" }}
        >
            {elements.map((segment, index) => (
                <span
                    key={`${segment}-${index}`}
                    className={`${styles.blur_segment} ${inView ? styles.show : ""}`}
                    style={{
                        transition: `all 0.6s ease ${(index * delay) / 1000}s`,
                    }}
                >
                    {segment === " " ? "\u00A0" : segment}
                    {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
                </span>
            ))}
        </p>
    );
}