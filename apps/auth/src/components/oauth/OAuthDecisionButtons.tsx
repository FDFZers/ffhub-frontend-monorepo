import { Button } from "@heroui/react";

export type OAuthDecisionAction = "approve" | "deny" | null;

interface OAuthDecisionButtonsProps {
  action: OAuthDecisionAction;
  onApprove: () => void;
  onDeny: () => void;
}

/** 普通授权与设备授权共用的拒绝/授权按钮。 */
export default function OAuthDecisionButtons({
  action,
  onApprove,
  onDeny,
}: OAuthDecisionButtonsProps) {
  return (
    <>
      <Button
        className="w-full"
        isDisabled={action !== null}
        isPending={action === "deny"}
        variant="tertiary"
        onPress={onDeny}
      >
        拒绝
      </Button>
      <Button
        className="w-full"
        isDisabled={action !== null}
        isPending={action === "approve"}
        onPress={onApprove}
      >
        授权
      </Button>
    </>
  );
}
