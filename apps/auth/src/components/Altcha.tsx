import type { WidgetAttributes, WidgetMethods } from "altcha/types";

import "altcha";
import "altcha/i18n/zh-cn";
import "altcha/types/react";
import "altcha/themes/business.min.css";
import { API_AUTH } from "@repo/commons/api/types.ts";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

interface Props {
  onPayload?: (payload: string | null) => void;
}

export interface AltchaHandle {
  readonly payload: string | null;
  reset: () => void;
}

const Altcha = forwardRef<AltchaHandle, Props>(({ onPayload }, ref) => {
  const widgetRef = useRef<WidgetAttributes & WidgetMethods & HTMLElement>(null);
  const [payload, setPayload] = useState<string | null>(null);

  const reset = useCallback(() => {
    widgetRef.current?.reset();
    setPayload(null);
    onPayload?.(null);
  }, [onPayload]);

  useImperativeHandle(
    ref,
    () => ({
      get payload() {
        return payload;
      },
      reset,
    }),
    [payload, reset],
  );

  useEffect(() => {
    const handleStateChange = (ev: Event | CustomEvent) => {
      if ("detail" in ev) {
        const p = ev.detail.payload || null;
        setPayload(p);
        onPayload?.(p);
      }
    };

    const { current } = widgetRef;

    if (current) {
      current.addEventListener("statechange", handleStateChange);
      return () => current.removeEventListener("statechange", handleStateChange);
    }
  }, [onPayload]);

  return (
    <altcha-widget
      ref={widgetRef}
      challenge={new URL("auth/challenge", API_AUTH).toString()}
      theme="business"
      language="zh-cn"
    ></altcha-widget>
  );
});

export default Altcha;
