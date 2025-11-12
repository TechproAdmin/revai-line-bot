import type { RealEstateAnalysisRes } from "@/shared/types";

export function formatAmount(amount: number): string {
  return (amount / 10000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatPercent(percent: number): string {
  return `${(percent * 100).toFixed(2)}%`;
}

export function formatYears(years: number): string {
  return `${years.toFixed(2)}年`;
}

export function createYearlyData(
  data: RealEstateAnalysisRes,
  startYear: number,
  endYear: number,
) {
  return data.annual_rent_income
    .slice(startYear, endYear + 1)
    .map((value, index) => {
      const year = index + startYear;
      return {
        year: `${year}年目`,
        rent: (value / 10000).toFixed(2),
        expense: (data.conditions.annual_operating_expenses / 10000).toFixed(2),
        noi: (data.net_operating_income[year] / 10000).toFixed(2),
        loanPayment:
          year <= 35
            ? (data.annual_loan_repayment[year] / 10000).toFixed(2)
            : "0.00",
        btcf: (data.befor_tax_cash_flow[year] / 10000).toFixed(2),
        atcf: (data.after_tax_cash_flow[year] / 10000).toFixed(2),
      };
    });
}

export function createChartData(data: RealEstateAnalysisRes) {
  // キャッシュフローチャート用データ
  const cashFlowData = data.befor_tax_cash_flow
    .slice(1, 21)
    .map((value, index) => ({
      year: index + 1,
      btcf: value / 10000,
      atcf: data.after_tax_cash_flow[index + 1] / 10000,
      cumulative: data.cumulative_cash_flow[index + 1] / 10000,
    }));

  // デッドクロスチャート用データ
  const deadCrossData = data.annual_principal_payment
    .slice(1, 21)
    .map((value, index) => ({
      year: index + 1,
      principal: value / 10000,
      depreciation: data.depreciation_expense[index + 1] / 10000,
    }));

  // ローン残高チャート用データ
  const loanData = data.loan_balance.slice(1, 21).map((value, index) => ({
    year: index + 1,
    balance: value / 10000,
    principal: data.annual_principal_payment[index + 1] / 10000,
    interest: data.annual_interest_payment[index + 1] / 10000,
  }));

  return {
    cashFlowData,
    deadCrossData,
    loanData,
  };
}
