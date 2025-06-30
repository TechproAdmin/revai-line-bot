import { useEffect } from "react";
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
  useEffect(() => {
    const updatedValues: Partial<FormDataType> = {};

    if (formData.total_price) {
      const totalPrice = formData.total_price;

      // 土地価格と建物価格の自動設定
      if (
        !formValues.land_price &&
        !formValues.building_price &&
        !formData.land_price &&
        !formData.building_price
      ) {
        updatedValues.land_price = totalPrice * 0.5;
        updatedValues.building_price = totalPrice * 0.5;
      } else if (formData.land_price && formData.building_price) {
        const landPriceValue = updatedValues.land_price || formData.land_price;
        const buildingPriceValue =
          updatedValues.building_price || formData.building_price;
        const totalFromParts =
          Number(landPriceValue) + Number(buildingPriceValue);

        if (
          totalFromParts !== totalPrice &&
          formValues.land_price &&
          formValues.building_price
        ) {
          updatedValues.total_price = totalFromParts;
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
  ]);
}
