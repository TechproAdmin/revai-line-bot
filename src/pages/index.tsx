import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Liff } from "@line/liff";
import { ReportForm } from "@/components/ReportForm";
import { PdfUploader } from "@/components/PdfUploader";
import { Report } from "@/components/Report"; // Report コンポーネントを追加

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
  const [formValues, setFormValues] = useState({
    name: "",
    date: "",
    amount: "",
  });
  const [initialData, setInitialData] = useState({});
  // reportData にフォーム送信結果（サーバーから返ってくるレポートデータ）を保持
  const [reportData, setReportData] = useState<null | {
    name?: string;
    date?: string;
    amount?: string;
    [key: string]: any;
  }>(null);

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
  const handleUploadSuccess = (data: {
    name: string;
    date: string;
    amount: string;
  }) => {
    // PDFアップロードで取得した値を初期値として設定
    setFormValues({
      name: data.name || "",
      date: data.date || "",
      amount: data.amount || "",
    });
    setInitialData({
      name: data.name || "",
      date: data.date || "",
      amount: data.amount || "",
    });
  };

  // ReportForm 送信成功時のコールバック
  const handleReportFormSuccess = (data: any) => {
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
            className={`mb-4 p-3 rounded-lg ${
              message.includes("成功")
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
              initialData={initialData}
              onSuccess={handleReportFormSuccess}
            />
          </>
        )}
      </div>
    </div>
  );
}
