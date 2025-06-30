// components/ReportForm.tsx
import { useEffect, useState } from "react";
import type { RealEstateAnalysisRes } from "@/components/types";

export type FormDataType = {
  purchase_date?: string;
  total_price?: number;
  land_price?: number;
  building_price?: number;
  purchase_expenses?: number;
  building_age?: number;
  structure?: string;
  gross_yield?: number;
  current_yield?: number;
  full_occupancy_rental_income?: number;
  vacancy_rate?: number;
  rent_decline_rate?: number;
  annual_operating_expenses?: number;
  own_capital?: number;
  loan_amount?: number;
  loan_term_years?: number;
  interest_rate?: number;
  loan_type?: string;
  expected_rate_of_return?: number;
  expected_sale_year?: string;
  expected_sale_price?: number;
  sale_expenses?: number;
  owner_type?: string;
  annual_income?: number;
};

interface ReportFormProps {
  formValues?: Partial<FormDataType>;
  onSuccess: (data: RealEstateAnalysisRes) => void;
}

export function ReportForm({ formValues = {}, onSuccess }: ReportFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    expected_rate_of_return: 0.03,
    expected_sale_year: "2055-01-01",
    expected_sale_price: 60000000,
    sale_expenses: 2400000,
    owner_type: "個人",
    annual_income: 10000000,
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
    loan_type: "元利均等",
    ...formValues,
  });

  // 依存する値が変更されたときに初期値を計算する
  useEffect(() => {
    const updatedValues: Partial<FormDataType> = {};

    // 物件価格が入力されている場合の依存計算
    if (formData.total_price) {
      const totalPrice = formData.total_price;

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
      // 満室時賃料収入 = 物件価格総計 × 表面利回り
      if (formData.gross_yield && !formValues.annual_operating_expenses) {
        const grossYield = formData.gross_yield / 100; // パーセントを小数に変換
        const fullOccupancyRentalIncome = totalPrice * grossYield;
        updatedValues.annual_operating_expenses = Math.round(
          fullOccupancyRentalIncome * 0.07,
        );
      }
    }

    // 想定売却価格がある場合
    if (formData.expected_sale_price) {
      // 売却諸費用 (想定売却価格の4%)
      if (!formValues.sale_expenses) {
        const expectedSalePrice = formData.expected_sale_price;
        updatedValues.sale_expenses = expectedSalePrice * 0.04;
      }
    }

    // 更新する値がある場合のみ state を更新
    if (Object.keys(updatedValues).length > 0) {
      setFormData((prev) => ({ ...prev, ...updatedValues }));
    }
  }, [
    formData.total_price,
    formData.expected_sale_price,
    formData.purchase_expenses,
    formData.gross_yield,
    formValues,
  ]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...formValues }));
  }, [formValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value === "" ? undefined : Number(value);
    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  // 三桁区切り表示用の関数
  const formatNumberDisplay = (value: number | undefined): string => {
    if (value === undefined || value === null) return "";
    return value.toLocaleString();
  };

  // 大きな金額フィールド（三桁区切り表示が必要）
  const largeNumberFields = [
    "total_price",
    "land_price",
    "building_price",
    "purchase_expenses",
    "annual_operating_expenses",
    "own_capital",
    "loan_amount",
    "expected_sale_price",
    "sale_expenses",
    "annual_income",
  ];

  // 送信処理：API エンドポイントに POST し、結果（data プロパティ）を onSuccess 経由で親へ通知
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // %項目を小数点形式に変換してから送信
      const percentageFields = [
        "gross_yield",
        "current_yield",
        "vacancy_rate",
        "rent_decline_rate",
        "interest_rate",
        "expected_rate_of_return",
      ];

      const convertedFormData = { ...formData };
      percentageFields.forEach((field) => {
        const value = convertedFormData[field as keyof FormDataType] as number;
        if (value !== undefined && value !== null) {
          (convertedFormData[field as keyof FormDataType] as number) =
            value / 100;
        }
      });

      const res = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(convertedFormData),
      });

      const result = await res.json();

      if (!res.ok) {
        // APIエラーの場合
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

  // フォームフィールドを描画する関数
  const renderFormField = (field: {
    label: string;
    name: string;
    type: string;
    required?: boolean;
    step?: string;
    options?: string[];
    formula?: string;
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

    // structure フィールドの場合はセレクト要素を表示
    if (field.name === "structure") {
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
            <option value="">選択してください</option>
            <option value="木造(W)">木造(W)</option>
            <option value="軽量鉄骨造">軽量鉄骨造</option>
            <option value="重量鉄骨造(S)">重量鉄骨造(S)</option>
            <option value="ブロック造(B)">ブロック造(B)</option>
            <option value="鉄筋コンクリート造(RC)">
              鉄筋コンクリート造(RC)
            </option>
            <option value="鉄骨鉄筋コンクリート造(SRC)">
              鉄骨鉄筋コンクリート造(SRC)
            </option>
            <option value="アルミ造(AL)">アルミ造(AL)</option>
            <option value="コンクリート充填鋼管構造(CFT)">
              コンクリート充填鋼管構造(CFT)
            </option>
            <option value="コンクリートブロック造(CB)">
              コンクリートブロック造(CB)
            </option>
            <option value="プレキャストコンクリート構造(PC)">
              プレキャストコンクリート構造(PC)
            </option>
            <option value="鉄骨プレキャストコンクリート造(HPC)">
              鉄骨プレキャストコンクリート造(HPC)
            </option>
          </select>
        </div>
      );
    }

    // loan_type フィールドの場合はセレクト要素を表示
    if (field.name === "loan_type") {
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
            <option value="元利均等">元利均等</option>
            <option value="元金均等">元金均等</option>
          </select>
        </div>
      );
    }

    // 数値フィールドで三桁区切り表示が必要な場合
    if (field.type === "number" && largeNumberFields.includes(field.name)) {
      return (
        <div key={field.name} className="flex flex-col">
          <label
            htmlFor={field.name}
            className="mb-1 font-medium text-gray-700"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              id={field.name}
              name={field.name}
              value={formatNumberDisplay(
                formData[field.name as keyof FormDataType] as number,
              )}
              onChange={(e) => {
                const cleanValue = e.target.value.replace(/[^\d]/g, "");
                const numericValue =
                  cleanValue === "" ? undefined : Number(cleanValue);
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: numericValue,
                }));
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={field.required}
              placeholder="0"
            />
          </div>
          {field.formula && (
            <div className="text-xs text-gray-500 mt-1">
              初期値: {field.formula}
            </div>
          )}
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
          onChange={field.type === "number" ? handleNumberChange : handleChange}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={field.required}
          step={field.step}
        />
        {field.formula && (
          <div className="text-xs text-gray-500 mt-1">
            初期値: {field.formula}
          </div>
        )}
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
          label: "物件価格 総計（円）",
          name: "total_price",
          type: "number",
          required: true,
        },
        {
          label: "物件価格 土地（円）",
          name: "land_price",
          type: "number",
          required: true,
        },
        {
          label: "物件価格 建物（円）",
          name: "building_price",
          type: "number",
          required: true,
        },
        {
          label: "購入諸費用（円）",
          name: "purchase_expenses",
          type: "number",
          formula: "物件価格 × 8%",
        },
        {
          label: "築年数（年）",
          name: "building_age",
          type: "number",
          required: true,
        },
        {
          label: "建物構造",
          name: "structure",
          type: "select",
          required: true,
        },
        {
          label: "表面利回り（％）",
          name: "gross_yield",
          type: "number",
          required: true,
        },
        {
          label: "現況利回り（％）",
          name: "current_yield",
          type: "number",
          required: true,
        },
        {
          label: "空室率（％）",
          name: "vacancy_rate",
          type: "number",
          step: "0.01",
        },
        {
          label: "家賃下落率/年（％）",
          name: "rent_decline_rate",
          type: "number",
          step: "0.01",
        },
        {
          label: "年間運営経費（円）",
          name: "annual_operating_expenses",
          type: "number",
          formula: "満室時賃料収入 × 7%",
        },
        {
          label: "自己資金（円）",
          name: "own_capital",
          type: "number",
          formula: "物件価格 × 10% + 購入諸費用",
        },
        {
          label: "借入金額（円）",
          name: "loan_amount",
          type: "number",
          formula: "物件価格 × 90%",
        },
        {
          label: "借入期間（年）",
          name: "loan_term_years",
          type: "number",
        },
        {
          label: "ローン金利（％）",
          name: "interest_rate",
          type: "number",
          step: "0.01",
          required: true,
        },
        {
          label: "ローンタイプ",
          name: "loan_type",
          type: "select",
          required: true,
        },
        {
          label: "期待利回り（％）",
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
          label: "売却想定価格（円）",
          name: "expected_sale_price",
          type: "number",
          required: true,
        },
        {
          label: "売却諸費用（円）",
          name: "sale_expenses",
          type: "number",
          formula: "想定売却価格 × 4%",
        },
        {
          label: "個人／法人",
          name: "owner_type",
          type: "select",
          required: true,
        },
        {
          label: "年収（円）",
          name: "annual_income",
          type: "number",
          required: true,
        },
      ].map(renderFormField)}

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
