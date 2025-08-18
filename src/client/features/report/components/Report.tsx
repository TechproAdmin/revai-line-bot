import { useEffect, useId, useRef, useState } from "react";
import type { RealEstateAnalysisRes } from "@/shared/types";
import { createChartData, formatPercent } from "../utils/formatters";
import { generatePDF } from "../utils/pdfGenerator";
import { AnalysisConditionsTable } from "./AnalysisConditionsTable";
import { AnalysisResultsTable } from "./AnalysisResultsTable";
import { CashFlowChart } from "./CashFlowChart";
import { DeadCrossChart } from "./DeadCrossChart";
import { LoanChart } from "./LoanChart";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liff: any;
  }
}

export interface ReportProps {
  data: RealEstateAnalysisRes;
}

export function Report({ data }: ReportProps) {
  const downloadButtonId = useId();
  const reportRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // LIFFからユーザーIDを取得
    if (typeof window !== "undefined" && window.liff) {
      window.liff
        .getProfile()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((profile: any) => {
          setUserId(profile.userId);
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((error: any) => {
          console.error("LIFFプロファイル取得エラー:", error);
          // 開発環境では仮のユーザーIDを使用
          if (process.env.NODE_ENV === "development") {
            setUserId("dev_user_id");
          }
        });
    } else if (process.env.NODE_ENV === "development") {
      // 開発環境では仮のユーザーIDを使用
      setUserId("dev_user_id");
    }
  }, []);

  const handleSendPDF = async () => {
    if (!reportRef.current) return;

    if (!userId) {
      alert(
        "ユーザー情報を取得できませんでした。しばらく待ってから再試行してください。",
      );
      return;
    }

    try {
      // PDFバッファを生成
      const pdfBuffer = await generatePDF(
        reportRef.current,
        downloadButtonId,
        true,
      );

      // Base64エンコード（大きなバッファを安全に処理）
      let binaryString = "";
      for (let i = 0; i < pdfBuffer.length; i++) {
        binaryString += String.fromCharCode(pdfBuffer[i]);
      }
      const base64Buffer = btoa(binaryString);

      // バックエンドに送信
      const response = await fetch("/api/send-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfBuffer: base64Buffer,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("PDF送信に失敗しました");
      }

      const result = await response.json();
      console.log("PDF送信成功:", result);

      // 成功メッセージを表示
      alert("PDFをLINEに送信しました");
    } catch (error) {
      console.error("PDF送信エラー:", error);
      alert("PDF送信中にエラーが発生しました");
    }
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

        <div style={{ marginBottom: "15px" }}>
          <button
            type="button"
            id={downloadButtonId}
            onClick={handleSendPDF}
            disabled={!userId}
            style={{
              backgroundColor: userId ? "#10b981" : "#9ca3af",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: "500",
              display: "inline-flex",
              alignItems: "center",
              border: "none",
              cursor: userId ? "pointer" : "not-allowed",
              transition: "background-color 0.2s ease",
              opacity: userId ? 1 : 0.6,
            }}
          >
            {userId ? "PDFをLINEに送信" : "ユーザー情報取得中..."}
          </button>
        </div>

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

        {/* チャートセクション */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <CashFlowChart data={cashFlowData} />
          <DeadCrossChart
            data={deadCrossData}
            deadCrossYear={data.dead_cross_year}
          />
          <LoanChart data={loanData} />
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
