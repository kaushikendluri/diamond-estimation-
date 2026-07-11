"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { ChartCard } from "@/components/analytics/chart-card";
import { ChartTooltip } from "@/components/analytics/chart-tooltip";
import { useHistoryStore } from "@/store/history-store";
import { computeAnalytics } from "@/lib/derive-stats";

const CYAN = "oklch(0.78 0.15 200)";
const VIOLET = "oklch(0.62 0.24 295)";
const PINK = "oklch(0.7 0.2 350)";
const AMBER = "oklch(0.77 0.16 70)";

const GRID_PROPS = { stroke: "oklch(1 0 0 / 8%)", vertical: false };
const AXIS_PROPS = { stroke: "oklch(1 0 0 / 40%)", fontSize: 11, tickLine: false, axisLine: false };

export default function AnalyticsPage() {
  const history = useHistoryStore((s) => s.results);
  const data = computeAnalytics(history);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Detection trends, size and confidence distributions, and throughput over time."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Detection Trends" description="Diamonds detected and images processed, last 14 days">
          <ResponsiveContainer>
            <AreaChart data={data.detectionTrends}>
              <defs>
                <linearGradient id="fillDiamonds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CYAN} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillImages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={VIOLET} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={VIOLET} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="date" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="diamonds" name="Diamonds" stroke={CYAN} fill="url(#fillDiamonds)" strokeWidth={2} />
              <Area type="monotone" dataKey="images" name="Images" stroke={VIOLET} fill="url(#fillImages)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Processing Time Trends" description="Average detection time per image (ms)">
          <ResponsiveContainer>
            <LineChart data={data.processingTimeTrends}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="date" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="avgMs"
                name="Avg. time (ms)"
                stroke={PINK}
                strokeWidth={2.5}
                dot={{ r: 3, fill: PINK }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average Diamond Size Distribution" description="Bucketed by approximate stone diameter">
          <ResponsiveContainer>
            <BarChart data={data.sizeDistribution}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="bucket" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "oklch(1 0 0 / 5%)" }} />
              <Bar dataKey="count" name="Diamonds" fill={VIOLET} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Confidence Score Distribution" description="Detection confidence across all stones">
          <ResponsiveContainer>
            <BarChart data={data.confidenceDistribution}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="bucket" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "oklch(1 0 0 / 5%)" }} />
              <Bar dataKey="count" name="Diamonds" fill={CYAN} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Image Upload History"
          description="Uploads per day, last 14 days"
          className="xl:col-span-2"
        >
          <ResponsiveContainer>
            <BarChart data={data.uploadHistory}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="date" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "oklch(1 0 0 / 5%)" }} />
              <Bar dataKey="uploads" name="Uploads" fill={AMBER} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
