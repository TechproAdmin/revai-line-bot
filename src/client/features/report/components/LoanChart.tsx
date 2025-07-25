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

interface LoanChartProps {
  data: Array<{
    year: number;
    balance: number;
    principal: number;
    interest: number;
  }>;
}

export function LoanChart({ data }: LoanChartProps) {
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
        ローン
      </h3>
      <div
        style={{
          fontSize: "9px",
          color: "#666",
          marginBottom: "5px",
        }}
      >
        元金残高（青線）、元利合計（赤線）、ローン残高
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
            <XAxis dataKey="year" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value) => [`${(value as number).toFixed(0)}万円`]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#0088FE"
              name="ローン残高"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="principal"
              stroke="#FF0000"
              name="元本返済"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="interest"
              stroke="#00C49F"
              name="利息支払"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
