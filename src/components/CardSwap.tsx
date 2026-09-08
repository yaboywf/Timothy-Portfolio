import { cloneElement, createRef, isValidElement, toChildArray } from "preact";
import type { ComponentChildren, HTMLAttributes, JSX, Ref, TargetedMouseEvent, VNode } from "preact";
import { useEffect, useMemo, useRef } from "preact/hooks";
import gsap from 'gsap';
import styles from "./cardswap.module.css";
import { forwardRef } from "preact/compat";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    customClass?: string;
}

type CardElementProps = {
    style?: JSX.CSSProperties;
    onClick?: (
        event: TargetedMouseEvent<HTMLElement>,
    ) => void;
    ref?: Ref<HTMLElement>;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
    <div ref={ref} {...rest} className={`${styles.card} ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
Card.displayName = 'Card';

const makeSlot = (i: number, distX: number, distY: number, total: number) => ({
    x: i * distX,
    y: -i * distY,
    z: -i * distX * 1.5,
    zIndex: total - i
});

const placeNow = (el: HTMLElement | null, slot: ReturnType<typeof makeSlot>, skew: number) =>
    gsap.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true
    });

interface CardSwapProps {
    width?: number | string;
    height?: number | string;
    cardDistance?: number;
    verticalDistance?: number;
    delay?: number;
    pauseOnHover?: boolean;
    onCardClick?: (index: number) => void;
    skewAmount?: number;
    easing?: 'elastic' | 'smooth';
    children?: ComponentChildren;
}

const CardSwap = ({
    width = 800,
    height = 500,
    cardDistance = 60,
    verticalDistance = 70,
    delay = 5000,
    onCardClick,
    skewAmount = 6,
    easing = 'elastic',
    children
}: CardSwapProps) => {
    const config =
        easing === 'elastic'
            ? {
                ease: 'elastic.out(0.6,0.9)',
                durDrop: 2,
                durMove: 2,
                durReturn: 2,
                promoteOverlap: 0.9,
                returnDelay: 0.05
            }
            : {
                ease: 'power1.inOut',
                durDrop: 0.8,
                durMove: 0.8,
                durReturn: 0.8,
                promoteOverlap: 0.45,
                returnDelay: 0.2
            };

    const childArr = useMemo(() => toChildArray(children), [children]);
    const refs = useMemo(
        () => childArr.map(() => createRef<HTMLElement>()),
        [childArr.length]
    );

    const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));

    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const timeoutRef = useRef<number | undefined>(undefined)
    const isSwapping = useRef(false)
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const total = refs.length

        if (total === 0) {
            return
        }

        // Important. Fixes projects/cards that load after first render.
        if (order.current.length !== total) {
            order.current = Array.from({ length: total }, (_, index) => index)
        }

        refs.forEach((ref, index) => {
            placeNow(
                ref.current,
                makeSlot(index, cardDistance, verticalDistance, total),
                skewAmount
            )
        })

        const scheduleNextSwap = () => {
            timeoutRef.current = window.setTimeout(swap, delay)
        }

        const swap = () => {
            if (order.current.length < 2 || isSwapping.current) {
                return
            }

            const [front, ...rest] = order.current
            const elFront = refs[front].current

            if (!elFront) {
                return
            }

            isSwapping.current = true

            const tl = gsap.timeline({
                onComplete: () => {
                    order.current = [...rest, front]
                    isSwapping.current = false
                    scheduleNextSwap()
                },
            })

            tlRef.current = tl

            tl.to(elFront, {
                y: "+=500",
                duration: config.durDrop,
                ease: config.ease,
            })

            tl.addLabel(
                "promote",
                `-=${config.durDrop * config.promoteOverlap}`
            )

            rest.forEach((index, position) => {
                const element = refs[index].current

                if (!element) {
                    return
                }

                const slot = makeSlot(
                    position,
                    cardDistance,
                    verticalDistance,
                    total
                )

                tl.set(element, { zIndex: slot.zIndex }, "promote")

                tl.to(
                    element,
                    {
                        x: slot.x,
                        y: slot.y,
                        z: slot.z,
                        duration: config.durMove,
                        ease: config.ease,
                    },
                    `promote+=${position * 0.15}`
                )
            })

            const backSlot = makeSlot(
                total - 1,
                cardDistance,
                verticalDistance,
                total
            )

            tl.addLabel(
                "return",
                `promote+=${config.durMove * config.returnDelay}`
            )

            tl.set(elFront, { zIndex: backSlot.zIndex }, "return")

            tl.to(
                elFront,
                {
                    x: backSlot.x,
                    y: backSlot.y,
                    z: backSlot.z,
                    duration: config.durReturn,
                    ease: config.ease,
                },
                "return"
            )
        }

        scheduleNextSwap()

        return () => {
            window.clearTimeout(timeoutRef.current)
            tlRef.current?.kill()
        }
    }, [
        refs,
        childArr.length,
        cardDistance,
        verticalDistance,
        delay,
        skewAmount,
        easing,
    ])

    const rendered = childArr.map((child, i) => {
        if (isValidElement(child)) {
            const childElement = child as VNode<CardElementProps>
            return cloneElement(childElement, {
                key: i,
                ref: refs[i],
                style: { width, height, ...(childElement.props.style ?? {}) },
                onClick: (e: TargetedMouseEvent<HTMLElement>) => {
                    childElement.props.onClick?.(e);
                    onCardClick?.(i);
                }
            });
        }
        return child;
    });

    return (
        <div ref={container} className={styles["card-swap-container"]} style={{ width, height }}>
            {rendered}
        </div>
    );
};

export default CardSwap;
