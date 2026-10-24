import clsx from "clsx";
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type DynamicDivProps = {
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  children?: ReactNode;
};

type MeasuredSize = {
  width?: string;
  height?: string;
};

const EMPTY_SIZE: MeasuredSize = {};

function stripDuplicateIds(node: HTMLElement) {
  if (node.id) node.removeAttribute("id");
  node.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
}

function decodeImage(img: HTMLImageElement): Promise<void> {
  if (typeof img.decode !== "function") return Promise.resolve();
  return img.decode().catch(() => {});
}

function DynamicDiv(props: DynamicDivProps & HTMLAttributes<HTMLDivElement>) {
  const {
    width: propWidth,
    height: propHeight,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    children,
    className,
    style,
    ...rest
  } = props;

  const divRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [measured, setMeasured] = useState<MeasuredSize>(EMPTY_SIZE);
  const lastMeasuredRef = useRef<MeasuredSize>(EMPTY_SIZE);

  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const measureIdRef = useRef(0);
  const mountedRef = useRef(true);

  const cancelScheduled = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const measure = useCallback(async () => {
    const div = divRef.current;
    const wrapper = wrapperRef.current;
    const parent = div?.parentElement ?? null;

    if (!div || !wrapper || !parent) return;
    if (propWidth && propHeight) return;

    const id = ++measureIdRef.current;

    let copy: HTMLDivElement | null = null;
    let parentTransform: string | null = null;

    try {
      copy = wrapper.cloneNode(true) as HTMLDivElement;
      stripDuplicateIds(copy);

      const s = copy.style;
      s.position = "absolute";
      s.top = "0";
      s.left = "0";
      s.margin = "0";
      s.visibility = "hidden";
      s.pointerEvents = "none";
      s.width = propWidth ?? "max-content";
      s.height = propHeight ?? "max-content";
      if (maxWidth) s.maxWidth = maxWidth;
      if (maxHeight) s.maxHeight = maxHeight;
      if (minWidth) s.minWidth = minWidth;
      if (minHeight) s.minHeight = minHeight;

      const parentStyles = getComputedStyle(parent);
      if (parentStyles.transform === "none" && parentStyles.position === "static") {
        parentTransform = parent.style.transform;
        parent.style.transform = "translateX(0px)";
      }

      parent.appendChild(copy);

      const images = copy.querySelectorAll("img");
      if (images.length > 0) {
        await Promise.all(Array.from(images, decodeImage));
      }

      if (!mountedRef.current || id !== measureIdRef.current) return;

      const rect = copy.getBoundingClientRect();

      if (rect.width === 0 && rect.height === 0) return;

      const nextWidth = propWidth ?? `${rect.width}px`;
      const nextHeight = propHeight ?? `${rect.height}px`;

      const prev = lastMeasuredRef.current;
      if (prev.width === nextWidth && prev.height === nextHeight) return;

      lastMeasuredRef.current = { width: nextWidth, height: nextHeight };
      setMeasured(lastMeasuredRef.current);
    } finally {
      copy?.remove();
      if (parentTransform !== null) parent.style.transform = parentTransform;
    }
  }, [propWidth, propHeight, maxWidth, maxHeight, minWidth, minHeight]);

  const scheduleMeasure = useCallback(() => {
    cancelScheduled();
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      void measure();
    });
  }, [measure, cancelScheduled]);

  const scheduleMeasureSoon = useCallback(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      void measure();
    }, 100);
  }, [measure]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    void measure();
  }, [measure]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const mutationObserver = new MutationObserver(scheduleMeasure);
    mutationObserver.observe(wrapper, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    const resizeObserver = new ResizeObserver(scheduleMeasureSoon);
    resizeObserver.observe(wrapper);

    const onWindowResize = () => scheduleMeasure();
    window.addEventListener("resize", onWindowResize);

    let disposed = false;
    document.fonts?.ready
      .then(() => {
        if (!disposed) scheduleMeasure();
      })
      .catch(() => {});

    return () => {
      disposed = true;
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", onWindowResize);
      cancelScheduled();
    };
  }, [scheduleMeasure, scheduleMeasureSoon, cancelScheduled]);

  const resolvedStyle: CSSProperties = { ...style };
  const finalWidth = propWidth ?? measured.width;
  const finalHeight = propHeight ?? measured.height;
  if (finalWidth !== undefined) resolvedStyle.width = finalWidth;
  if (finalHeight !== undefined) resolvedStyle.height = finalHeight;

  return (
    <div
      ref={divRef}
      className={clsx("transition-[width,height] duration-300 ease-out", className)}
      style={resolvedStyle}
      {...rest}
    >
      <div ref={wrapperRef}>{children}</div>
    </div>
  );
}

export default DynamicDiv;
