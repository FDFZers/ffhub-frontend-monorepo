import clsx from "clsx";
import {
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
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
    ...rest
  } = props;

  const divRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const updateWidth = useCallback(() => {
    const div = divRef.current;
    const wrapper = wrapperRef.current;
    if (!div || !wrapper) return;

    const parent = div.parentElement!;
    const copy = wrapper.cloneNode(true) as HTMLDivElement;
    copy.style.position = "absolute";
    copy.style.visibility = "hidden";
    copy.style.width = propWidth ?? "max-content";
    copy.style.height = propHeight ?? "max-content";
    if (maxWidth) copy.style.maxWidth = maxWidth;
    if (maxHeight) copy.style.maxHeight = maxHeight;
    if (minWidth) copy.style.minWidth = minWidth;
    if (minHeight) copy.style.minHeight = minHeight;

    const isContainingBlock = parent.style.transform !== "";
    if (!isContainingBlock) parent.style.transform = "translateX(0px)";

    parent.appendChild(copy);
    const newWidth = propWidth ?? copy.offsetWidth + "px";
    const newHeight = propHeight ?? copy.offsetHeight + "px";
    copy.remove();

    if (!isContainingBlock) parent.style.transform = "";

    if (newWidth !== "0px") div.style.width = newWidth;
    if (newHeight !== "0px") div.style.height = newHeight;
  }, [propWidth, propHeight, maxWidth, maxHeight, minWidth, minHeight]);

  useLayoutEffect(() => {
    updateWidth();
  }, [updateWidth]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new MutationObserver(updateWidth);
    observer.observe(wrapper, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [updateWidth]);

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  return (
      <div
          ref={divRef}
          className={clsx(
              "transition-[width,height] duration-300 ease-out",
              className,
          )}
          {...rest}
      >
        <div ref={wrapperRef}>{children}</div>
      </div>
  );
}

export default DynamicDiv;