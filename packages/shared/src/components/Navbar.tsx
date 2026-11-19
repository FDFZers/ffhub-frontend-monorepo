import { Avatar, Button, Dropdown, Label } from "@heroui/react";
import clsx from "clsx";
import {
  LucideChevronDown,
  LucideCompass,
  LucideHouse,
  LucideLink2,
  LucideLogOut,
  LucideSettings,
  LucideShieldCheck,
  LucideUser,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import type { UserProfile } from "../api/user/types.ts";

import { profileImageURL } from "../api/user/api.ts";
import { useLogout } from "../hooks/useLogout.ts";

export interface NavbarProps {
  /** 当前登录用户的资料，用于展示头像与昵称；为空时退回通用文案。 */
  profile?: UserProfile | null;
  /** 资料版本，用于在头像更新后绕过浏览器缓存。 */
  profileVersion?: number;
  /** 「主页」按钮目标，通常是当前用户的个人主页。 */
  homePath?: string;
  /** 「发现用户」按钮目标。 */
  searchPath?: string;
  /** 打开「账号与安全」弹窗。 */
  onOpenAccount?: () => void;
  /** 打开「第三方授权」弹窗。 */
  onOpenAuthorizations?: () => void;
  /** 打开「设置」弹窗。 */
  onOpenSettings?: () => void;
}

function displayName(profile: UserProfile | null | undefined): string {
  return profile?.nickname?.trim() || profile?.username || "我的账户";
}

function displayInitial(name: string): string {
  return Array.from(name)[0] ?? "我";
}

function Navbar({
  profile = null,
  profileVersion = 0,
  homePath = "/",
  searchPath = "/search",
  onOpenAccount,
  onOpenAuthorizations,
  onOpenSettings,
}: NavbarProps) {
  const [isFloating, setIsFloating] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const logout = useLogout();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > lastScrollY) setIsFloating(scrollY > 64);
      else setIsFloating(scrollY > 88);
      lastScrollY = scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const name = displayName(profile);
  const avatarSrc = profile?.id
    ? `${profileImageURL("avatar", profile.id)}?v=${profileVersion}`
    : undefined;
  const homeActive = pathname === "/" || pathname === homePath || pathname.startsWith("/user/");
  const searchActive = pathname === searchPath;

  return (
    <nav
      className={clsx(
        "border-border sticky top-0 left-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-3 transition-all duration-500 sm:px-4",
        isFloating &&
          "top-3 m-3 rounded-4xl border shadow-lg backdrop-blur-md backdrop-saturate-50",
        isFloating ? "bg-overlay/85 hover:bg-overlay/95" : "bg-overlay",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Link
          aria-label="复旦附中数字资源站 - 用户空间"
          className="flex min-w-0 items-center gap-2 rounded-xl px-1 py-1 focus-visible:ring-2 focus-visible:outline-none"
          to={homePath}
        >
          <img src="/assets/images/fdfz.png" alt="" className="size-8 shrink-0" />
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm leading-tight font-semibold">
              复旦附中数字资源站
            </span>
            <span className="text-muted block truncate text-xs leading-tight">用户空间</span>
          </span>
        </Link>

        <div className="ml-1 flex items-center gap-1">
          <Button
            aria-current={homeActive ? "page" : undefined}
            aria-label="主页"
            size="sm"
            variant={homeActive ? "secondary" : "ghost"}
            onPress={() => void navigate(homePath)}
          >
            <LucideHouse className="size-4" />
            <span className="hidden md:inline">主页</span>
          </Button>
          <Button
            aria-current={searchActive ? "page" : undefined}
            aria-label="发现用户"
            size="sm"
            variant={searchActive ? "secondary" : "ghost"}
            onPress={() => void navigate(searchPath)}
          >
            <LucideCompass className="size-4" />
            <span className="hidden md:inline">发现用户</span>
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Dropdown>
          <Dropdown.Trigger
            aria-label="账户菜单"
            className="focus-visible:ring-focus flex max-w-[15rem] items-center gap-2 rounded-full py-1 pr-2 pl-1 whitespace-nowrap focus-visible:ring-2 focus-visible:outline-none"
          >
            <Avatar color="accent" size="sm">
              {avatarSrc ? <Avatar.Image alt={name} src={avatarSrc} /> : null}
              <Avatar.Fallback>{displayInitial(name)}</Avatar.Fallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{name}</span>
            <LucideChevronDown className="text-muted hidden size-4 sm:block" />
          </Dropdown.Trigger>
          <Dropdown.Popover className="min-w-64" placement="bottom end">
            <div className="flex items-center gap-3 px-3 pt-3 pb-2">
              <Avatar color="accent" size="md">
                {avatarSrc ? <Avatar.Image alt={name} src={avatarSrc} /> : null}
                <Avatar.Fallback>{displayInitial(name)}</Avatar.Fallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="text-muted truncate text-xs">
                  {profile?.username ? `@${profile.username}` : "已登录"}
                </p>
              </div>
            </div>
            <Dropdown.Menu
              onAction={(key) => {
                const action = String(key);
                if (action === "account") onOpenAccount?.();
                else if (action === "authorizations") onOpenAuthorizations?.();
                else if (action === "settings") onOpenSettings?.();
                else if (action === "profile") void navigate(homePath);
                else if (action === "logout") void logout();
              }}
            >
              <Dropdown.Item id="account" textValue="账号与安全">
                <LucideShieldCheck className="text-muted size-4 shrink-0" />
                <Label>账号与安全</Label>
              </Dropdown.Item>
              <Dropdown.Item id="authorizations" textValue="第三方授权">
                <LucideLink2 className="text-muted size-4 shrink-0" />
                <Label>第三方授权</Label>
              </Dropdown.Item>
              <Dropdown.Item id="settings" textValue="设置">
                <LucideSettings className="text-muted size-4 shrink-0" />
                <Label>设置</Label>
              </Dropdown.Item>
              <Dropdown.Item id="profile" textValue="我的主页">
                <LucideUser className="text-muted size-4 shrink-0" />
                <Label>我的主页</Label>
              </Dropdown.Item>
              <Dropdown.Item
                className="border-border mt-1 border-t"
                id="logout"
                textValue="退出登录"
                variant="danger"
              >
                <LucideLogOut className="size-4 shrink-0" />
                <Label>退出登录</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </nav>
  );
}

export default Navbar;
