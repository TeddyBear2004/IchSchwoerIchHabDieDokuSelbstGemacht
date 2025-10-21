import type { Feature } from "./types"

interface FeatureCardProps {
  feature: Feature
  sectionColor: string
}

export function FeatureCard({ feature, sectionColor }: FeatureCardProps) {
  const Icon = feature.icon

  return (
    <div className="flex gap-4 p-5 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="flex-shrink-0">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: sectionColor }}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{feature.title}</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
      </div>
    </div>
  )
}

