import type { RealEstateAnalysisRes } from "@/shared/types";
import { formatAmount, formatPercent, formatYears } from "../utils/formatters";

interface AnalysisResultsTableProps {
  data: RealEstateAnalysisRes;
}

export function AnalysisResultsTable({ data }: AnalysisResultsTableProps) {
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          backgroundColor: "#333",
          color: "white",
          padding: "8px",
          fontWeight: "bold",
          marginBottom: "2px",
        }}
      >
        ■ 分析結果
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "11px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              純収益（NOI）
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {formatAmount(data.net_operating_income[1])}万円
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              経費差引後の年間収益
            </td>
          </tr>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              実質利回り（NOI利回り）
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {formatPercent(data.noi_yield)}
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              純収益÷購入価格
            </td>
          </tr>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              総収益率（FCR）
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {formatPercent(data.free_clearly_return)}
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              総収益÷物件価格
            </td>
          </tr>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              自己資金配当率（CCR）
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {formatPercent(data.cash_on_cash_return)}
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              純収益÷自己資金
            </td>
          </tr>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              全期間利回り（内部収益率、IRR）
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {formatPercent(data.internal_rate_of_return)}
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              投資全体の年平均利回り
            </td>
          </tr>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              自己資金回収期間（PB）
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {formatYears(data.payback_period)}
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              自己資金が回収される年数
            </td>
          </tr>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              売却時表面利回り
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {formatPercent(data.sale_gross_yield)}
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              売却価格に対する賃料割合
            </td>
          </tr>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              投資収益率（ROI）
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {formatPercent(data.return_on_investment)}
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              利益÷投資額
            </td>
          </tr>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              返済余裕率（DSCR）
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {data.debt_service_coverage_ratio.toFixed(2)}倍
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              NOI÷年間返済額
            </td>
          </tr>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              融資比率（LTV）
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {formatPercent(data.loan_to_value)}
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              融資額÷物件価格
            </td>
          </tr>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              デッドクロスの発生時期
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {data.dead_cross_year > 0
                ? `${data.dead_cross_year}年目`
                : "発生しない"}
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              損益が赤字転落する時期
            </td>
          </tr>
          <tr>
            <td
              style={{
                backgroundColor: "#e8f4fd",
                padding: "6px",
                border: "1px solid #ccc",
              }}
            >
              全期間収支
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                textAlign: "right",
              }}
            >
              {formatAmount(data.total_pl)}万円
            </td>
            <td
              style={{
                padding: "6px",
                border: "1px solid #ccc",
                fontSize: "10px",
                color: "#666",
              }}
            >
              投資期間中の合計利益
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
