import type { Liff } from "@line/liff";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { ReportForm } from "@/client/features/form/components/ReportForm";
import { Report } from "@/client/features/report/components/Report";
import { PdfUploader } from "@/client/features/upload/components/PdfUploader";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import type {
  PdfExtractionResult,
  RealEstateAnalysisRes,
} from "@/shared/types";

const _geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const _geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface HomeProps {
  liff: Liff;
  liffError: string | null;
}

export default function Home({ liff, liffError }: HomeProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isLiffReady, setIsLiffReady] = useState<boolean>(false);
  const [formValues, setFormValues] = useState({});
  const [reportData, setReportData] = useState<RealEstateAnalysisRes | null>(
    null,
  );

  // LIFF の初期化チェック
  useEffect(() => {
    if (liff && !liffError) {
      setIsLiffReady(true);
    } else if (liffError) {
      setMessage(`LIFF エラー: ${liffError}`);
    }
  }, [liff, liffError]);

  // PDFアップロード成功時のコールバック
  const handleUploadSuccess = (data: PdfExtractionResult) => {
    setFormValues({
      total_price: data.total_price || "",
      land_price: data.land_price || "",
      building_price: data.building_price || "",
      building_age: data.building_age || "",
      structure: data.structure || "",
      gross_yield: data.gross_yield || "",
      current_yield: data.current_yield || "",
    });
  };

  // ReportForm 送信成功時のコールバック
  const handleReportFormSuccess = (data: RealEstateAnalysisRes) => {
    setReportData(data);
  };

  // ホームに戻る処理
  const handleBackToHome = () => {
    setReportData(null);
    setFormValues({});
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <ThemeToggle />
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
          <h1 className="text-2xl font-bold text-center mb-6">
            <button
              type="button"
              onClick={handleBackToHome}
              className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors duration-200"
            >
              不動産投資レポート作成
            </button>
          </h1>
          {liffError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
              LIFFの初期化に失敗しました: {liffError}
            </div>
          )}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                message.includes("成功")
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : message.includes("失敗") || message.includes("エラー")
                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
              }`}
            >
              {message}
            </div>
          )}

        {reportData ? (
          <div className="mb-4 p-3">
            <p className="text-gray-700 dark:text-gray-300">
              レポートを作成しました。詳細なレポートを確認したい場合は、「PDFをダウンロード」ボタンを押してダウンロードできるPDFをご確認ください。
            </p>
            <Report data={reportData} />
          </div>
        ) : (
          <>
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                こちらは不動産投資に有用なレポートを作成するアプリです。下記の項目を全て入力し「送信」ボタンを押してください。レポート画面が表示されます。レポートは「ダウンロード」ボタンを押すとダウンロードが可能です。
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                また、物件概要書PDFファイルをアップロードするとレポート作成に必要なデータをPDFファイルから抜き出して自動で入力してくれます。
              </p>
            </div>
            {isLiffReady && liff && (
              <PdfUploader liff={liff} onUploadSuccess={handleUploadSuccess} />
            )}
            <ReportForm
              formValues={formValues}
              onSuccess={handleReportFormSuccess}
            />
          </>
        )}
        </div>
      </div>
    </ThemeProvider>
  );
}
