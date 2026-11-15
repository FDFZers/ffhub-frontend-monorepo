import { Button, type ButtonProps, toast, Typography } from "@heroui/react";
import clsx from "clsx";
import { LucideListOrdered, LucideUpload } from "lucide-react";
import mime from "mime";
import {
  type ChangeEvent,
  createContext,
  type DragEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { handleUpload, type UploadConfig } from "../utils/upload";
import { humanReadableSize } from "../utils/utils";

// ==================== 类型 ====================

export interface DropZoneProps {
  config?: Partial<UploadConfig>;
  clearOnSelect?: boolean;
  className?: string;
  children?: ReactNode;
  onChange?: (files: File[]) => void;
}

interface DropZoneContextValue {
  files: File[];
  setFiles: (files: FileList | File[]) => void;
  config: Partial<UploadConfig>;
  clearOnSelect: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
}

// ==================== Context ====================

const DropZoneContext = createContext<DropZoneContextValue | null>(null);

function useDropZoneContext() {
  const ctx = useContext(DropZoneContext);
  if (!ctx) {
    throw new Error("DropZone subcomponents must be used within <DropZone>");
  }
  return ctx;
}

// ==================== 函数 ====================

function applyFileSelection(
  newFiles: File[],
  currentFiles: File[],
  clearOnSelect: boolean,
  maxCount: number,
): File[] {
  if (newFiles.length === 0) return currentFiles;
  let combined = clearOnSelect ? newFiles : [...currentFiles, ...newFiles];
  if (maxCount > 0 && combined.length > maxCount) {
    toast.warning("文件过多", {
      description: `上传文件的数量超过限制！仅允许上传最多 ${maxCount} 个文件`,
      indicator: <LucideListOrdered />,
    });
    return combined.slice(0, maxCount);
  }
  return combined;
}

// ==================== 主要组件 ====================

export function DropZone({
  config = {},
  clearOnSelect = true,
  className = "",
  children,
  onChange,
  ref,
}: DropZoneProps & {
  ref?: Ref<HTMLDivElement>;
}) {
  const [files, setFilesState] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const prevFilesRef = useRef(files);
  useEffect(() => {
    if (prevFilesRef.current === files) return;
    prevFilesRef.current = files;
    onChangeRef.current?.(files);
  }, [files]);

  const setFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileList = Array.from(newFiles);
      if (fileList.length === 0) return;
      const maxCount = config.maxCount ?? 0;
      setFilesState((prev) => applyFileSelection(fileList, prev, clearOnSelect, maxCount));
    },
    [config.maxCount, clearOnSelect],
  );

  const contextValue = useMemo<DropZoneContextValue>(
    () => ({
      files,
      setFiles,
      config,
      clearOnSelect,
      inputRef,
    }),
    [files, setFiles, config, clearOnSelect],
  );

  return (
    <DropZoneContext.Provider value={contextValue}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </DropZoneContext.Provider>
  );
}

DropZone.displayName = "DropZone";

export function DropZoneArea({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const { setFiles, config } = useDropZoneContext();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const dropped = e.dataTransfer?.files;
      if (dropped && dropped.length > 0) {
        const fileList = handleUpload(dropped, config);
        setFiles(fileList);
      }
    },
    [config, setFiles],
  );

  return (
    <div
      className={clsx(
        "group",
        "flex",
        "flex-col",
        "justify-center",
        "items-center",
        "gap-2",
        "w-full",
        "h-full",
        "p-4",
        "rounded-(--field-radius,calc(var(--radius)*1.5))",
        "border",
        "border-border",
        "border-dashed",
        "[body.dragging_&]:border-solid",
        "[body.dragging_&]:border-accent",
        "[body.dragging_&]:bg-accent-soft",
        "transition-all",
        className,
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      {...rest}
    >
      {children}
    </div>
  );
}

DropZoneArea.displayName = "DropZone.Area";
DropZone.Area = DropZoneArea;

export function DropZoneIcon({ children }: { children?: ReactNode }) {
  return (
    <div>
      {children || <LucideUpload className="text-muted [body.dragging_&]:text-accent size-8" />}
    </div>
  );
}

DropZoneIcon.displayName = "DropZone.Icon";
DropZone.Icon = DropZoneIcon;

export function DropZoneLabel({ children }: { children?: ReactNode }) {
  return (
    <Typography type="body-sm" className="[body.dragging_&]:text-accent">
      {children || "点击或拖拽文件至此处以上传"}
    </Typography>
  );
}

DropZoneLabel.displayName = "DropZone.Label";
DropZone.Label = DropZoneLabel;

export function DropZoneDescription({ children }: { children?: ReactNode }) {
  const { config } = useDropZoneContext();

  const description = useMemo(() => {
    if (children) return children;

    const parts: string[] = [];
    const accept = config.accept ?? [];

    if (accept.length > 0) {
      const extensions = accept.map((m) => mime.getExtension(m)).join(", ");
      parts.push(`接受文件类型：${extensions}`);
    }
    if (config.maxSize) {
      parts.push(`最大文件大小：${humanReadableSize(config.maxSize)}`);
    }
    if (config.maxCount && config.maxCount > 1) {
      parts.push(`最多文件数量：${config.maxCount}`);
    }

    return parts.join("｜");
  }, [children, config.accept, config.maxSize, config.maxCount]);

  return (
    <Typography type="body-sm" color="muted" className="[body.dragging_&]:text-accent">
      {description}
    </Typography>
  );
}

DropZoneDescription.displayName = "DropZone.Description";
DropZone.Description = DropZoneDescription;

export function DropZoneInput({
  ref,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  ref?: Ref<HTMLInputElement>;
}) {
  const { config, setFiles, inputRef } = useDropZoneContext();

  useEffect(() => {
    if (inputRef.current) {
      if (typeof ref === "function") ref(inputRef.current);
      else if (ref) ref.current = inputRef.current;
    }
  }, [ref, inputRef]);

  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files;
      if (selected && selected.length > 0) {
        const fileList = handleUpload(selected, config);
        setFiles(fileList);
      }
      if (e.target) e.target.value = "";
    },
    [config, setFiles],
  );

  return (
    <input
      ref={inputRef}
      type="file"
      accept={config.accept?.join(",")}
      multiple={(config.maxCount ?? Infinity) !== 1}
      onChange={handleChange}
      className="hidden"
      {...props}
    />
  );
}

DropZoneInput.displayName = "DropZone.Input";
DropZone.Input = DropZoneInput;

export function DropZoneTrigger({
  children,
  ref,
  ...rest
}: ButtonProps & {
  ref?: Ref<HTMLButtonElement>;
  children?: ReactNode;
}) {
  const { inputRef } = useDropZoneContext();

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, [inputRef.current]);

  return (
    <Button ref={ref} type="button" variant="outline" onPress={handleClick} {...rest}>
      {children || "选择文件"}
    </Button>
  );
}

DropZoneTrigger.displayName = "DropZone.Trigger";
DropZone.Trigger = DropZoneTrigger;
