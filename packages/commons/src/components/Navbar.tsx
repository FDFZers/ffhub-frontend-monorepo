import { Avatar, Button, Separator } from "@heroui/react";
import clsx from "clsx";
import {
  LucideBell,
  LucideChevronDown,
  LucideCircleQuestionMark,
  LucideCompass,
  LucideHouse,
  LucideSearch,
} from "lucide-react";
import { useEffect, useState } from "react";

function Navbar() {
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > lastScrollY) setIsFloating(window.scrollY > 64);
      else setIsFloating(window.scrollY > 88);
      lastScrollY = scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={clsx(
        "border-border sticky top-0 left-0 z-10 flex h-16 items-center justify-between border-b p-4 transition-all duration-500",
        isFloating &&
          "top-3 m-3 rounded-4xl border shadow-lg backdrop-blur-md backdrop-saturate-50",
        isFloating ? "bg-overlay/85 hover:bg-overlay/95" : "bg-overlay",
      )}
    >
      <div className="flex items-center gap-2">
        <img src="/assets/images/fdfz.png" alt="" className="size-8" />
        <p className="mr-4 text-lg font-medium">复旦附中数字资源站</p>
        <Button variant="ghost" size="sm">
          <LucideHouse />
          主页
        </Button>
        <Button variant="ghost" size="sm">
          <LucideCompass />
          站点导航
        </Button>
        <Button variant="ghost" size="sm">
          <LucideSearch />
          全站搜索
        </Button>
        <Button variant="ghost" size="sm">
          <LucideCircleQuestionMark />
          帮助中心
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <LucideBell />
          通知中心
        </Button>
        <Separator orientation="vertical" className="mr-2 ml-1" />
        <Avatar size="sm">
          <img src="https://q1.qlogo.cn/g?b=qq&nk=1577438625&s=640" alt="" />
        </Avatar>
        <p className="text-md font-medium">Tigercrl</p>
        <LucideChevronDown className="text-muted size-4" />
      </div>
    </nav>
  );
}

export default Navbar;
