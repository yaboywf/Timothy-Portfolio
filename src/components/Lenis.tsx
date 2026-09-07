import Lenis from "lenis"
import { useEffect } from "preact/hooks"

export function SmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({
            autoRaf: true,
            smoothWheel: true,
        })

        return () => {
            lenis.destroy()
        }
    }, [])

    return null
}