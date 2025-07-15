import { useEffect, useState } from "react";
import type { FormDataType } from "@/shared/types";
import { convertFormValuesToNumbers } from "../utils/formUtils";

interface UseFormDataProps {
  formValues: Partial<FormDataType>;
}

export function useFormData({ formValues }: UseFormDataProps) {
  const [formData, setFormData] = useState<FormDataType>({
    vacancy_rate: 0.05,
    loan_term_years: 35,
    rent_decline_rate: 0.01,
    owner_type: "個人",
    loan_type: "元利均等",
    expected_rate_of_return: 0.05,
    expected_sale_year: new Date(new Date().getFullYear() + 30, 0, 1)
      .toISOString()
      .split("T")[0],
    ...formValues,
  });

  useEffect(() => {
    const convertedFormValues = convertFormValuesToNumbers(formValues);
    setFormData((prev) => ({ ...prev, ...convertedFormValues }));
  }, [formValues]);

  const handleChange = (name: string, value: string | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (name: string, value: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleNumberChange,
  };
}
