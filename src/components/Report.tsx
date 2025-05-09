import React from "react";
import { RealEstateAnalysisRes } from "@/components/types";

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

interface ReportProps {
  data: RealEstateAnalysisRes;
}

export function Report({ data }: ReportProps) {
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
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      <h2 className="text-xl font-bold mb-6 text-gray-800">
        不動産投資分析レポート
      </h2>

      {/* サマリーセクション */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">投資概要</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium text-gray-600">投資回収期間:</span>{" "}
              {data.payback_period}年
            </p>
            <p>
              <span className="font-medium text-gray-600">DSCR:</span>{" "}
              {data.debt_service_coverage_ratio.toFixed(2)}
            </p>
            <p>
              <span className="font-medium text-gray-600">LTV比率:</span>{" "}
              {(data.loan_to_value * 100).toFixed(0)}%
            </p>
            <p>
              <span className="font-medium text-gray-600">総利益:</span>{" "}
              {formatAmount(data.total_pl)}
            </p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">収益指標</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium text-gray-600">NOI利回り:</span>{" "}
              {formatPercent(data.noi_yield * 100)}
            </p>
            <p>
              <span className="font-medium text-gray-600">
                キャッシュオンキャッシュリターン:
              </span>{" "}
              {formatPercent(data.cash_on_cash_return * 100)}
            </p>
            <p>
              <span className="font-medium text-gray-600">IRR:</span>{" "}
              {formatPercent(data.internal_rate_of_return * 100)}
            </p>
            <p>
              <span className="font-medium text-gray-600">ROI:</span>{" "}
              {formatPercent(data.return_on_investment * 100)}
            </p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">初期投資</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium text-gray-600">初期投資額:</span>{" "}
              {formatAmount(Math.abs(data.befor_tax_cash_flow[0]))}
            </p>
            <p>
              <span className="font-medium text-gray-600">
                ローン残高(初期):
              </span>{" "}
              {formatAmount(data.loan_balance[0])}
            </p>
            <p>
              <span className="font-medium text-gray-600">
                年間賃料収入(1年目):
              </span>{" "}
              {formatAmount(data.annual_rent_income[1])}
            </p>
            <p>
              <span className="font-medium text-gray-600">NOI(1年目):</span>{" "}
              {formatAmount(data.net_operating_income[1])}
            </p>
          </div>
        </div>
      </div>

      {/* グラフセクション */}
      <div className="space-y-8">
        {/* 収入と支出のグラフ */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            年間収入と支出
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyData.filter((_, i) => i > 0)} // 0年目を除外
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            キャッシュフロー
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={yearlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            累積キャッシュフロー
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cumulativeCashFlowData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            ローン返済内訳
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={yearlyData.filter((_, i) => i > 0)} // 0年目を除外
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            ローン残高の推移
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={yearlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            投資収益性指標
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={returnMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
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
  );
}
