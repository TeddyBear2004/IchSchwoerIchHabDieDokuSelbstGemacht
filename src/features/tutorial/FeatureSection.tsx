import { FeatureCard } from "./FeatureCard"
import type { FeatureSection as FeatureSectionType } from "./types"

interface FeatureSectionProps {
  section: FeatureSectionType
}

export function FeatureSection({ section }: FeatureSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-1 w-12 rounded-full" style={{ backgroundColor: section.color }} />
        <h2 className="text-3xl font-bold">{section.title}</h2>
      </div>

      <div className="space-y-4">
        {section.features.map((feature, featureIndex) => (
          <FeatureCard
            key={featureIndex}
            feature={feature}
            sectionColor={section.color}
          />
        ))}
      </div>
    </section>
  )
}
