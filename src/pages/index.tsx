import { useState, useEffect, useRef } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Liff } from "@line/liff";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LIFF の準備ができたかどうかを確認
  useEffect(() => {
    if (liff && !liffError) {
      setIsLiffReady(true);
      console.log("LIFF ready, OS:", liff.getOS());
    } else if (liffError) {
      setMessage(`LIFF エラー: ${liffError}`);
    }
  }, [liff, liffError]);

  // 通常のファイル選択処理
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setMessage("ファイルが選択されていません");
      return;
    }

    const file = files[0];
    setSelectedFile(file);
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (file.type === "application/pdf") {
      setMessage("PDFファイルを受け取りました");
    } else {
      setMessage("PDFファイル以外のファイルが選ばれました");
    }
  };

  // ファイルアップロード処理
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("アップロードするファイルを選択してください");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setMessage("PDFファイルのみアップロード可能です");
      return;
    }

    setIsUploading(true);
    setMessage("アップロード中...");

    try {
      // ここでファイルアップロード処理を実装
      const formData = new FormData();
      formData.append("file", selectedFile);

      // TODO: アクセストークンをサーバに送り、サーバ側で情報を取得するようにする
      if (isLiffReady && liff && liff.isLoggedIn()) {
        const idToken = liff.getDecodedIDToken();
        if (idToken && idToken.sub) {
          formData.append("userId", idToken.sub);
        }
      }

      // サーバーへのリクエスト例
      const response = await fetch("/api/file", {
        method: "POST",
        body: formData,
      });

      console.log(await response.json());
      // アップロード処理のモック
      // await new Promise((resolve) => setTimeout(resolve, 1500));
      setMessage("ファイルのアップロードに成功しました");
    } catch (error) {
      console.error("アップロード中にエラーが発生しました", error);
      setMessage(
        `アップロード中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // アップロードのキャンセル
  const handleCancel = () => {
    setSelectedFile(null);
    setFileInfo(null);
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          PDF アップロード
        </h1>

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

        {fileInfo && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">選択されたファイル:</h3>
            <p className="text-sm mb-1">
              <span className="font-medium">ファイル名:</span> {fileInfo.name}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">サイズ:</span>{" "}
              {Math.round(fileInfo.size / 1024)} KB
            </p>
            <p className="text-sm">
              <span className="font-medium">タイプ:</span> {fileInfo.type}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center cursor-pointer disabled:bg-gray-300 disabled:text-gray-500"
          >
            PDFファイルを選択
          </label>

          {selectedFile && (
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:bg-gray-300"
                onClick={handleUpload}
                disabled={
                  isUploading || selectedFile.type !== "application/pdf"
                }
              >
                {isUploading ? "アップロード中..." : "アップロード"}
              </button>
              <button
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg"
                onClick={handleCancel}
                disabled={isUploading}
              >
                キャンセル
              </button>
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
}
