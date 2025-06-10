import type { RealEstateAnalysisRes } from "@/components/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useRef, useState, useEffect } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// レポートコンポーネント
interface ReportProps {
  data: RealEstateAnalysisRes;
}

export function Report({ data }: ReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  // PDF ダウンロード処理
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    // ローディング状態を表示
    const button = document.getElementById("download-button");
    if (button) {
      button.textContent = "PDFを準備中...";
      button.setAttribute("disabled", "true");
    }

    try {
      // チャートが完全にレンダリングされるのを待つ
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const report = reportRef.current;

      // レポートのクローンを作成してPDF専用のスタイルを適用
      const clonedReport = report.cloneNode(true) as HTMLElement;
      clonedReport.id = "pdf-report-clone";

      // クローンを一時的にドキュメントに追加（レンダリングのため）
      clonedReport.style.position = "absolute";
      clonedReport.style.left = "-9999px";
      clonedReport.style.width = "1123px"; // A4横の幅（297mm ≈ 1123px）

      document.body.appendChild(clonedReport);

      // コンテンツをキャンバスとして取得
      const canvas = await html2canvas(clonedReport, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 1123,
        windowWidth: 1123,
        ignoreElements: (element) => {
          return element.id === "download-button";
        },
        onclone: (clonedDoc) => {
          // すべての要素のスタイルを修正
          const allElements = clonedDoc.querySelectorAll("*");
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              // PDF生成時はhidden属性を削除
              if (el.hasAttribute("hidden")) {
                el.removeAttribute("hidden");
              }

              const computedStyle = window.getComputedStyle(el);

              [
                "color",
                "background-color",
                "border-color",
                "outline-color",
                "text-decoration-color",
              ].forEach((prop) => {
                const value = computedStyle.getPropertyValue(prop);
                if (
                  value &&
                  !value.includes("oklch") &&
                  !value.includes("lab") &&
                  !value.includes("lch")
                ) {
                  el.style.setProperty(prop, value, "important");
                } else if (
                  value &&
                  (value.includes("oklch") ||
                    value.includes("lab") ||
                    value.includes("lch"))
                ) {
                  switch (prop) {
                    case "color":
                      el.style.setProperty(prop, "#000000", "important");
                      break;
                    case "background-color":
                      el.style.setProperty(prop, "transparent", "important");
                      break;
                    case "border-color":
                      el.style.setProperty(prop, "#e5e7eb", "important");
                      break;
                    default:
                      el.style.setProperty(prop, "#000000", "important");
                  }
                }
              });

              if (el.classList) {
                const classesToRemove: string[] = [];
                el.classList.forEach((className) => {
                  if (
                    className.includes("text-") ||
                    className.includes("bg-") ||
                    className.includes("border-")
                  ) {
                    classesToRemove.push(className);
                  }
                });
                classesToRemove.forEach((className) =>
                  el.classList.remove(className),
                );
              }
            }
          });

          const styleElements = clonedDoc.querySelectorAll("style");
          styleElements.forEach((el) => el.remove());
        },
      });

      // クローンを削除
      document.body.removeChild(clonedReport);

      // PDF生成 - コンテンツサイズに合わせたカスタムサイズ
      const customWidth = canvas.width / 2 + 30; // キャンバス幅の半分 + 余白
      const customHeight = canvas.height / 2 + 30; // キャンバス高さの半分 + 余白

      const pdf = new jsPDF({
        orientation: customWidth > customHeight ? "landscape" : "portrait",
        unit: "pt",
        format: [customWidth, customHeight], // カスタムサイズ
      });

      // カスタムサイズなので余白を最小限に
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // コンテンツをほぼページサイズいっぱいに表示
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      // カスタムサイズなのでスケールは1:1に近く
      const scaleX = contentWidth / canvas.width;
      const scaleY = contentHeight / canvas.height;
      const scale = Math.min(scaleX, scaleY);

      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;

      // 中央に配置
      const x = margin + (contentWidth - scaledWidth) / 2;
      const y = margin + (contentHeight - scaledHeight) / 2;

      // PDFに画像を追加
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        x,
        y,
        scaledWidth,
        scaledHeight,
      );

      // PDFを保存
      pdf.save("収益性分析レポート.pdf");

      // ボタンの状態をリセット
      if (button) {
        button.textContent = "PDFをダウンロード";
        button.removeAttribute("disabled");
      }
    } catch (error) {
      console.error("PDF生成エラー:", error);

      // ボタンの状態をリセット
      if (button) {
        button.textContent = "PDFをダウンロード";
        button.removeAttribute("disabled");
      }

      alert("PDFの生成中にエラーが発生しました。");
    }
  };

  // 金額をフォーマットする関数（万円単位）
  const formatAmount = (amount: number) => {
    return `¥${(amount / 10000).toFixed(0)}`;
  };

  // 金額をフォーマットする関数（百万円単位）
  const formatAmountM = (amount: number) => {
    return `¥${(amount / 1000000).toFixed(1)}`;
  };

  // パーセントをフォーマットする関数
  const formatPercent = (percent: number) => {
    return `${(percent * 100).toFixed(2)}%`;
  };

  // 年数をフォーマットする関数
  const formatYears = (years: number) => {
    return `${years.toFixed(2)}年`;
  };

  // 年次データのフォーマット（最初の20年間）
  const yearlyData = data.annual_rent_income
    .slice(1, 21)
    .map((value, index) => {
      const year = index + 1;
      return {
        year: `${year}年目`,
        rent: (value / 10000).toFixed(2),
        expense: 0.56, // 運営経費は固定
        noi: (data.net_operating_income[year] / 10000).toFixed(2),
        loanPayment: (data.annual_loan_repayment[year] / 10000).toFixed(2),
        btcf: (data.befor_tax_cash_flow[year] / 10000).toFixed(2),
        atcf: (data.after_tax_cash_flow[year] / 10000).toFixed(2),
      };
    });

  // 21-40年目のデータ
  const yearlyDataLater = data.annual_rent_income
    .slice(21, 41)
    .map((value, index) => {
      const year = index + 21;
      return {
        year: `${year}年目`,
        rent: (value / 10000).toFixed(2),
        expense: 0.56,
        noi: (data.net_operating_income[year] / 10000).toFixed(2),
        loanPayment:
          year <= 35
            ? (data.annual_loan_repayment[year] / 10000).toFixed(2)
            : "0.00",
        btcf: (data.befor_tax_cash_flow[year] / 10000).toFixed(2),
        atcf: (data.after_tax_cash_flow[year] / 10000).toFixed(2),
      };
    });

  return (
    <div style={{ overflow: "auto", width: "100%" }}>
      <div
        ref={reportRef}
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          padding: "15px",
          fontFamily: "Arial, sans-serif",
          fontSize: "11px",
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
            borderBottom: "2px solid #333",
            paddingBottom: "8px",
          }}
        >
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              margin: 0,
            }}
          >
            収益性分析レポート
          </h1>
          <div
            style={{
              backgroundColor: "#a5b4fc",
              padding: "5px 15px",
              color: "#333",
              fontWeight: "bold",
            }}
          >
            ロゴ
          </div>
        </div>

        <button
          type="button"
          id="download-button"
          onClick={handleDownloadPDF}
          style={{
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "6px",
            fontWeight: "500",
            display: "inline-flex",
            alignItems: "center",
            border: "none",
            cursor: "pointer",
            marginBottom: "15px",
            transition: "background-color 0.2s ease",
          }}
        >
          PDFをダウンロード
        </button>

        {/* 条件と分析結果のセクション */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          {/* 条件 */}
          <div style={{ flex: 1 }} hidden>
            <div
              style={{
                backgroundColor: "#333",
                color: "white",
                padding: "8px",
                fontWeight: "bold",
                marginBottom: "2px",
              }}
            >
              ■ 条件
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
                    購入金額
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                    }}
                  >
                    ¥100,000,000
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
                    購入諸費用
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                    }}
                  >
                    ¥8,000,000
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
                    建物築年数
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                    }}
                  >
                    10年
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
                    建物構造
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                    }}
                  >
                    重量鉄骨造(S)
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
                    空室率
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                    }}
                  >
                    5.00%
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
                    賃料下落率/年
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                    }}
                  >
                    1.00%
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
                    年間運営経費
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                    }}
                  >
                    ¥560,000
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
                    自己資金
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                    }}
                  >
                    ¥18,000,000
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
                    借入金額
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                    }}
                  >
                    ¥90,000,000
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
                    ローン期間
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                    }}
                  >
                    35年
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
                    投資期間
                  </td>
                  <td
                    style={{
                      padding: "6px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                    }}
                  >
                    40年
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 分析結果 */}
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
                    {formatAmountM(data.net_operating_income[1])}
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
                    全期間利回り(内部収益率、IRR)
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
                    {data.debt_service_coverage_ratio.toFixed(2)}
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
                    {formatAmountM(data.total_pl)}
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
        </div>

        {/* シミュレーション */}
        <div style={{ marginBottom: "20px" }} hidden>
          <div
            style={{
              backgroundColor: "#333",
              color: "white",
              padding: "8px",
              fontWeight: "bold",
              marginBottom: "2px",
            }}
          >
            ■ シミュレーション
          </div>

          {/* 1-20年目のテーブル */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "9px",
              marginBottom: "10px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th
                  style={{
                    padding: "4px",
                    border: "1px solid #ccc",
                    textAlign: "center",
                    minWidth: "100px",
                    fontSize: "9px",
                  }}
                >
                  項目名
                </th>
                {Array.from({ length: 20 }, (_, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                      minWidth: "38px",
                      fontSize: "8px",
                    }}
                  >
                    {i + 1}年目
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  年間賃料収入
                </td>
                {yearlyData.map((item, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    {item.rent}
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  年間運営経費
                </td>
                {yearlyData.map((_, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    0.56
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  純収益（NOI）
                </td>
                {yearlyData.map((item, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    {item.noi}
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  年間ローン返済額
                </td>
                {yearlyData.map((item, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    {item.loanPayment}
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  税引き前キャッシュフロー（BTCF）
                </td>
                {yearlyData.map((item, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    {item.btcf}
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  税引き後キャッシュフロー（ATCF）
                </td>
                {yearlyData.map((item, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    {item.atcf}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <div
            style={{
              fontSize: "9px",
              color: "#666",
              marginBottom: "8px",
            }}
          >
            ※単位：万円
          </div>

          {/* 21-40年目のテーブル */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "9px",
              marginBottom: "10px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th
                  style={{
                    padding: "4px",
                    border: "1px solid #ccc",
                    textAlign: "center",
                    minWidth: "100px",
                    fontSize: "9px",
                  }}
                >
                  項目名
                </th>
                {Array.from({ length: 20 }, (_, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                      minWidth: "38px",
                      fontSize: "8px",
                    }}
                  >
                    {i + 21}年目
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  年間賃料収入
                </td>
                {yearlyDataLater.map((item, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    {item.rent}
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  年間運営経費
                </td>
                {yearlyDataLater.map((_, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    0.56
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  純収益（NOI）
                </td>
                {yearlyDataLater.map((item, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    {item.noi}
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  年間ローン返済額
                </td>
                {yearlyDataLater.map((item, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    {item.loanPayment}
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  税引き前キャッシュフロー（BTCF）
                </td>
                {yearlyDataLater.map((item, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    {item.btcf}
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "3px",
                    border: "1px solid #ccc",
                    fontSize: "9px",
                  }}
                >
                  税引き後キャッシュフロー（ATCF）
                </td>
                {yearlyDataLater.map((item, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "2px",
                      border: "1px solid #ccc",
                      textAlign: "right",
                      fontSize: "8px",
                    }}
                  >
                    {item.atcf}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <div
            style={{
              fontSize: "9px",
              color: "#666",
              marginBottom: "15px",
            }}
          >
            ※単位：万円
          </div>
        </div>

        {/* チャートセクション */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          {/* キャッシュフローグラフ */}
          <div style={{ flex: "1 1 300px", minWidth: "300px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#333",
              }}
            >
              キャッシュフロー
            </h3>
            <div
              style={{
                fontSize: "9px",
                color: "#666",
                marginBottom: "5px",
              }}
            >
              税引き前CF（青線）、税引き後CF（赤線）、CF累積
            </div>
            <div style={{ height: "180px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.befor_tax_cash_flow
                    .slice(1, 21)
                    .map((value, index) => ({
                      year: index + 1,
                      btcf: value / 10000,
                      atcf: data.after_tax_cash_flow[index + 1] / 10000,
                      cumulative: data.cumulative_cash_flow[index + 1] / 10000,
                    }))}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toFixed(0)}万円`,
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="btcf"
                    stroke="#0088FE"
                    name="税引前CF"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="atcf"
                    stroke="#FF0000"
                    name="税引後CF"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#00C49F"
                    name="CF累積"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* デッドクロスグラフ */}
          <div style={{ flex: "1 1 300px", minWidth: "300px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#333",
              }}
            >
              デッドクロス
            </h3>
            <div
              style={{
                fontSize: "9px",
                color: "#666",
                marginBottom: "5px",
              }}
            >
              元本返済額と減価償却費
            </div>
            <div style={{ height: "180px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.annual_principal_payment
                    .slice(1, 21)
                    .map((value, index) => ({
                      year: index + 1,
                      principal: value / 10000,
                      depreciation:
                        data.depreciation_expense[index + 1] / 10000,
                    }))}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toFixed(0)}万円`,
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="principal" fill="#FF8042" name="元本返済額" />
                  <Bar
                    dataKey="depreciation"
                    fill="#82ca9d"
                    name="減価償却費"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ローン残高グラフ */}
          <div style={{ flex: "1 1 300px", minWidth: "300px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#333",
              }}
            >
              ローン
            </h3>
            <div
              style={{
                fontSize: "9px",
                color: "#666",
                marginBottom: "5px",
              }}
            >
              元金残高（青線）、元利合計（赤線）、ローン残高
            </div>
            <div style={{ height: "180px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.loan_balance.slice(0, 21).map((value, index) => ({
                    year: index,
                    balance: value / 10000,
                    principal:
                      index > 0
                        ? data.annual_principal_payment[index] / 10000
                        : 0,
                    interest:
                      index > 0
                        ? data.annual_interest_payment[index] / 10000
                        : 0,
                  }))}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => [
                      `${(value as number).toFixed(0)}万円`,
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#0088FE"
                    name="ローン残高"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="principal"
                    stroke="#FF0000"
                    name="元本返済"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="interest"
                    stroke="#00C49F"
                    name="利息支払"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 収益指標サマリー */}
        <div
          style={{
            marginTop: "20px",
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
            全期間利回り（内部収益率、IRR）
          </h3>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#0088FE",
              textAlign: "center",
            }}
          >
            {formatPercent(data.internal_rate_of_return)}
          </div>
        </div>
      </div>
    </div>
  );
}
