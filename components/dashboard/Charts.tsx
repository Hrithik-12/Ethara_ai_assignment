"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type StatusDatum = { name: string; count: number };
type PriorityDatum = { name: string; value: number; color: string };

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#64748b",
  MEDIUM: "#3b82f6",
  HIGH: "#f97316",
  URGENT: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export function TaskStatusChart({ data }: { data: StatusDatum[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
        >
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            stroke="rgb(107 114 128)"
            fontSize={11}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            stroke="rgb(107 114 128)"
            fontSize={11}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "rgb(30 33 48)",
              border: "1px solid rgb(42 45 62)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="count"
            fill="rgb(245 158 11)"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriorityDonut({ data }: { data: PriorityDatum[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-muted">
        No tasks yet — add some to see the breakdown.
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            paddingAngle={2}
            stroke="rgb(15 17 23)"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgb(30 33 48)",
              border: "1px solid rgb(42 45 62)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 11, color: "rgb(107 114 128)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Helpers used by the dashboard page to massage raw counts
export function statusSeries(
  byStatus: Record<string, number>
): StatusDatum[] {
  return Object.entries(STATUS_LABELS).map(([key, label]) => ({
    name: label,
    count: byStatus[key] ?? 0,
  }));
}

export function prioritySeries(
  byPriority: Record<string, number>
): PriorityDatum[] {
  return Object.entries(PRIORITY_COLORS).map(([key, color]) => ({
    name: key.charAt(0) + key.slice(1).toLowerCase(),
    value: byPriority[key] ?? 0,
    color,
  }));
}
