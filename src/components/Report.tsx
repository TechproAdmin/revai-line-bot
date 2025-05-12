import React, { useRef, useState, useEffect } from "react";
import { RealEstateAnalysisRes } from "@/components/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// レポートコンポーネント
interface ReportProps {
  data: RealEstateAnalysisRes;
}

export function Report({ data }: ReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  // PDF ダウンロード処理
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    // ローディング状態を表示
    const button = document.getElementById("download-button");
    if (button) {
      button.textContent = "PDFを準備中...";
      button.setAttribute("disabled", "true");
    }

    try {
      // チャートが完全にレンダリングされるのを待つ
      await new Promise(resolve => setTimeout(resolve, 2000));

      const report = reportRef.current;

      // レポートのクローンを作成してPDF専用のスタイルを適用
      const clonedReport = report.cloneNode(true) as HTMLElement;

      // クローンにIDを設定
      clonedReport.id = 'pdf-report-clone';

      // クローンを一時的にドキュメントに追加（レンダリングのため）
      clonedReport.style.position = 'absolute';
      clonedReport.style.left = '-9999px';
      clonedReport.style.width = '794px'; // A4の幅（210mm ≈ 794px）

      document.body.appendChild(clonedReport);

      // コンテンツをキャンバスとして取得
      const canvas = await html2canvas(clonedReport, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
        ignoreElements: (element) => {
          return element.id === 'download-button';
        },
        // クローン時にスタイルを修正
        onclone: (clonedDoc) => {
          // すべての要素のスタイルを修正
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              // 計算済みスタイルを取得
              const computedStyle = window.getComputedStyle(el);

              // 色関連のプロパティをインラインスタイルとして設定
              ['color', 'background-color', 'border-color', 'outline-color', 'text-decoration-color'].forEach(prop => {
                const value = computedStyle.getPropertyValue(prop);
                if (value && !value.includes('oklch') && !value.includes('lab') && !value.includes('lch')) {
                  // 通常の色値をインラインスタイルとして設定
                  el.style.setProperty(prop, value, 'important');
                } else if (value && (value.includes('oklch') || value.includes('lab') || value.includes('lch'))) {
                  // 問題のある色関数を検出した場合は、デフォルト値に置き換え
                  switch (prop) {
                    case 'color':
                      el.style.setProperty(prop, '#000000', 'important');
                      break;
                    case 'background-color':
                      el.style.setProperty(prop, 'transparent', 'important');
                      break;
                    case 'border-color':
                      el.style.setProperty(prop, '#e5e7eb', 'important');
                      break;
                    default:
                      el.style.setProperty(prop, '#000000', 'important');
                  }
                }
              });

              // Tailwindのクラスを削除（問題の原因となる可能性がある）
              if (el.classList) {
                const classesToRemove: string[] = [];
                el.classList.forEach(className => {
                  if (className.includes('text-') || className.includes('bg-') || className.includes('border-')) {
                    classesToRemove.push(className);
                  }
                });
                classesToRemove.forEach(className => el.classList.remove(className));
              }
            }
          });

          // styleタグを無効化（グローバルスタイルが問題を起こす可能性がある）
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach(el => el.remove());
        }
      });

      // クローンを削除
      document.body.removeChild(clonedReport);

      // PDF生成
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // A4サイズ（ポイント単位）
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40; // ポイント単位のマージン

      // キャンバスの縦横比を維持しながらサイズを計算
      const contentWidth = pageWidth - (margin * 2);
      const scale = contentWidth / canvas.width;
      const scaledHeight = canvas.height * scale;

      // ページ数を計算
      const totalPages = Math.ceil(scaledHeight / (pageHeight - margin * 2));

      // 各ページにコンテンツを追加
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // 切り取り位置を計算
        const sourceY = page * (pageHeight - margin * 2) / scale;
        const sourceHeight = Math.min(canvas.height - sourceY, (pageHeight - margin * 2) / scale);

        // 切り取り用のキャンバスを作成
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY,
            canvas.width, sourceHeight,
            0, 0,
            canvas.width, sourceHeight
          );

          const pageData = pageCanvas.toDataURL('image/png');
          pdf.addImage(pageData, 'PNG', margin, margin, contentWidth, sourceHeight * scale);
        }
      }

      // PDFを保存
      pdf.save("不動産投資分析レポート.pdf");

      // ボタンの状態をリセット
      if (button) {
        button.textContent = "PDFをダウンロード";
        button.removeAttribute("disabled");
      }
    } catch (error) {
      console.error("PDF生成エラー:", error);

      // ボタンの状態をリセット
      if (button) {
        button.textContent = "PDFをダウンロード";
        button.removeAttribute("disabled");
      }

      alert("PDFの生成中にエラーが発生しました。");
    }
  };

  // 年次データのフォーマット
  const yearlyData = data.annual_rent_income.map((value, index) => {
    return {
      year: index,
      rent: value,
      noi: data.net_operating_income[index],
      loanPayment: data.annual_loan_repayment[index],
      cashFlow: data.befor_tax_cash_flow[index],
      principalPayment: data.annual_principal_payment[index],
      interestPayment: data.annual_interest_payment[index],
      loanBalance: data.loan_balance[index],
    };
  });

  // キャッシュフロー累積データ
  const cumulativeCashFlowData = data.cumulative_cash_flow.map(
    (value, index) => {
      return {
        year: index,
        cumulativeCashFlow: value,
      };
    }
  );

  // 投資リターン指標のためのデータ
  const returnMetrics = [
    { name: "NOI利回り", value: data.noi_yield * 100 },
    {
      name: "キャッシュオンキャッシュリターン",
      value: data.cash_on_cash_return * 100,
    },
    { name: "IRR", value: data.internal_rate_of_return * 100 },
    { name: "売却時利回り", value: data.sale_gross_yield * 100 },
    { name: "ROI", value: data.return_on_investment * 100 },
  ];

  // パイチャート用のカラー
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // 金額をフォーマットする関数（百万円単位）
  const formatAmount = (amount: number) => {
    return `${(amount / 1000000).toFixed(2)}M`;
  };

  // パーセントをフォーマットする関数
  const formatPercent = (percent: number) => {
    return `${percent.toFixed(2)}%`;
  };

  return (
    <div style={{ overflow: 'auto', width: '100%' }}>
      <div
        ref={reportRef}
        style={{
          width: '100%',
          maxWidth: '794px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          padding: '24px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1F2937',
            marginBottom: '16px'
          }}>
            不動産投資分析レポート
          </h2>

          <button
            id="download-button"
            onClick={handleDownloadPDF}
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            <svg style={{ width: '20px', height: '20px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDFをダウンロード
          </button>
        </div>

        {/* サマリーセクション */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#374151'
            }}>投資概要</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>投資回収期間:</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{data.payback_period}年</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>DSCR:</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{data.debt_service_coverage_ratio.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>LTV比率:</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{(data.loan_to_value * 100).toFixed(0)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>総利益:</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{formatAmount(data.total_pl)}</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#374151'
            }}>収益指標</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>NOI利回り:</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{formatPercent(data.noi_yield * 100)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>CCリターン:</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{formatPercent(data.cash_on_cash_return * 100)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>IRR:</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{formatPercent(data.internal_rate_of_return * 100)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>ROI:</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{formatPercent(data.return_on_investment * 100)}</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#374151'
            }}>初期投資</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>初期投資額:</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{formatAmount(Math.abs(data.befor_tax_cash_flow[0]))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>ローン残高:</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{formatAmount(data.loan_balance[0])}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>年間賃料:</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{formatAmount(data.annual_rent_income[1])}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>NOI(1年目):</span>
                <span style={{ color: '#000000', fontWeight: '600' }}>{formatAmount(data.net_operating_income[1])}</span>
              </div>
            </div>
          </div>
        </div>

        {/* グラフセクション */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 収入と支出のグラフ */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#374151'
            }}>
              年間収入と支出
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={yearlyData.filter((_, i) => i > 0)}
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatAmount} />
                  <Tooltip formatter={(value) => formatAmount(value as number)} />
                  <Legend />
                  <Bar dataKey="rent" name="賃料収入" fill="#82ca9d" />
                  <Bar dataKey="noi" name="NOI" fill="#8884d8" />
                  <Bar dataKey="loanPayment" name="ローン返済" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* キャッシュフローのグラフ */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#374151'
            }}>
              キャッシュフロー
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={yearlyData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatAmount} />
                  <Tooltip formatter={(value) => formatAmount(value as number)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cashFlow"
                    name="税引前キャッシュフロー"
                    stroke="#ff7300"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 累積キャッシュフローのグラフ */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#374151'
            }}>
              累積キャッシュフロー
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={cumulativeCashFlowData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatAmount} />
                  <Tooltip formatter={(value) => formatAmount(value as number)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cumulativeCashFlow"
                    name="累積キャッシュフロー"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ローン返済内訳のグラフ */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#374151'
            }}>
              ローン返済内訳
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={yearlyData.filter((_, i) => i > 0)}
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  stackOffset="expand"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `${formatAmount(value as number)}`,
                      name,
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="principalPayment"
                    name="元本返済"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                  <Area
                    type="monotone"
                    dataKey="interestPayment"
                    name="利息支払"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ローン残高の推移 */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#374151'
            }}>
              ローン残高の推移
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={yearlyData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatAmount} />
                  <Tooltip formatter={(value) => formatAmount(value as number)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="loanBalance"
                    name="ローン残高"
                    stroke="#8884d8"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 投資収益性指標の円グラフ */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#374151'
            }}>
              投資収益性指標
            </h3>
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={returnMetrics}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
                  >
                    {returnMetrics.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${(value as number).toFixed(2)}%`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}