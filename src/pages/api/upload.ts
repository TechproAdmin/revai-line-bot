import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";
import path from "path";
import os from "os";
import pdfImgConvert from "pdf-img-convert"; // pdf-img-convertをインストールする必要があります

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

    // 画像形式を取得（デフォルトはjpg）
    const formatField = fields.format;
    const format = Array.isArray(formatField)
      ? formatField[0]
      : formatField || "jpg";
    const validFormats = ["jpg", "png"];

    if (!validFormats.includes(format.toLowerCase())) {
      return res.status(400).json({
        message: `Invalid format. Supported formats: ${validFormats.join(", ")}`,
      });
    }

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

    // PDFファイルを読み込んでページ数を取得
    const originalPdfBytes = await fs.readFile(tempFilePath);
    const originalPdfDoc = await PDFDocument.load(originalPdfBytes);
    const totalPages = originalPdfDoc.getPageCount();

    console.log(`PDF has ${totalPages} pages.`);

    // 処理結果を保存するためのパス
    const outputDir = os.tmpdir(); // システムの一時ディレクトリを使用
    const savedFiles = [];

    // PDFをページごとに分割
    const pdfPages = [];
    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(originalPdfDoc, [i]);
      newPdf.addPage(copiedPage);

      const pageBytes = await newPdf.save();
      const pagePath = path.join(outputDir, `temp_page_${i}.pdf`);
      await fs.writeFile(pagePath, pageBytes);
      pdfPages.push(pagePath);
    }

    // 各ページをPDFから画像に変換して保存
    for (let i = 0; i < pdfPages.length; i++) {
      const pageNumber = i + 1;
      const outputFilename = `user_${userId}_page_${pageNumber}.${format}`;
      const outputPath = path.join(outputDir, outputFilename);

      // PDF-to-Image変換（DPI設定で画質を調整可能）
      const options = {
        width: 1700, // 出力画像の幅（ピクセル）
        height: 2200, // 出力画像の高さ（ピクセル）
        quality: 100, // 画質（0-100）
        format: format.toUpperCase(), // JPG or PNG
      };

      // PDFを画像に変換
      const pdfImgPaths = await pdfImgConvert.convert(pdfPages[i], options);

      if (pdfImgPaths && pdfImgPaths.length > 0) {
        // 変換された画像データをファイルに保存
        await fs.writeFile(outputPath, pdfImgPaths[0]);
        console.log(`Saved page ${pageNumber} as ${format} to ${outputPath}`);
        savedFiles.push(outputFilename);

        // 一時PDFファイルを削除
        await fs.unlink(pdfPages[i]);
      }
    }

    // 成功レスポンス
    res.status(200).json({
      message: "PDF successfully converted to images!",
      userId: userId,
      format: format,
      filename: uploadedFile.originalFilename,
      pages: totalPages,
      savedFiles: savedFiles,
    });
  } catch (error) {
    console.error("Error handling file upload or conversion:", error);

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
