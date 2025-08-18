import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
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
  deadCrossYear?: number;
}

export function DeadCrossChart({ data, deadCrossYear }: DeadCrossChartProps) {
  return (
    <div style={{ width: "100%", minWidth: "280px", flex: "1 1 300px" }}>
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
      <div style={{ height: "240px", width: "100%" }}>
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
              interval="preserveStartEnd"
              minTickGap={15}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              labelFormatter={(value) => `${value}年`}
              formatter={(value) => [`${(value as number).toFixed(0)}万円`]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="principal"
              stroke="#FF8042"
              strokeWidth={2}
              name="元本返済額"
            />
            <Line
              type="monotone"
              dataKey="depreciation"
              stroke="#82ca9d"
              strokeWidth={2}
              name="減価償却費"
            />
            {deadCrossYear && deadCrossYear > 0 && (
              <ReferenceLine
                x={deadCrossYear}
                stroke="#ff0000"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: "デッドクロス",
                  fontSize: 10,
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
