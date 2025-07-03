import type { Liff } from "@line/liff";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { ReportForm } from "@/client/features/form/components/ReportForm";
import { Report } from "@/client/features/report/components/Report";
import { PdfUploader } from "@/client/features/upload/components/PdfUploader";
import ThemeToggle from "@/components/ThemeToggle";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <ThemeToggle />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-center">
                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors duration-200"
                  >
                    不動産投資レポート作成
                  </button>
                </h1>
              </div>
              <div className="p-6 space-y-6">
                {liffError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                    <strong>エラー:</strong> LIFFの初期化に失敗しました:{" "}
                    {liffError}
                  </div>
                )}

                {message && (
                  <div
                    className={`p-4 rounded-lg border ${
                      message.includes("成功")
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                        : message.includes("失敗") || message.includes("エラー")
                          ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                          : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    {message}
                  </div>
                )}

                {reportData ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                      <p>
                        レポートを作成しました。詳細なレポートを確認したい場合は、「PDFをダウンロード」ボタンを押してダウンロードできるPDFをご確認ください。
                      </p>
                    </div>
                    <Report data={reportData} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="space-y-3 text-gray-700 dark:text-gray-300">
                        <p>
                          こちらは不動産投資に有用なレポートを作成するアプリです。下記の項目を全て入力し「送信」ボタンを押してください。レポート画面が表示されます。
                        </p>
                        <p>
                          また、物件概要書PDFファイルをアップロードするとレポート作成に必要なデータをPDFファイルから抜き出して自動で入力してくれます。
                        </p>
                      </div>
                    </div>

                    {isLiffReady && liff && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <PdfUploader
                          liff={liff}
                          onUploadSuccess={handleUploadSuccess}
                        />
                      </div>
                    )}

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <ReportForm
                        formValues={formValues}
                        onSuccess={handleReportFormSuccess}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
