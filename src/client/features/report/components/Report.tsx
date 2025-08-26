import { useId, useRef } from "react";
import type { RealEstateAnalysisRes } from "@/shared/types";
import { createChartData, formatPercent } from "../utils/formatters";
import { generatePDF } from "../utils/pdfGenerator";
import { AnalysisConditionsTable } from "./AnalysisConditionsTable";
import { AnalysisResultsTable } from "./AnalysisResultsTable";
import { CashFlowChart } from "./CashFlowChart";
import { DeadCrossChart } from "./DeadCrossChart";
import { LoanChart } from "./LoanChart";

export interface ReportProps {
  data: RealEstateAnalysisRes;
}

export function Report({ data }: ReportProps) {
  const downloadButtonId = useId();
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    await generatePDF(reportRef.current, downloadButtonId);
  };

  const { cashFlowData, deadCrossData, loanData } = createChartData(data);

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
          borderRadius: "6px",
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
            }}
          >
            <img
              src="/RevAI.png"
              alt="RevAI Logo"
              width={80}
              height={80}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        <button
          type="button"
          id={downloadButtonId}
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

        {/* 分析条件セクション */}
        <AnalysisConditionsTable data={data} />

        {/* 分析結果セクション */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <AnalysisResultsTable data={data} />
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

        {/* チャートセクション */}
        <div
          className="chart-container"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <style jsx>{`
            @media (min-width: 1024px) {
              .chart-container {
                flex-direction: row !important;
                flex-wrap: wrap;
                gap: 15px !important;
              }
            }
            @media print {
              .chart-container {
                flex-direction: row !important;
                flex-wrap: wrap;
                gap: 15px !important;
              }
            }
          `}</style>
          <CashFlowChart data={cashFlowData} />
          <DeadCrossChart
            data={deadCrossData}
            deadCrossYear={data.dead_cross_year}
          />
          <LoanChart data={loanData} />
        </div>
      </div>
    </div>
  );
}
