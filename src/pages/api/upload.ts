import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import apiRoot from "@/utils/api";
import os from "os";
import { pdf2img } from "@pdfme/converter";

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

async function convertPdfToImages(pdfPath: string): Promise<string[]> {
  const tempDir = path.join(os.tmpdir(), `pdf-images-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });

  try {
    // SyncでPDFファイルを読み込み、ArrayBufferを取得
    const pdf = fsSync.readFileSync(pdfPath);
    const pdfArrayBuffer = pdf.buffer.slice(
      pdf.byteOffset,
      pdf.byteOffset + pdf.byteLength
    ) as ArrayBuffer;

    // 画像に変換（ここではすべてのページを対象）
    const images = await pdf2img(pdfArrayBuffer, {
      imageType: "png",
      // ページ範囲の指定も可能: range: { start: 1, end: 3 }
    });

    const imagePaths: string[] = [];

    // 各ページの画像をファイルとして保存
    for (let i = 0; i < images.length; i++) {
      const outputPath = path.join(tempDir, `page-${i + 1}.png`);
      await fs.writeFile(outputPath, Buffer.from(images[i]));
      imagePaths.push(outputPath);
    }

    return imagePaths;
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    throw error;
  }
}

// 一時ファイルを削除する関数
async function cleanupFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
}

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
  let imageFiles: string[] = [];

  try {
    // formidableでリクエストをパース
    const files = (await parseForm(req)).files;

    // ファイル情報を取得
    const fileField = files.file;
    const uploadedFile = Array.isArray(fileField) ? fileField[0] : fileField;

    if (!uploadedFile) {
      return res.status(400).json({ message: "file is required." });
    }

    // 一時ファイルのパスを取得
    tempFilePath = uploadedFile.filepath;

    // PDFファイルかどうかの確認
    if (uploadedFile.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Uploaded file must be a PDF." });
    }

    // PDFを画像に変換
    imageFiles = await convertPdfToImages(tempFilePath);

    // PDFの画像をOpenAIに送信して分析
    const propertyData = await apiRoot.analyzePdfWithOpenAI(imageFiles);


    // 成功レスポンス
    res.status(200).json({
      message: "PDF successfully analyzed!",
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
      } catch (cleanupError) {
        console.error(
          `Error deleting temporary file ${tempFilePath}:`,
          cleanupError
        );
      }
    }

    // 変換した画像ファイルのクリーンアップ
    if (imageFiles.length > 0) {
      await cleanupFiles(imageFiles);
    }
  }
}
