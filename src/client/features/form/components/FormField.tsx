import type { FormFieldConfig } from "@/shared/constants";
import { NumberInput } from "./NumberInput";
import { SelectInput } from "./SelectInput";
import { TextInput } from "./TextInput";

interface FormFieldProps {
  field: FormFieldConfig;
  value: string | number | undefined;
  onChange: (name: string, value: string | number | undefined) => void;
  onNumberChange: (name: string, value: number | undefined) => void;
  isLargeNumber: boolean;
}

export function FormField({
  field,
  value,
  onChange,
  onNumberChange,
  isLargeNumber,
}: FormFieldProps) {
  if (field.type === "select") {
    return (
      <SelectInput field={field} value={value as string} onChange={onChange} />
    );
  }

  if (field.type === "number" && isLargeNumber) {
    return (
      <NumberInput
        field={field}
        value={value as number}
        onChange={onNumberChange}
      />
    );
  }

  return (
    <TextInput
      field={field}
      value={value}
      onChange={onChange}
      onNumberChange={onNumberChange}
    />
  );
}
