import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CashFlowChartProps {
  data: Array<{
    year: number;
    btcf: number;
    atcf: number;
    cumulative: number;
  }>;
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div style={{ flex: "1 1 300px", minWidth: "300px" }}>
      <h3
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "10px",
          color: "#333",
        }}
      >
        キャッシュフロー
      </h3>
      <div
        style={{
          fontSize: "9px",
          color: "#666",
          marginBottom: "5px",
        }}
      >
        税引き前CF（青線）、税引き後CF（赤線）、CF累積
      </div>
      <div style={{ height: "180px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `${value}年`}
              interval={0}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              labelFormatter={(value) => `${value}年`}
              formatter={(value) => [`${(value as number).toFixed(0)}万円`]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="btcf"
              stroke="#0088FE"
              name="税引前CF"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="atcf"
              stroke="#FF0000"
              name="税引後CF"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#00C49F"
              name="CF累積"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
