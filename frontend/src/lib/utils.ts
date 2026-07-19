import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTemperature(value: number): string {
  return `${value.toFixed(1)}°C`
}

export function formatHumidity(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatRiskScore(value: number): string {
  return value.toFixed(0)
}

export function getRiskColor(score: number): string {
  if (score <= 25) return "text-emerald-400"
  if (score <= 50) return "text-yellow-400"
  if (score <= 75) return "text-orange-400"
  return "text-red-400"
}

export function getRiskBgColor(score: number): string {
  if (score <= 25) return "bg-emerald-500/10"
  if (score <= 50) return "bg-yellow-500/10"
  if (score <= 75) return "bg-orange-500/10"
  return "bg-red-500/10"
}

export function getRiskLabel(score: number): string {
  if (score <= 25) return "SAFE"
  if (score <= 50) return "WARNING"
  if (score <= 75) return "HIGH RISK"
  return "CRITICAL"
}

export function getZoneColor(zone: string): string {
  switch (zone?.toUpperCase()) {
    case "DAIRY": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    case "MEDICINE": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
    case "VEGETABLE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    default: return "bg-slate-500/10 text-slate-400 border-slate-500/20"
  }
}

export function getZoneDotColor(zone: string): string {
  switch (zone?.toUpperCase()) {
    case "DAIRY": return "bg-blue-400"
    case "MEDICINE": return "bg-purple-400"
    case "VEGETABLE": return "bg-emerald-400"
    default: return "bg-slate-400"
  }
}

export function getAlertLevelColor(level: string): string {
  switch (level?.toLowerCase()) {
    case "critical": return "bg-red-500/10 text-red-400 border-red-500/20"
    case "warning": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    case "info": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    default: return "bg-slate-500/10 text-slate-400 border-slate-500/20"
  }
}
