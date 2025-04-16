// components/ReportForm.tsx
import { useState, useEffect } from "react";

export type FormDataType = {
  purchase_date?: string;
  total_price?: string;
  land_price?: string;
  building_price?: string;
  purchase_expenses?: string;
  building_age?: string;
  structure?: string;
  gross_yield?: string;
  current_yield?: string;
  vacancy_rate?: number;
  rent_decline_rate?: number;
  annual_operating_expenses?: string;
  own_capital?: string;
  loan_amount?: string;
  loan_term_years?: number;
  interest_rate?: string;
  loan_type?: string;
  expected_rate_of_return?: string;
  expected_sale_price?: string;
  sale_expenses?: string;
  owner_type?: string;
  annual_income?: string;
};

interface ReportFormProps {
  initialData?: Partial<FormDataType>;
  onSuccess: (data: any) => void;
}

export function ReportForm({ initialData = {}, onSuccess }: ReportFormProps) {
  const [formData, setFormData] = useState<FormDataType>({
    vacancy_rate: 0.05,
    loan_term_years: 35,
    rent_decline_rate: 0.01,
    ...initialData,
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...initialData }));
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 送信処理：API エンドポイントに POST し、結果（data プロパティ）を onSuccess 経由で親へ通知
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      console.log("送信結果:", result);
      if (result.data) {
        onSuccess(result.data);
      } else {
        console.error(
          "レスポンスに data プロパティが含まれていません。",
          result
        );
      }
    } catch (error) {
      console.error("送信中にエラーが発生しました:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg"
    >
      {[
        {
          label: "購入年月",
          name: "purchase_date",
          type: "date",
          required: true,
        },
        {
          label: "物件価格（総計）",
          name: "total_price",
          type: "number",
          required: true,
        },
        { label: "物件価格（土地）", name: "land_price", type: "number" },
        { label: "物件価格（建物）", name: "building_price", type: "number" },
        { label: "購入諸費用", name: "purchase_expenses", type: "number" },
        { label: "築年数", name: "building_age", type: "number" },
        { label: "建物構造", name: "structure", type: "text" },
        { label: "表面利回り", name: "gross_yield", type: "number" },
        { label: "現況利回り", name: "current_yield", type: "number" },
        {
          label: "空室率",
          name: "vacancy_rate",
          type: "number",
          step: "0.01",
        },
        {
          label: "家賃下落率",
          name: "rent_decline_rate",
          type: "number",
          step: "0.01",
        },
        {
          label: "年間運営費",
          name: "annual_operating_expenses",
          type: "number",
        },
        { label: "自己資金", name: "own_capital", type: "number" },
        { label: "借入額", name: "loan_amount", type: "number" },
        { label: "借入期間", name: "loan_term_years", type: "number" },
        {
          label: "ローン金利",
          name: "interest_rate",
          type: "number",
          step: "0.01",
        },
        { label: "ローンタイプ", name: "loan_type", type: "text" },
        {
          label: "期待利回り",
          name: "expected_rate_of_return",
          type: "number",
        },
        { label: "想定売却価格", name: "expected_sale_price", type: "number" },
        { label: "売却諸費用", name: "sale_expenses", type: "number" },
        { label: "オーナー種別", name: "owner_type", type: "text" },
        { label: "年収", name: "annual_income", type: "number" },
      ].map((field) => (
        <div key={field.name} className="flex flex-col">
          <label
            htmlFor={field.name}
            className="mb-1 font-medium text-gray-700"
          >
            {field.label}
          </label>
          <input
            {...field}
            id={field.name}
            name={field.name}
            value={formData[field.name as keyof FormDataType] ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        送信
      </button>
    </form>
  );
}
