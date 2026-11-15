import { toast } from "@heroui/react";
import {
  LucideFileExclamationPoint,
  LucideFileQuestionMark,
  LucideFileX,
  LucideListOrdered,
} from "lucide-react";
import mime from "mime";

import { humanReadableSize } from "./utils.ts";

export type UploadConfig = {
  accept: string[];
  maxCount: number;
  maxSize: number;
};

export function initUpload() {
  let dragTimeout = -1;

  window.addEventListener("dragover", () => {
    clearTimeout(dragTimeout);
    document.body.classList.add("dragging");
  });

  window.addEventListener("dragleave", () => {
    clearTimeout(dragTimeout);
    dragTimeout = window.setTimeout(() => {
      document.body.classList.remove("dragging");
    }, 100);
  });

  window.addEventListener("drop", () => {
    document.body.classList.remove("dragging");
    clearTimeout(dragTimeout);
  });

  window.addEventListener("blur", () => {
    document.body.classList.remove("dragging");
    clearTimeout(dragTimeout);
  });
}

export async function openFileSelector(config: Partial<UploadConfig>): Promise<File[]> {
  const { accept = [], maxCount = 1 } = config;
  const input = document.createElement("input");
  input.type = "file";
  if (accept.length > 0) input.accept = accept.join(", ");
  input.multiple = maxCount > 1;
  input.click();
  return new Promise((resolve, reject) => {
    const handleChange = () => {
      try {
        resolve(handleUpload(input.files, config));
      } catch (e) {
        reject(e);
      }
    };
    const handleFocus = () => {
      setTimeout(() => {
        input.removeEventListener("change", handleChange);
        window.removeEventListener("focus", handleFocus);
      }, 500);
    };
    input.addEventListener("change", handleChange);
    window.addEventListener("focus", handleFocus);
  });
}

export function handleUpload(files: FileList | null, config: Partial<UploadConfig>): File[] {
  const { accept = [], maxCount = 1, maxSize = 0 } = config;

  let result: File[] = [];
  if (files && files.length > 0)
    for (const file of files) {
      if (maxSize > 0 && file.size > maxSize) {
        toast.danger("文件过大", {
          description: `无法上传文件“${file.name}”！仅允许上传最大 ${humanReadableSize(maxSize)} 的文件`,
          indicator: <LucideFileExclamationPoint />,
        });
        continue;
      }
      if (accept.length > 0 && !accept.includes(file.type)) {
        toast.danger("无效文件类型", {
          description: `无法上传文件“${file.name}”！仅允许以下文件类型：${accept.map((m) => mime.getExtension(m)).join(", ")}`,
          indicator: <LucideFileX />,
        });
        continue;
      }
      result.push(file);
    }
  else
    toast.warning("未选择文件", {
      indicator: <LucideFileQuestionMark />,
    });

  if (maxCount > 0 && result.length > maxCount) {
    toast.warning("文件过多", {
      description: `上传文件的数量超过限制！仅允许上传最多 ${maxCount} 个文件`,
      indicator: <LucideListOrdered />,
    });
    result = result.slice(0, maxCount);
  }

  return result;
}
