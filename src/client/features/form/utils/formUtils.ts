import { NUMERIC_FIELDS, PERCENTAGE_FIELDS } from "@/shared/constants";
import type { FormDataType } from "@/shared/types";

export function formatNumberDisplay(value: number | undefined): string {
  if (value === undefined || value === null) return "";
  return value.toLocaleString();
}

export function convertFormValuesToNumbers(
  formValues: Partial<FormDataType>,
): Partial<FormDataType> {
  const convertedFormValues = { ...formValues };

  NUMERIC_FIELDS.forEach((field) => {
    const value = convertedFormValues[field as keyof FormDataType];
    if (value !== undefined && value !== null && value !== "") {
      (convertedFormValues as Record<string, unknown>)[field] = Number(value);
    }
  });

  return convertedFormValues;
}

export function convertPercentagesToDecimals(
  formData: FormDataType,
): FormDataType {
  const convertedFormData = { ...formData };

  PERCENTAGE_FIELDS.forEach((field) => {
    const value = convertedFormData[field as keyof FormDataType] as number;
    if (value !== undefined && value !== null) {
      (convertedFormData[field as keyof FormDataType] as number) = value / 100;
    }
  });

  return convertedFormData;
}

export function parseNumericInput(value: string): number | undefined {
  const cleanValue = value.replace(/[^\d]/g, "");
  return cleanValue === "" ? undefined : Number(cleanValue);
}
