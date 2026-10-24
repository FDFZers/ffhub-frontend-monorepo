import { Button, Card, Chip, FieldError, InputGroup, Label, TextField } from "@heroui/react";
import { LucideHash, LucideIdCard } from "lucide-react";
import { useState } from "react";

interface Props {
  initial: { realName: string; studentNum: string };
  onNext: (v: { realName: string; studentNum: string }) => void;
  onBack: () => void;
}

function Identity({ initial, onNext, onBack }: Props) {
  const [realName, setRealName] = useState(initial.realName);
  const [studentNum, setStudentNum] = useState(initial.studentNum);

  const isRealNameValid = /^[\u4e00-\u9fff\u00b7]{1,4}$/.test(realName);
  const isStudentNumValid = /^(?:\d{8}|\d{6}0\d{2})$/.test(studentNum);

  const handleSubmit = () => {
    if (isRealNameValid && isStudentNumValid) onNext({ realName, studentNum });
  };

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>身份信息</Card.Title>
        <Card.Description>请填写你的真实姓名与学号</Card.Description>
        <Chip className="absolute top-0 right-0">4 / 6</Chip>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <TextField
          name="student_num"
          type="text"
          isInvalid={studentNum.length > 0 && !isStudentNumValid}
        >
          <Label>学号</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <LucideHash className="text-muted size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="请输入你的学号…"
              value={studentNum}
              onChange={(e) => setStudentNum(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </InputGroup>
          <FieldError>请输入有效的学号</FieldError>
        </TextField>
        <TextField name="real_name" type="text" isInvalid={realName.length > 0 && !isRealNameValid}>
          <Label>真实姓名</Label>
          <InputGroup variant="secondary">
            <InputGroup.Prefix>
              <LucideIdCard className="text-muted size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="请输入你的真实姓名…"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </InputGroup>
          <FieldError>请输入有效的真实姓名</FieldError>
        </TextField>
      </Card.Content>
      <Card.Footer className="mt-4 flex justify-between gap-2">
        <Button className="w-full" variant="tertiary" onPress={onBack}>
          上一步
        </Button>
        <Button
          className="w-full"
          isDisabled={!isRealNameValid || !isStudentNumValid}
          onPress={handleSubmit}
        >
          下一步
        </Button>
      </Card.Footer>
    </>
  );
}

export default Identity;
