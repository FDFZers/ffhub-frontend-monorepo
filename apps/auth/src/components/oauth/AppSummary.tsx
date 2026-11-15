import type { AppInfo } from "@repo/shared/api/apps/types.ts";

import { Chip, Link, Typography } from "@heroui/react";
import { appIconURL } from "@repo/shared/api/apps/api.ts";
import clsx from "clsx";
import { LucideAppWindow, LucideArrowUpRight } from "lucide-react";
import { useState } from "react";

import { isSafeHTTPURL } from "../../utils/oauth.ts";

interface AppIconProps {
  app: AppInfo;
  className?: string;
}

export function AppIcon({ app, className }: AppIconProps) {
  const iconURL = appIconURL(app.id);
  const [failedIcon, setFailedIcon] = useState<string | null>(null);

  return (
    <span
      className={clsx(
        "border-border/60 bg-surface-secondary relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border",
        className ?? "size-14",
      )}
    >
      <LucideAppWindow className="text-muted size-6" aria-hidden />
      {failedIcon !== iconURL && (
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          src={iconURL}
          onError={() => setFailedIcon(iconURL)}
        />
      )}
    </span>
  );
}

interface AppSummaryProps {
  app: AppInfo;
}

export default function AppSummary({ app }: AppSummaryProps) {
  const homepage = app.homepage_url.trim();
  const description = app.description.trim();

  return (
    <div className="flex items-start gap-3">
      <AppIcon app={app} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Typography type="h3" className="m-0 truncate">
            {app.name}
          </Typography>
          <Chip size="sm" variant="soft">
            {app.namespace}
          </Chip>
        </div>
        {description.length > 0 && (
          <Typography type="body-sm" color="muted">
            {description}
          </Typography>
        )}
        {isSafeHTTPURL(homepage) && (
          <Link
            className="text-accent hover:text-accent-hover flex w-fit items-center gap-1 text-sm no-underline"
            href={homepage}
            rel="noreferrer noopener"
            target="_blank"
          >
            访问应用主页
            <LucideArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
