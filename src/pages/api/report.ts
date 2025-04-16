import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    console.log("Received data:", req.body); // 本番ではDB保存などへ
    return res
      .status(200)
      .json({ data: { name: "test", date: "2023/01/01", amount: "10" } });
  }
  res.status(405).json({ message: "Method Not Allowed" });
}
