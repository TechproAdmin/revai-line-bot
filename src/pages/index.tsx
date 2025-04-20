import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Liff } from "@line/liff";
import { ReportForm } from "@/components/ReportForm";
import { PdfUploader } from "@/components/PdfUploader";
import { Report } from "@/components/Report";
import { ReportDataType, PdfExtractionResult } from "@/components/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
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
  const [reportData, setReportData] = useState<ReportDataType | null>(null);

  // LIFF の初期化チェック
  useEffect(() => {
    if (liff && !liffError) {
      setIsLiffReady(true);
      console.log("LIFF ready, OS:", liff.getOS());
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
  const handleReportFormSuccess = (data: ReportDataType) => {
    setReportData(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          不動産投資レポート作成
        </h1>
        <div>
          <p>
            こちらは不動産投資に有用なレポートを作成するアプリです。下記の項目を全て入力し「送信」ボタンを押してください。レポート画面が表示されます。レポートは「ダウンロード」ボタンを押すとダウンロードが可能です。
          </p>
          <p>
            また、物件概要書PDFファイルをアップロードするとレポート作成に必要なデータをPDFファイルから抜き出して自動で入力してくれます。
          </p>
        </div>
        {liffError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            LIFFの初期化に失敗しました: {liffError}
          </div>
        )}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${message.includes("成功")
              ? "bg-green-50 text-green-700"
              : message.includes("失敗") || message.includes("エラー")
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
              }`}
          >
            {message}
          </div>
        )}

        {reportData ? (
          // reportData がある場合は Report コンポーネントだけを表示
          <Report data={reportData} />
        ) : (
          <>
            {/* reportData が未定の場合は、PDFアップロードと ReportForm を表示 */}
            {isLiffReady && liff && (
              <PdfUploader liff={liff} onUploadSuccess={handleUploadSuccess} />
            )}
            {isLiffReady && liff && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  プラットフォーム: {liff.getOS()}
                </p>
                {liff.isLoggedIn() && (
                  <p className="text-sm text-gray-600">
                    ログイン状態: ログイン済み
                  </p>
                )}
              </div>
            )}
            <ReportForm
              formValues={formValues}
              onSuccess={handleReportFormSuccess}
            />
          </>
        )}
      </div>
    </div>
  );
}