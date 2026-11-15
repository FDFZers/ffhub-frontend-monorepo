import { Tooltip as NativeTooltip, type TooltipProps } from "@heroui/react";
import { useEffect, useRef, useState } from "react";

export const Tooltip = (props: TooltipProps) => {
  const { isOpen, onOpenChange, children, ...otherProps } = props;
  const [internalOpen, setInternalOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClose = (e: TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setInternalOpen(false);
      }
    };

    if (internalOpen) {
      requestAnimationFrame(() => {
        window.addEventListener("touchend", handleClose);
      });
    }

    return () => {
      window.removeEventListener("touchend", handleClose);
    };
  }, [internalOpen]);

  return (
    <NativeTooltip
      {...otherProps}
      isOpen={isOpen ?? internalOpen}
      onOpenChange={(open) => {
        requestAnimationFrame(() => {
          if (isOpen == undefined) {
            setInternalOpen(open);
          }
          onOpenChange?.(open);
        });
      }}
    >
      <div
        ref={wrapperRef}
        className="contents"
        onTouchEnd={() => {
          if (!internalOpen) setInternalOpen(true);
        }}
      >
        {children}
      </div>
    </NativeTooltip>
  );
};

Tooltip.Root = NativeTooltip.Root;
Tooltip.Arrow = NativeTooltip.Arrow;
Tooltip.Content = NativeTooltip.Content;
Tooltip.Trigger = NativeTooltip.Trigger;

export default Tooltip;
