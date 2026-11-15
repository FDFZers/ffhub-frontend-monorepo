import type { School } from "@repo/shared/api/user/types.ts";

import { Button, Card } from "@heroui/react";
import clsx from "clsx";
import { useEffect, useState } from "react";

const STEP_MS = 1000;

const SCHOOL_NAMES = {
  fdfz: "复旦大学附属中学",
  ffxh: "复旦附中徐汇分校",
  ffqp: "复旦附中青浦分校",
  ffpd: "复旦附中浦东分校",
  ffja: "复旦附中静安分校",
} as const;

function SchoolIP({ school, onSubmit }: { school: School; onSubmit: () => void }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const fade = (delayMs: number, extra?: string) => ({
    className: clsx(
      "transition-opacity duration-2000 ease-out",
      shown ? "opacity-100" : "opacity-0",
      extra,
    ),
    style: { transitionDelay: `${delayMs}ms` },
  });

  return (
    <>
      <Card.Content className="flex w-100 max-w-full flex-col items-center justify-center p-8">
        <span {...fade(0, "mb-1 text-center text-2xl font-semibold")}>欢迎，</span>
        <span {...fade(STEP_MS, "mb-5 text-center text-4xl font-bold")}>
          {SCHOOL_NAMES[school]}
        </span>
        <span {...fade(2 * STEP_MS, "text-muted text-center text-sm")}>
          校园网登录将自动跳过二次验证
        </span>
      </Card.Content>

      <Card.Footer className="mt-2">
        <div {...fade(3.25 * STEP_MS, "w-full")}>
          <Button className="w-full" onPress={onSubmit}>
            下一步
          </Button>
        </div>
      </Card.Footer>
    </>
  );
}

export default SchoolIP;
