// components/ReportForm.tsx
import { useState, useEffect } from "react";
import { RealEstateAnalysisRes } from "@/components/types";

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
  expected_sale_year?: string;
  expected_sale_price?: string;
  sale_expenses?: string;
  owner_type?: string;
  annual_income?: string;
};


interface ReportFormProps {
  formValues?: Partial<FormDataType>;
  onSuccess: (data: RealEstateAnalysisRes) => void;
}

export function ReportForm({ formValues = {}, onSuccess }: ReportFormProps) {
  const _dummyData: FormDataType = {
    purchase_date: "2025-01-01",
    total_price: "100000000",
    land_price: "40000000",
    building_price: "60000000",
    purchase_expenses: "8000000",
    building_age: "10",
    structure: "重量鉄骨造(S)",
    gross_yield: "0.08",
    current_yield: "0.08",
    vacancy_rate: 0.05,
    rent_decline_rate: 0.01,
    annual_operating_expenses: "560000",
    own_capital: "18000000",
    loan_amount: "90000000",
    loan_term_years: 35,
    interest_rate: "0.025",
    loan_type: "元利均等",
    expected_rate_of_return: "0.03",
    expected_sale_year: "2055-01-01",
    expected_sale_price: "60000000",
    sale_expenses: "2400000",
    owner_type: "個人",
    annual_income: "10000000"
  };

  const _applyTestData = () => {
    // テストデータを適用します
    setFormData({ ..._dummyData });
  };

  const [formData, setFormData] = useState<FormDataType>({
    vacancy_rate: 0.05,
    loan_term_years: 35,
    rent_decline_rate: 0.01,
    owner_type: "個人",
    ...formValues,
  });

  // 依存する値が変更されたときに初期値を計算する
  useEffect(() => {
    const updatedValues: Partial<FormDataType> = {};

    // 物件価格が入力されている場合の依存計算
    if (formData.total_price) {
      const totalPrice = parseFloat(formData.total_price);

      // 購入諸費用 (物件価格の8%)
      if (!formValues.purchase_expenses) {
        updatedValues.purchase_expenses = (totalPrice * 0.08).toString();
      }

      // 自己資金 (物件価格の10% + 購入諸費用)
      if (!formValues.own_capital) {
        const purchaseExpenses = parseFloat(updatedValues.purchase_expenses || formData.purchase_expenses || '0');
        updatedValues.own_capital = (totalPrice * 0.1 + purchaseExpenses).toString();
      }

      // 借入金額 (物件価格の90%)
      if (!formValues.loan_amount) {
        updatedValues.loan_amount = (totalPrice * 0.9).toString();
      }
    }

    // 想定売却価格がある場合
    if (formData.expected_sale_price) {
      // 売却諸費用 (想定売却価格の4%)
      if (!formValues.sale_expenses) {
        const expectedSalePrice = parseFloat(formData.expected_sale_price);
        updatedValues.sale_expenses = (expectedSalePrice * 0.04).toString();
      }
    }

    // 更新する値がある場合のみ state を更新
    if (Object.keys(updatedValues).length > 0) {
      setFormData(prev => ({ ...prev, ...updatedValues }));
    }
  }, [formData.total_price, formData.expected_sale_price, formValues]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...formValues }));
  }, [formValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      if (result.data) {
        onSuccess(result.data as RealEstateAnalysisRes);
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

  // フォームフィールドを描画する関数
  const renderFormField = (field: {
    label: string;
    name: string;
    type: string;
    required?: boolean;
    step?: string;
    options?: string[];
  }) => {
    // owner_type フィールドの場合はセレクト要素を表示
    if (field.name === "owner_type") {
      return (
        <div key={field.name} className="flex flex-col">
          <label
            htmlFor={field.name}
            className="mb-1 font-medium text-gray-700"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            id={field.name}
            name={field.name}
            value={formData[field.name as keyof FormDataType] ?? ""}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          >
            <option value="個人">個人</option>
            <option value="法人">法人</option>
          </select>
        </div>
      );
    }

    // その他のフィールドは通常の入力要素を表示
    return (
      <div key={field.name} className="flex flex-col">
        <label htmlFor={field.name} className="mb-1 font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={field.type}
          id={field.name}
          name={field.name}
          value={formData[field.name as keyof FormDataType] ?? ""}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={field.required}
          step={field.step}
        />
      </div>
    );
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
        {
          label: "物件価格（土地）",
          name: "land_price",
          type: "number",
          required: true
        },
        {
          label: "物件価格（建物）",
          name: "building_price",
          type: "number",
          required: true
        },
        {
          label: "購入諸費用",
          name: "purchase_expenses",
          type: "number"
        },
        {
          label: "築年数",
          name: "building_age",
          type: "number",
          required: true
        },
        {
          label: "建物構造",
          name: "structure",
          type: "text",
          required: true
        },
        {
          label: "表面利回り",
          name: "gross_yield",
          type: "number",
          required: true
        },
        {
          label: "現況利回り",
          name: "current_yield",
          type: "number",
          required: true
        },
        {
          label: "空室率",
          name: "vacancy_rate",
          type: "number",
          step: "0.01",
        },
        {
          label: "家賃下落率/年",
          name: "rent_decline_rate",
          type: "number",
          step: "0.01",
        },
        {
          label: "年間運営経費",
          name: "annual_operating_expenses",
          type: "number",
        },
        {
          label: "自己資金",
          name: "own_capital",
          type: "number"
        },
        {
          label: "借入金額",
          name: "loan_amount",
          type: "number"
        },
        {
          label: "借入期間",
          name: "loan_term_years",
          type: "number",
        },
        {
          label: "ローン金利",
          name: "interest_rate",
          type: "number",
          step: "0.01",
          required: true,
        },
        {
          label: "ローンタイプ",
          name: "loan_type",
          type: "text",
          required: true,
        },
        {
          label: "期待利回り",
          name: "expected_rate_of_return",
          type: "number",
          required: true,
        },
        {
          label: "売却想定時期",
          name: "expected_sale_year",
          type: "date",
          required: true,
        },
        {
          label: "売却想定価格",
          name: "expected_sale_price",
          type: "number",
          required: true,
        },
        {
          label: "売却諸費用",
          name: "sale_expenses",
          type: "number"
        },
        {
          label: "個人／法人",
          name: "owner_type",
          type: "select",
          required: true,
        },
        {
          label: "年収",
          name: "annual_income",
          type: "number",
          required: true,
        },
      ].map(renderFormField)}


      {process.env.NODE_ENV === 'development' && (
        <button
          type="button"
          onClick={_applyTestData}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          テストデータを入力
        </button>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        送信
      </button>

    </form>
  );
}