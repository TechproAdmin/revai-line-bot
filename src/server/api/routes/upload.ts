import fsSync from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pdf2img } from "@pdfme/converter";
import formidable, { type Fields, type Files } from "formidable";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/server/utils/logger";
import apiRoot from "@/utils/api";

// Next.jsのデフォルトのbodyParserを無効にする
export const config = {
  api: {
    bodyParser: false,
  },
};

// formidableでリクエストをパースする関数
const parseForm = (
  req: NextApiRequest,
): Promise<{ fields: Fields; files: Files }> => {
  const options: formidable.Options = {
    keepExtensions: true,
    maxFileSize: 1024 * 1024 * 20, // 20MB制限
  };
  const form = formidable(options);

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        logger.error("Formidable parsing error", {}, err);
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
      pdf.byteOffset + pdf.byteLength,
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

    logger.debug("PDF to images conversion completed", {
      pdfPath,
      tempDir,
      pageCount: images.length,
    });
    return imagePaths;
  } catch (error) {
    logger.error(
      "Error converting PDF to images",
      { pdfPath },
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
}

// 一時ファイルを削除する関数
async function cleanupFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      logger.error(
        `Error deleting file ${filePath}`,
        { filePath },
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const startTime = Date.now();
  let logContext = logger.apiStart("PDF_UPLOAD", req);

  logger.logRequest(req, logContext);

  if (req.method !== "POST") {
    logger.warn("Method not allowed", { ...logContext, method: req.method });
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
      logger.warn("No file uploaded", logContext);
      return res
        .status(400)
        .json({ message: "ファイルが選択されていません。" });
    }

    // 一時ファイルのパスを取得
    tempFilePath = uploadedFile.filepath;

    // PDFファイルかどうかの確認
    if (uploadedFile.mimetype !== "application/pdf") {
      logger.warn("Invalid file type", {
        ...logContext,
        mimetype: uploadedFile.mimetype,
        filename: uploadedFile.originalFilename,
      });
      return res
        .status(400)
        .json({ message: "PDFファイルのみアップロード可能です。" });
    }

    logContext = { ...logContext, filename: uploadedFile.originalFilename };
    logger.info("Starting PDF processing", logContext);

    // PDFを画像に変換
    imageFiles = await convertPdfToImages(tempFilePath);
    logger.info("PDF converted to images", {
      ...logContext,
      imageCount: imageFiles.length,
    });

    // PDFの画像をOpenAIに送信して分析
    const propertyData = await apiRoot.analyzePdfWithOpenAI(imageFiles);
    logger.info("OpenAI analysis completed", logContext);

    // 成功レスポンス
    const responseData = {
      message: "PDF successfully analyzed!",
      filename: uploadedFile.originalFilename,
      data: propertyData,
    };

    logger.logResponse(res, logContext, responseData);
    logger.apiEnd("PDF_UPLOAD", logContext, res, startTime);
    res.status(200).json(responseData);
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.apiError("PDF_UPLOAD", logContext, errorInstance);

    // エラーの種類に応じたレスポンス
    if (
      error instanceof Error &&
      error.message &&
      error.message.includes("maxFileSize")
    ) {
      logger.warn("File size exceeded", {
        ...logContext,
        error: error.message,
      });
      return res
        .status(413)
        .json({ message: "ファイルサイズが制限を超えています。" });
    }

    // その他のエラー
    return res.status(500).json({
      message: "ファイルの処理中にエラーが発生しました。",
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    // 一時ファイルのクリーンアップ
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        logger.debug("Temporary PDF file cleaned up", {
          ...logContext,
          tempFilePath,
        });
      } catch (cleanupError) {
        logger.error(
          "Failed to cleanup temporary PDF file",
          { ...logContext, tempFilePath },
          cleanupError instanceof Error
            ? cleanupError
            : new Error(String(cleanupError)),
        );
      }
    }

    // 変換した画像ファイルのクリーンアップ
    if (imageFiles.length > 0) {
      await cleanupFiles(imageFiles);
      logger.debug("Image files cleaned up", {
        ...logContext,
        imageCount: imageFiles.length,
      });
    }
  }
}
