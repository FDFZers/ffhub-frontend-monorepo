import { Button, Card, Chip } from "@heroui/react";
import { DropZone } from "@repo/commons/components/DropZone.tsx";
import { useEffect, useState } from "react";

interface Props {
  initial: File | null;
  onNext: (proofImage: File) => void;
  onBack: () => void;
}

const UPLOAD_CONFIG = {
  maxSize: 5 << 20, // 2MB
  accept: ["image/png", "image/jpeg", "image/heif"],
  maxCount: 1,
};

function Proof({ initial, onNext, onBack }: Props) {
  const [proofImage, setProofImage] = useState<File | null>(initial);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 生成/释放图片预览的 Object URL
  useEffect(() => {
    if (!proofImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(proofImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [proofImage, setPreviewUrl]);

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>身份证明</Card.Title>
        <Card.Description>
          请提供能证明身份的材料，例如校园卡照片、校园网个人页面截图等
        </Card.Description>
        <Chip className="absolute top-0 right-0">5 / 6</Chip>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <DropZone config={UPLOAD_CONFIG} onChange={(files) => setProofImage(files[0] ?? null)}>
          <DropZone.Area>
            {proofImage ? (
              <div className="flex w-full flex-col items-center gap-3">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="身份证明预览"
                    className="max-h-64 max-w-full rounded-md object-contain"
                  />
                )}
                <DropZone.Trigger variant="tertiary">重新上传</DropZone.Trigger>
              </div>
            ) : (
              <>
                <DropZone.Icon />
                <DropZone.Label />
                <DropZone.Description />
                <DropZone.Trigger />
              </>
            )}
          </DropZone.Area>
          <DropZone.Input />
        </DropZone>
      </Card.Content>
      <Card.Footer className="mt-4 flex justify-between gap-2">
        <Button className="w-full" variant="tertiary" onPress={onBack}>
          上一步
        </Button>
        <Button
          className="w-full"
          isDisabled={proofImage == null}
          onPress={() => onNext(proofImage!)}
        >
          下一步
        </Button>
      </Card.Footer>
    </>
  );
}

export default Proof;
