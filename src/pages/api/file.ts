import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs/promises"; // fs.promises を一時ファイルの削除に使用

// formidable にリクエストボディをパースさせるため、Next.js のデフォルトの bodyParser を無効にする
export const config = {
  api: {
    bodyParser: false,
  },
};

// formidable でリクエストをパースする関数 (一時ファイルとして処理)
const parseForm = (
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> => {
  const options: formidable.Options = {
    // keepExtensions: true, // 一時ファイル名に拡張子を保持したい場合
    // maxFileSize: 1024 * 1024 * 10, // 例: 一時ファイルでもサイズ制限 (10MB)
    // filter: function ({ name, originalFilename, mimetype }) {
    //   // ここでファイルの種類をフィルタリングすることも可能
    //   // return mimetype && mimetype.includes("image"); // 例: 画像のみ許可
    //   return true; // すべて許可
    // }
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

  let tempFilePath: string | undefined; // finallyブロックで削除するためにパスを保持

  try {
    // formidable でリクエストをパース (ファイルはOSの一時ディレクトリに保存される)
    const { fields, files } = await parseForm(req);

    // --- fields から userId を取得 ---
    const userIdField = fields.userId;
    const userId = Array.isArray(userIdField) ? userIdField[0] : userIdField;

    if (!userId) {
      // userIdがない場合、処理を中断
      return res.status(400).json({ message: "userId is required." });
    }
    console.log("Received userId:", userId);

    // --- files からファイル情報を取得 ---
    const fileField = files.file;
    const uploadedFile = Array.isArray(fileField) ? fileField[0] : fileField;

    if (!uploadedFile) {
      // ファイルがない場合、処理を中断
      return res.status(400).json({ message: "file is required." });
    }

    // 一時ファイルのパスを取得 (後で削除するため)
    tempFilePath = uploadedFile.filepath;

    // --- 一時ファイル情報の確認 (例) ---
    console.log("Uploaded file details (temporary):");
    console.log("  Original Filename:", uploadedFile.originalFilename);
    console.log("  Mimetype:", uploadedFile.mimetype);
    console.log("  Size:", uploadedFile.size);
    console.log("  Temporary Path:", tempFilePath); // OSの一時ディレクトリ内のパス

    // --- ここで一時ファイルに対する処理を実行 ---
    // 例:
    // 1. ファイルの内容を読み取ってメモリに保持 (小さいファイル向け)
    //    const fileContent = await fs.readFile(tempFilePath);
    //    console.log(`Read ${fileContent.length} bytes from temp file.`);
    //    // fileContent を使って何か処理 (例: 外部APIに送信)

    // 2. ファイルをストリームとして処理 (大きいファイル、外部ストレージ転送向け)
    //    const readStream = fs.createReadStream(tempFilePath);
    //    await uploadToCloudStorage(readStream, uploadedFile.originalFilename); // 例: クラウドへのアップロード関数

    // 3. ファイルのメタデータやuserIdをデータベースに保存

    // この例では、単にログ出力するだけに留めます
    console.log(
      `Processing temporary file for userId: ${userId} at path: ${tempFilePath}`
    );
    // 必要ならここで非同期処理を実行 await someProcessing(tempFilePath);

    // --- 成功レスポンス ---
    // 注意: 通常、一時ファイルのパス(tempFilePath)はクライアントに返すべきではありません。
    res.status(200).json({
      message: "File processed successfully!",
      userId: userId,
      filename: uploadedFile.originalFilename,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
    });
  } catch (error: unknown) {
    console.error("Error handling file upload:", error);
    if (error instanceof Error) {
      return res.status(413).json({ message: "File size limit exceeded." });
    }
  } finally {
    // --- 一時ファイルのクリーンアップ ---
    // 処理が成功してもエラーが発生しても、一時ファイルがあれば削除を試みる
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        console.log(`Successfully deleted temporary file: ${tempFilePath}`);
      } catch (cleanupError) {
        // ファイル削除中のエラーはログに残すが、クライアントへのレスポンスには影響させない
        console.error(
          `Error deleting temporary file ${tempFilePath}:`,
          cleanupError
        );
      }
    }
  }
}
