import type { LucideIcon } from "lucide-react"

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

export interface FeatureSection {
  title: string
  color: string
  features: Feature[]
}

