import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DeadCrossChartProps {
  data: Array<{
    year: number;
    principal: number;
    depreciation: number;
  }>;
}

export function DeadCrossChart({ data }: DeadCrossChartProps) {
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
        デッドクロス
      </h3>
      <div
        style={{
          fontSize: "9px",
          color: "#666",
          marginBottom: "5px",
        }}
      >
        元本返済額と減価償却費
      </div>
      <div style={{ height: "180px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
            <Bar dataKey="principal" fill="#FF8042" name="元本返済額" />
            <Bar dataKey="depreciation" fill="#82ca9d" name="減価償却費" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
