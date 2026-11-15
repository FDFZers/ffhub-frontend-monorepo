import type { School, UserType } from "@repo/shared/api/user/types.ts";

import {
  Button,
  Card,
  Chip,
  FieldError,
  InputGroup,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";
import { isValidRealName, isValidStudentNum } from "@repo/shared/utils/validation.ts";
import { LucideHash, LucideIdCard } from "lucide-react";
import { useState } from "react";

const SCHOOL_OPTIONS: { id: School; label: string }[] = [
  { id: "fdfz", label: "复附本部" },
  { id: "ffxh", label: "徐汇分校" },
  { id: "ffqp", label: "青浦分校" },
  { id: "ffpd", label: "浦东分校" },
  { id: "ffja", label: "静安分校" },
];

interface Props {
  type: UserType;
  initial: { school: School; realName: string; studentNum: string };
  onNext: (v: { school: School; realName: string; studentNum: string }) => void;
  onBack: () => void;
}

function Identity({ type, initial, onNext, onBack }: Props) {
  const [school, setSchool] = useState<School>(initial.school);
  const [realName, setRealName] = useState(initial.realName);
  const [studentNum, setStudentNum] = useState(initial.studentNum);

  const isStudent = type === "student";
  const isRealNameValid = isValidRealName(realName);
  const studentNumDigits = school === "ffqp" ? 9 : 8;
  const isStudentNumValid = !isStudent || isValidStudentNum(studentNum, school);
  const canSubmit = isRealNameValid && isStudentNumValid;

  const handleSubmit = () => {
    if (canSubmit) {
      onNext({ school, realName, studentNum: isStudent ? studentNum : "" });
    }
  };

  return (
    <>
      <Card.Header className="relative mb-2">
        <Card.Title>身份信息</Card.Title>
        <Card.Description>请选择学校并填写你的真实姓名与学号</Card.Description>
        <Chip className="absolute top-0 right-0">3 / 5</Chip>
      </Card.Header>
      <Card.Content className="flex w-md max-w-full flex-col gap-4">
        <Select
          variant="secondary"
          fullWidth
          placeholder="请选择学校"
          value={school}
          onChange={(key) => {
            if (key !== null) setSchool(String(key) as School);
          }}
        >
          <Label>学校</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {SCHOOL_OPTIONS.map((option) => (
                <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                  {option.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        {isStudent && (
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
                placeholder={`请输入 ${studentNumDigits} 位学号…`}
                value={studentNum}
                maxLength={9}
                inputMode="numeric"
                onChange={(e) => setStudentNum(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
            </InputGroup>
            <FieldError>请输入有效的学号</FieldError>
          </TextField>
        )}
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
        <Button className="w-full" isDisabled={!canSubmit} onPress={handleSubmit}>
          下一步
        </Button>
      </Card.Footer>
    </>
  );
}

export default Identity;
