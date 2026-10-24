import type { School } from "@repo/commons/api/user/types.ts";

import { Button, Card, Chip, Radio, RadioGroup } from "@heroui/react";
import { useState } from "react";

interface Props {
  initial: School;
  onNext: (school: School) => void;
  onBack: () => void;
}

function School({ initial, onNext, onBack }: Props) {
  const [school, setSchool] = useState<School>(initial);

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>所在学校</Card.Title>
        <Card.Description>请选择你所在的学校</Card.Description>
        <Chip className="absolute top-0 right-0">3 / 6</Chip>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <RadioGroup
          value={school}
          name="school"
          variant="secondary"
          onChange={(v) => setSchool(v as School)}
        >
          <Radio value="fdfz" className="mt-1">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              复附本部
            </Radio.Content>
          </Radio>
          <Radio value="ffxh">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              徐汇分校
            </Radio.Content>
          </Radio>
          <Radio value="ffqp">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              青浦分校
            </Radio.Content>
          </Radio>
          <Radio value="ffpd">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              浦东分校
            </Radio.Content>
          </Radio>
          <Radio value="ffja">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              静安分校
            </Radio.Content>
          </Radio>
        </RadioGroup>
      </Card.Content>
      <Card.Footer className="mt-4 flex justify-between gap-2">
        <Button className="w-full" variant="tertiary" onPress={onBack}>
          上一步
        </Button>
        <Button className="w-full" onPress={() => onNext(school)}>
          下一步
        </Button>
      </Card.Footer>
    </>
  );
}

export default School;
