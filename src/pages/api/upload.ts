import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs/promises";
import apiRoot from "@/utils/api";

// Next.jsのデフォルトのbodyParserを無効にする
export const config = {
  api: {
    bodyParser: false,
  },
};


// formidableでリクエストをパースする関数
const parseForm = (
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> => {
  const options: formidable.Options = {
    keepExtensions: true,
    maxFileSize: 1024 * 1024 * 20, // 20MB制限
  };
  const form = formidable(options);

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Formidable parsing error:", err);
        return reject(err);
      }
      resolve({ fields, files });
    });
  });
};


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  let tempFilePath: string | undefined;

  try {
    // formidableでリクエストをパース
    const { fields, files } = await parseForm(req);

    // userIdを取得
    const userIdField = fields.userId;
    const userId = Array.isArray(userIdField) ? userIdField[0] : userIdField;

    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }
    console.log("Received userId:", userId);

    // ファイル情報を取得
    const fileField = files.file;
    const uploadedFile = Array.isArray(fileField) ? fileField[0] : fileField;

    if (!uploadedFile) {
      return res.status(400).json({ message: "file is required." });
    }

    // 一時ファイルのパスを取得
    tempFilePath = uploadedFile.filepath;

    // ファイル情報のログ出力
    console.log("Uploaded file details (temporary):");
    console.log("  Original Filename:", uploadedFile.originalFilename);
    console.log("  Mimetype:", uploadedFile.mimetype);
    console.log("  Size:", uploadedFile.size);
    console.log("  Temporary Path:", tempFilePath);

    // PDFファイルかどうかの確認
    if (uploadedFile.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Uploaded file must be a PDF." });
    }

    // PDFを直接OpenAIに送信して分析
    console.log("Analyzing PDF with OpenAI...");
    const propertyData = await apiRoot.analyzePdfWithOpenAI(tempFilePath);
    console.log("Analysis result:", propertyData);

    // 成功レスポンス
    res.status(200).json({
      message: "PDF successfully analyzed!",
      userId: userId,
      filename: uploadedFile.originalFilename,
      data: propertyData,
    });
  } catch (error) {
    console.error("Error handling file upload or analysis:", error);

    // エラーの種類に応じたレスポンス
    if (
      error instanceof Error &&
      error.message &&
      error.message.includes("maxFileSize")
    ) {
      return res.status(413).json({ message: "File size limit exceeded." });
    }

    // その他のエラー
    return res.status(500).json({
      message: "An error occurred while processing the file.",
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    // 一時ファイルのクリーンアップ
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        console.log(`Successfully deleted temporary file: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error(
          `Error deleting temporary file ${tempFilePath}:`,
          cleanupError
        );
      }
    }
  }
}