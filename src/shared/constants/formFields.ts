export interface FormFieldConfig {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  step?: string;
  options?: string[];
  formula?: string;
  description?: string;
}

export const FORM_FIELD_CONFIGS: FormFieldConfig[] = [
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
    options: [
      "",
      "木造(W)",
      "軽量鉄骨造",
      "重量鉄骨造(S)",
      "ブロック造(B)",
      "鉄筋コンクリート造(RC)",
      "鉄骨鉄筋コンクリート造(SRC)",
      "アルミ造(AL)",
      "コンクリート充填鋼管構造(CFT)",
      "コンクリートブロック造(CB)",
      "プレキャストコンクリート構造(PC)",
      "鉄骨プレキャストコンクリート造(HPC)",
    ],
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
    options: ["元利均等", "元金均等"],
  },
  {
    label: "期待収益率（％）",
    name: "expected_rate_of_return",
    type: "number",
    required: true,
    description: "今回の不動産投資においてトータルでどれほどの収益率を期待されているかご入力ください。",
  },
  {
    label: "売却想定時期",
    name: "expected_sale_year",
    type: "date",
    required: true,
    description: "将来に渡るトータル収益を計算するため、想定の売却時期をご入力ください。",
  },
  {
    label: "売却想定価格（円）",
    name: "expected_sale_price",
    type: "number",
    required: true,
    description: "将来に渡るトータル収益を計算するため、想定の売却金額をご入力ください。",
  },
  {
    label: "売却諸費用（円）",
    name: "sale_expenses",
    type: "number",
    formula: "想定売却価格 × 4%",
  },
  {
    label: "お客様の分類",
    name: "owner_type",
    type: "select",
    required: true,
    options: ["個人", "法人"],
  },
  {
    label: "お客様の概算年収（円）",
    name: "annual_income",
    type: "number",
    required: true,
  },
];

export const LARGE_NUMBER_FIELDS = [
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

export const NUMERIC_FIELDS = [
  "total_price",
  "land_price",
  "building_price",
  "purchase_expenses",
  "building_age",
  "gross_yield",
  "current_yield",
  "vacancy_rate",
  "rent_decline_rate",
  "annual_operating_expenses",
  "own_capital",
  "loan_amount",
  "loan_term_years",
  "interest_rate",
  "expected_rate_of_return",
  "expected_sale_price",
  "sale_expenses",
  "annual_income",
];

export const PERCENTAGE_FIELDS = [
  "gross_yield",
  "current_yield",
  "vacancy_rate",
  "rent_decline_rate",
  "interest_rate",
  "expected_rate_of_return",
];
