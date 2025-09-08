import type { FormFieldConfig } from "@/shared/constants";
import { DateInput } from "./DateInput";
import { NumberInput } from "./NumberInput";
import { SelectInput } from "./SelectInput";
import { TextInput } from "./TextInput";

interface FormFieldProps {
  field: FormFieldConfig;
  value: string | number | undefined;
  onChange: (name: string, value: string | number | undefined) => void;
  onNumberChange: (name: string, value: number | undefined) => void;
  onFieldFocus: (fieldName: string) => void;
  onFieldBlur: () => void;
  onFieldChange: (fieldName: string) => void;
  isLargeNumber: boolean;
}

export function FormField({
  field,
  value,
  onChange,
  onNumberChange,
  onFieldFocus,
  onFieldBlur,
  onFieldChange,
  isLargeNumber,
}: FormFieldProps) {
  if (field.type === "select") {
    return (
      <SelectInput field={field} value={value as string} onChange={onChange} />
    );
  }

  if (field.type === "date") {
    return (
      <DateInput
        field={field}
        value={value}
        onChange={onChange}
        onFieldFocus={onFieldFocus}
        onFieldBlur={onFieldBlur}
        onFieldChange={onFieldChange}
      />
    );
  }

  if (field.type === "number" && isLargeNumber) {
    return (
      <NumberInput
        field={field}
        value={value as number}
        onChange={onNumberChange}
        onFieldFocus={onFieldFocus}
        onFieldBlur={onFieldBlur}
        onFieldChange={onFieldChange}
      />
    );
  }

  return (
    <TextInput
      field={field}
      value={value}
      onChange={onChange}
      onNumberChange={onNumberChange}
      onFieldFocus={onFieldFocus}
      onFieldBlur={onFieldBlur}
      onFieldChange={onFieldChange}
    />
  );
}
