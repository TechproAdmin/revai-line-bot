import type { Liff } from "@line/liff";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ReportForm } from "@/client/features/form/components/ReportForm";
import { Report } from "@/client/features/report/components/Report";
import { PdfUploader } from "@/client/features/upload/components/PdfUploader";
import type {
  PdfExtractionResult,
  RealEstateAnalysisRes,
} from "@/shared/types";

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-center">
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="text-gray-900 hover:text-gray-700 cursor-pointer transition-colors duration-200"
                >
                  不動産投資レポート作成
                </button>
              </h1>
            </div>
            <div className="p-6 space-y-6">
              {liffError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  <strong>エラー:</strong> LIFFの初期化に失敗しました:{" "}
                  {liffError}
                </div>
              )}

              {message && (
                <div
                  className={`p-4 rounded-lg border ${
                    message.includes("成功")
                      ? "bg-green-50 text-green-700 border-green-200"
                      : message.includes("失敗") || message.includes("エラー")
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {message}
                </div>
              )}

              {reportData ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <p>
                      レポートを作成しました。詳細なPDFレポートを受け取りたい場合は、「PDFをダウンロード」ボタンを押してください。
                    </p>
                  </div>
                  <Report data={reportData} />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-4">
                      <Image
                        src="/RevAI.png"
                        alt="RevAI Logo"
                        width={48}
                        height={48}
                        className="flex-shrink-0"
                      />
                      <div className="space-y-3 text-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900">
                          不動産投資の分析を始めましょう！
                        </h2>
                        <ul className="space-y-2">
                          <li>
                            ・項目を全て入力し「送信」ボタンを押していただくと、レポートが作成できます。
                          </li>
                          <li>
                            ・物件概要書やマイソクなどのPDFファイルをアップロードすると、レポート作成に必要なデータを自動で入力します。
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {isLiffReady && liff && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <PdfUploader
                        liff={liff}
                        onUploadSuccess={handleUploadSuccess}
                      />
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
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
  );
}
