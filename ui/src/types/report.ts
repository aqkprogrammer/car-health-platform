export type VerdictType = "excellent" | "good" | "risky";

export type SeverityType = "critical" | "high" | "medium" | "low" | "none";

export interface RiskFlag {
  id: string;
  title: string;
  description: string;
  severity: SeverityType;
  category: string;
  recommendation?: string;
}

export interface SectionScore {
  score: number;
  maxScore: number;
  label: string;
  details: string[];
  issues?: RiskFlag[];
}

export interface CarHealthReport {
  id: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
  };
  trustScore: number;
  verdict: VerdictType;
  generatedAt: string;
  validUntil?: string; // ISO date string
  sections: {
    exterior: SectionScore;
    engine: SectionScore;
    interior?: SectionScore;
    transmission?: SectionScore;
  };
  riskFlags: RiskFlag[];
  summary: string;
}

export const VERDICT_CONFIG: Record<
  VerdictType,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  excellent: {
    label: "Excellent",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: "🌟",
  },
  good: {
    label: "Good",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: "✅",
  },
  risky: {
    label: "Risky",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: "⚠️",
  },
};

export const SEVERITY_CONFIG: Record<
  SeverityType,
  { label: string; color: string; bgColor: string }
> = {
  critical: {
    label: "Critical",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  high: {
    label: "High",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  low: {
    label: "Low",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  none: {
    label: "None",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
};
