import React from "react";

interface ReportProps {
  data: {
    // API のレスポンスに合わせてプロパティを定義してください
    name?: string;
    date?: string;
    amount?: string;
    // その他必要な項目を追加
  };
}

export function Report({ data }: ReportProps) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">レポート内容</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p>
          <span className="font-bold">物件名:</span> {data.name}
        </p>
        <p>
          <span className="font-bold">購入日:</span> {data.date}
        </p>
        <p>
          <span className="font-bold">金額:</span> {data.amount}
        </p>
        {/* ここに他の項目も追加可能 */}
      </div>
    </div>
  );
}
