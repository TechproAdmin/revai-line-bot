// @/components/types.ts
export type PdfExtractionResult = {
    total_price: string | null;
    land_price: string | null;
    building_price: string | null;
    building_age: string | null;
    structure: string | null;
    gross_yield: string | null;
    current_yield: string | null;
}


export type RealEstateAnalysisReq = {
    purchase_date: string;  // YYYY-MM-DD
    total_price: number;
    land_price: number;
    building_price: number;
    purchase_expenses: number;
    building_age: number;
    structure: string;
    gross_yield: number;
    current_yield: number;
    vacancy_rate: number;
    rent_decline_rate: number;
    annual_operating_expenses: number;
    own_capital: number;
    loan_amount: number;
    loan_term_years: number;
    interest_rate: number;
    loan_type: string;
    expected_rate_of_return: number;
    expected_sale_year: string;  // YYYY-MM-DD
    expected_sale_price: number;
    sale_expenses: number;
    owner_type: string;  // "個人" | "法人"
    annual_income: number;
}

export type RealEstateAnalysisRes = {
    annual_rent_income: number[];  // 年ごとの年間賃料収入
    net_operating_income: number[];  // 年ごとの純収益(NOI)
    annual_loan_repayment: number[];  // 年ごとの年間ローン返済額
    annual_principal_payment: number[];  // 年ごとの年間ローン元金返済額
    annual_interest_payment: number[];  // 年ごとの年間ローン利息返済額
    loan_balance: number[];  // 年ごとのローン残高
    befor_tax_cash_flow: number[];  // 年ごとの年間キャッシュフロー(BTCF)
    cumulative_cash_flow: number[];  // 年ごとの累計キャッシュフロー
    depreciation_expense: number[];  // 年ごとの減価償却費
    tax_amount: number[];  // 年ごとの税金
    after_tax_cash_flow: number[];  // 年ごとの税引後キャッシュフロー
    net_present_value: number[];  // 年ごとの正味現在価値(NPV)
    noi_yield: number;  // NOI利回り
    free_clearly_return: number;  // 総収益率(FCR)
    cash_on_cash_return: number;  // 自己資金配当率(CCR)
    internal_rate_of_return: number;  // 全期間利回り(IRR)
    payback_period: number;  // 自己資金回収期間(PB)
    sale_gross_yield: number;  // 売却時の表面利回り
    return_on_investment: number;  // 投資収益率
    debt_service_coverage_ratio: number;  // 返済余裕率
    loan_to_value: number;  // 融資比率
    dead_cross_year: number;  // デッドクロス発生時期
    total_pl: number;  // 全期間収支
}