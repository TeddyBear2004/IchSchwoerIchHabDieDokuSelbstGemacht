import { GraduationCap, BookOpen, Edit } from "lucide-react"
import {title} from "@/assets/Details.ts";

interface HeaderProps {
    currentView: 'editor' | 'tutorial'
    onNavigate: (view: 'editor' | 'tutorial') => void
}

export function Header({ currentView, onNavigate }: HeaderProps) {
    return (
        <header className="border-b border-border bg-primary px-5 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                            <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-primary-foreground">{title}</h2>
                            <p className="text-xs text-secondary">NAK United</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => onNavigate('editor')}
                            className={`flex items-center gap-2 text-sm font-medium text-primary-foreground hover:opacity-80 transition-opacity ${
                                currentView === 'editor' ? 'underline underline-offset-4' : ''
                            }`}
                        >
                            <Edit className="h-4 w-4" />
                            Chat-Editor
                        </button>
                        <button
                            onClick={() => onNavigate('tutorial')}
                            className={`flex items-center gap-2 text-sm font-medium text-primary-foreground hover:opacity-80 transition-opacity ${
                                currentView === 'tutorial' ? 'underline underline-offset-4' : ''
                            }`}
                        >
                            <BookOpen className="h-4 w-4" />
                            Tutorial
                        </button>
                    </div>
                </div>
        </header>
    )
}
