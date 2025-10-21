import {CheckSquare, MessageSquare, Trash2, Copy, Tag, Sparkles, Upload, ArrowUpDown} from "lucide-react"
import type {FeatureSection} from "./types"

export const tutorialSections: FeatureSection[] = [
    {
        title: "Basisfunktionen",
        color: "rgb(0, 58, 121)",
        features: [
            {
                icon: CheckSquare,
                title: "Fragen auswählen",
                description: "Wähle einzelne oder alle Frage-Antwort-Paare auf einmal aus. Die ausgewählten Paare kannst du exportieren: Deine KI-Dokumentation wird automatisch generiert und enthält deine Auswahl.",
            },
            {
                icon: Copy,
                title: "Begründungen & Bewertungen kopieren",
                description: "Du brauchst nicht jede Begründung und Bewertung einzeln schreiben. Nachdem du ein Feld ausgefüllt hast, kannst du es auf andere Frage-Antwort-Paare übertragen. Dafür erscheint ein Button: Auf andere Fragen anwenden.",
            },
        ],
    },
    {
        title: "Multiple Chats",
        color: "#ffa064",
        features: [
            {
                icon: Upload,
                title: "Weitere Chats hochladen",
                description: "Du möchtest mehrere Chats in deiner KI-Dokumentation berücksichtigen? Lasse diesen Tab offen, gehe zurück zu ChatGPT, wähle den nächsten Chat und drücke auf den Button. Der Chat wird automatisch zu den Offenen hinzugefügt.",
            },
            {
                icon: MessageSquare,
                title: "Ganze Chats auswählen",
                description: "Wähle ganze Chats auf einmal aus. Alle Frage-Antwort-Paare werden ausgewählt..",
            },
            {
                icon: Trash2,
                title: "Chats löschen",
                description: "Entferne über die drei Punkte irrelevante Chat-Verläufe aus deiner Dokumentation.",
            },
            {
                icon: ArrowUpDown,
                title: "Reihenfolge verändern",
                description: "Deine Chatverläufe sollen in einer bestimmten Reihenfolge dokumentiert werden? Verschiebe Chats über die drei Punkte weiter nach oben oder unten.",
            },
        ],
    },
    {
        title: "KI Funktionen",
        color: "rgb(60, 210, 255)",
        features: [
            {
                icon: Tag,
                title: "Bewertung über Tags generieren",
                description: "In dem Bewertungsfeld kannst Tags anwählen, die die Qualität der Antwort beschreiben. Daraus wird automatisch ein Bewertungstext generiert.",
            },
            {
                icon: Sparkles,
                title: "Begründung KI-Ausformulieren",
                description: "Du kannst deine Anfragen-Begründung von einer KI generieren lassen. Möchtest du bestimmte Begriffe oder Formulierungen verwenden? Dann füge sie in das Textfeld ein, die KI berücksichtigt sie bei der Neuformulierung.",
            },
        ],
    },
]

