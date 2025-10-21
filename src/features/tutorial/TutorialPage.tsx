import { FeatureSection } from "./FeatureSection"
import { tutorialSections } from "./tutorialData"
import {title} from "@/assets/Details.ts";

export function TutorialPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Tutorial</h1>
          <p className="text-muted-foreground text-lg">
              {title} vereinfacht das ätzende Schreiben von KI-Dokumentationen.
              Hier erfährst du, was es alles kann und wie du das Beste aus dem Tool
              herausholst.
          </p>
        </div>

        <div className="space-y-16">
          {tutorialSections.map((section, sectionIndex) => (
            <FeatureSection key={sectionIndex} section={section} />
          ))}
        </div>
      </div>
    </main>
  )
}
