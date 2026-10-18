import type { WidgetAttributes, WidgetMethods } from "altcha/types";

import "altcha";
import "altcha/i18n/zh-cn";
import "altcha/types/react";
import "altcha/themes/business.min.css";
import { API_AUTH } from "@repo/commons/api/types.ts";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

interface AltchaProps {
  onPayload?: (payload: string | null) => void;
}

const Altcha = forwardRef<{ payload: string | null }, AltchaProps>(({ onPayload }, ref) => {
  const widgetRef = useRef<WidgetAttributes & WidgetMethods & HTMLElement>(null);
  const [payload, setPayload] = useState<string | null>(null);

  useImperativeHandle(ref, () => {
    return {
      get payload() {
        return payload;
      },
    };
  }, [payload]);

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
