import { RefObject, useLayoutEffect, useState } from "react";

/**
 * @description The inner width / height does not include border or scrollbar.
 * The full width / height does. If inner width != full width, you can detect
 * the existence of a scrollbar (you may have to subtract width of border * 2)
 */
function useResizeObserver<ElementType extends HTMLElement>(
    elementRef: RefObject<ElementType>,
    defaultSizes = 0
) {
    const [ size, setSize ] = useState({
        innerWidth: defaultSizes,
        innerHeight: defaultSizes,
        fullWidth: defaultSizes,
        fullHeight: defaultSizes
    });

    useLayoutEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        function measure(target: ElementType) {
            setSize({
                innerWidth: target.clientWidth,
                innerHeight: target.clientHeight,
                fullWidth: target.offsetWidth,
                fullHeight: target.offsetHeight
            });
        }

        // Measure synchronously in the layout phase so components that derive
        // geometry from this hook do not paint once at their fallback size and
        // then visibly jump when ResizeObserver delivers its first callback.
        measure(element);

        const observer = new ResizeObserver(entries => {
            const target = entries[0]?.target as ElementType | undefined;
            if (target) measure(target);
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return size;
}

export default useResizeObserver;