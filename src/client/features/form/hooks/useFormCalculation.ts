import { useEffect, useState } from "react";
import type { FormDataType } from "@/shared/types";

interface UseFormCalculationProps {
  formData: FormDataType;
  formValues: Partial<FormDataType>;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
}

export function useFormCalculation({
  formData,
  formValues,
  setFormData,
}: UseFormCalculationProps) {
  const [lastChanged, setLastChanged] = useState<string>("");
  const [focusedField, setFocusedField] = useState<string>("");

  useEffect(() => {
    if (focusedField) return;
    const updatedValues: Partial<FormDataType> = {};
    if (formData.total_price) {
      const totalPrice = formData.total_price;

      // 総計、土地、建物価格のバリデーションと自動調整
      const landPrice = formData.land_price || 0;
      const buildingPrice = formData.building_price || 0;

      if (lastChanged === "building_price" || lastChanged === "land_price") {
        // 建物または土地が変更された場合、総計を更新
        const newTotal = buildingPrice + landPrice;
        if (newTotal !== totalPrice) {
          updatedValues.total_price = newTotal;
        }
      } else if (lastChanged === "total_price") {
        // 総計が変更された場合の処理
        if (formData.building_price) {
          updatedValues.land_price = totalPrice - buildingPrice;
        } else if (formData.land_price) {
          updatedValues.building_price = totalPrice - landPrice;
        } else if (!formData.building_price && !formData.land_price) {
          // 総計のみが入力されている場合、50%ずつに分割
          updatedValues.building_price = totalPrice * 0.5;
          updatedValues.land_price = totalPrice * 0.5;
        }
      } else {
        // 従来のロジック（初期設定時など）
        if (formData.land_price && formData.building_price) {
          const sum = landPrice + buildingPrice;
          if (sum !== totalPrice) {
            updatedValues.land_price = totalPrice - buildingPrice;
          }
        } else if (formData.building_price) {
          updatedValues.land_price = totalPrice - buildingPrice;
        } else if (formData.land_price) {
          updatedValues.building_price = totalPrice - landPrice;
        } else if (!formData.building_price && !formData.land_price) {
          updatedValues.building_price = totalPrice * 0.5;
          updatedValues.land_price = totalPrice * 0.5;
        }
      }

      // 購入諸費用 (物件価格の8%)
      if (!formValues.purchase_expenses) {
        updatedValues.purchase_expenses = totalPrice * 0.08;
      }

      // 自己資金 (物件価格の10% + 購入諸費用)
      if (!formValues.own_capital) {
        const purchaseExpenses =
          updatedValues.purchase_expenses || formData.purchase_expenses || 0;
        updatedValues.own_capital = totalPrice * 0.1 + purchaseExpenses;
      }

      // 借入金額 (物件価格の90%)
      if (!formValues.loan_amount) {
        updatedValues.loan_amount = totalPrice * 0.9;
      }

      // 想定売却価格 (物件価格と同額)
      if (!formValues.expected_sale_price) {
        updatedValues.expected_sale_price = totalPrice;
      }

      // 年間運営経費の自動計算 (満室時賃料収入の7%)
      if (formData.gross_yield && !formValues.annual_operating_expenses) {
        const grossYield = formData.gross_yield / 100;
        const fullOccupancyRentalIncome = totalPrice * grossYield;
        updatedValues.annual_operating_expenses = Math.round(
          fullOccupancyRentalIncome * 0.07,
        );
      }
    }

    // 想定売却価格がある場合
    if (formData.expected_sale_price) {
      if (!formValues.sale_expenses) {
        const expectedSalePrice = formData.expected_sale_price;
        updatedValues.sale_expenses = expectedSalePrice * 0.04;
      }
    }

    if (Object.keys(updatedValues).length > 0) {
      setFormData((prev) => ({ ...prev, ...updatedValues }));
    }
  }, [
    formData.total_price,
    formData.land_price,
    formData.building_price,
    formData.expected_sale_price,
    formData.purchase_expenses,
    formData.gross_yield,
    formValues,
    setFormData,
    lastChanged,
    focusedField,
  ]);

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleFieldBlur = () => {
    setFocusedField("");
  };

  const handleFieldChange = (fieldName: string) => {
    setLastChanged(fieldName);
  };

  return {
    handleFieldFocus,
    handleFieldBlur,
    handleFieldChange,
  };
}
