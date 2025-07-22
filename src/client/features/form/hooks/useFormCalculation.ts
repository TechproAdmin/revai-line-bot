import { useEffect } from "react";
import type { FormDataType } from "@/shared/types";

interface UseFormCalculationProps {
  formData: FormDataType;
  formValues: Partial<FormDataType>;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  lastChangedField: string | null;
}

export function useFormCalculation({
  formData,
  formValues,
  setFormData,
  lastChangedField,
}: UseFormCalculationProps) {
  useEffect(() => {
    const updatedValues: Partial<FormDataType> = {};
    if (formData.total_price) {
      const totalPrice = formData.total_price;

      // 土地価格と建物価格の自動設定
      if (formData.land_price && formData.building_price) {
        // 両方に値がある場合は最後に変更されたフィールドで判定
        if (lastChangedField === "land_price") {
          updatedValues.building_price = totalPrice - formData.land_price;
        } else if (lastChangedField === "building_price") {
          updatedValues.land_price = totalPrice - formData.building_price;
        }
      } else if (formData.land_price && !formData.building_price) {
        // 総計と土地価格から建物価格を計算
        updatedValues.building_price = totalPrice - formData.land_price;
      } else if (formData.building_price && !formData.land_price) {
        // 総計と建物価格から土地価格を計算
        updatedValues.land_price = totalPrice - formData.building_price;
      } else if (
        !formValues.land_price &&
        !formValues.building_price &&
        !formData.land_price &&
        !formData.building_price
      ) {
        updatedValues.land_price = totalPrice * 0.5;
        updatedValues.building_price = totalPrice * 0.5;
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
    lastChangedField,
  ]);
}
