import { useState } from "react";
import { FORM_FIELD_CONFIGS, LARGE_NUMBER_FIELDS } from "@/shared/constants";
import type { FormDataType, RealEstateAnalysisRes } from "@/shared/types";
import { useFormCalculation } from "../hooks/useFormCalculation";
import { useFormData } from "../hooks/useFormData";
import { convertPercentagesToDecimals } from "../utils/formUtils";
import { FormField } from "./FormField";

interface ReportFormProps {
  formValues?: Partial<FormDataType>;
  onSuccess: (data: RealEstateAnalysisRes) => void;
}

export function ReportForm({ formValues = {}, onSuccess }: ReportFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { formData, setFormData, handleChange, handleNumberChange } =
    useFormData({
      formValues,
    });

  useFormCalculation({ formData, formValues, setFormData });

  const _dummyData: FormDataType = {
    purchase_date: "2025-01-01",
    total_price: 100000000,
    land_price: 40000000,
    building_price: 60000000,
    purchase_expenses: 8000000,
    building_age: 10,
    structure: "重量鉄骨造(S)",
    gross_yield: 0.08,
    current_yield: 0.08,
    vacancy_rate: 0.05,
    rent_decline_rate: 0.01,
    annual_operating_expenses: 560000,
    own_capital: 18000000,
    loan_amount: 90000000,
    loan_term_years: 35,
    interest_rate: 0.025,
    loan_type: "元利均等",
    expected_rate_of_return: 0.05,
    expected_sale_year: "2055-01-01",
    expected_sale_price: 60000000,
    sale_expenses: 2400000,
    owner_type: "個人",
    annual_income: 10000000,
  };

  const _applyTestData = () => {
    setFormData({ ..._dummyData });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const convertedFormData = convertPercentagesToDecimals(formData);

      const res = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(convertedFormData),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || `APIエラー: ${res.status}`);
        return;
      }

      if (result.data) {
        onSuccess(result.data as RealEstateAnalysisRes);
        setError(null);
      } else {
        setError("レスポンスに data プロパティが含まれていません。");
        console.error(
          "レスポンスに data プロパティが含まれていません。",
          result,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラーが発生しました";
      setError(`送信中にエラーが発生しました: ${errorMessage}`);
      console.error("送信中にエラーが発生しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg"
    >
      {FORM_FIELD_CONFIGS.map((field) => (
        <FormField
          key={field.name}
          field={field}
          value={formData[field.name as keyof FormDataType]}
          onChange={handleChange}
          onNumberChange={handleNumberChange}
          isLargeNumber={LARGE_NUMBER_FIELDS.includes(field.name)}
        />
      ))}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 font-medium">エラー</div>
          </div>
          <div className="text-red-700 text-sm mt-1">{error}</div>
        </div>
      )}

      {process.env.NODE_ENV === "development" && (
        <button
          type="button"
          onClick={_applyTestData}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          disabled={isLoading}
        >
          テストデータを入力
        </button>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:bg-blue-300 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "処理中..." : "送信"}
      </button>
    </form>
  );
}
