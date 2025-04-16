import React, { useState, useRef } from "react";
import { Liff } from "@line/liff";

interface PdfUploaderProps {
  liff: Liff;
  // アップロード成功時に、サーバーから返却されたデータを引数に取るコールバック
  onUploadSuccess?: (data: {
    name: string;
    date: string;
    amount: string;
  }) => void;
}

export function PdfUploader({ liff, onUploadSuccess }: PdfUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル選択ハンドラー
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

  // アップロード処理
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
      const formData = new FormData();
      formData.append("file", selectedFile);

      // LIFF ログイン済みの場合、IDトークンからユーザー情報を付加
      if (liff && liff.isLoggedIn()) {
        const idToken = liff.getDecodedIDToken();
        if (idToken && idToken.sub) {
          formData.append("userId", idToken.sub);
        }
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log(result);

      if (result.data && onUploadSuccess) {
        onUploadSuccess({
          name: result.data.name || "",
          date: result.data.date || "",
          amount: result.data.amount || "",
        });
      }

      setMessage("ファイルのアップロードに成功しました");
    } catch (error: any) {
      console.error("アップロード中にエラーが発生しました", error);
      setMessage(
        `アップロード中にエラーが発生しました: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    setSelectedFile(null);
    setFileInfo(null);
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="pdf-uploader">
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
              disabled={isUploading || selectedFile.type !== "application/pdf"}
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
    </div>
  );
}
