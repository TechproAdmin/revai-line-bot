import type { RealEstateAnalysisRes } from "@/shared/types";

export interface AnalysisConditionsTableProps {
  data: RealEstateAnalysisRes;
}

export function AnalysisConditionsTable({
  data,
}: AnalysisConditionsTableProps) {
  const { conditions } = data;

  const investmentPeriod =
    new Date(conditions.expected_sale_year).getFullYear() -
    new Date(conditions.purchase_date).getFullYear();

  const conditionRows = [
    { label: "購入金額", value: `¥${conditions.total_price.toLocaleString()}` },
    {
      label: "購入諸費用",
      value: `¥${conditions.purchase_expenses.toLocaleString()}`,
    },
    { label: "建物築年数", value: `${conditions.building_age}年` },
    { label: "建物構造", value: conditions.structure },
    {
      label: "空室率",
      value: `${(conditions.vacancy_rate * 100).toFixed(2)}%`,
    },
    {
      label: "賃料下落率/年",
      value: `${(conditions.rent_decline_rate * 100).toFixed(2)}%`,
    },
    {
      label: "年間運営経費",
      value: `¥${conditions.annual_operating_expenses.toLocaleString()}`,
    },
    { label: "自己資金", value: `¥${conditions.own_capital.toLocaleString()}` },
    { label: "借入金額", value: `¥${conditions.loan_amount.toLocaleString()}` },
    { label: "ローン期間", value: `${conditions.loan_term_years}年` },
    {
      label: "期待収益率",
      value: `${(conditions.expected_rate_of_return * 100).toFixed(2)}%`,
    },
    { label: "投資期間", value: `${investmentPeriod}年` },
  ];

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "12px",
        backgroundColor: "#f8f9fa",
        border: "1px solid #dee2e6",
      }}
    >
      <h3
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "10px",
          color: "#333",
        }}
      >
        ■ 条件
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "11px",
        }}
      >
        <tbody>
          {conditionRows.map((row, index) => (
            <tr key={row.label}>
              <td
                style={{
                  padding: "4px 8px",
                  borderBottom:
                    index < conditionRows.length - 1
                      ? "1px solid #dee2e6"
                      : "none",
                  width: "40%",
                }}
              >
                {row.label}
              </td>
              <td
                style={{
                  padding: "4px 8px",
                  borderBottom:
                    index < conditionRows.length - 1
                      ? "1px solid #dee2e6"
                      : "none",
                  textAlign: "right",
                }}
              >
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
