import type { Chat } from "../types.ts"
import { convertChatGPTExportToChats, type ChatGPTExportFormat } from "./chatConverter.ts"

export const mockChatGPTExport: ChatGPTExportFormat[] = [
  {
    meta: {
      timestamp: "2023-10-17T12:00:00.000Z",
      url: "https://chatgpt.com/c/react-grundlagen",
      title: "React Grundlagen"
    },
    turns: [
      {
        date: "2023-10-17T12:01:50.000Z",
        html: "<div>Wie erstelle ich eine React-Komponente?</div>",
        id: "msg-1",
        model: "unknown",
        role: "user",
        text: "Wie erstelle ich eine React-Komponente?"
      },
      {
        date: "2023-10-17T12:02:00.000Z",
        html: "<div>Eine React-Komponente kann als Funktionskomponente erstellt werden...</div>",
        id: "msg-2",
        model: "gpt-4",
        role: "assistant",
        text: 'Eine React-Komponente kann als Funktionskomponente erstellt werden. Verwende "function ComponentName()" oder eine Arrow-Function "const ComponentName = () => {}". Die Komponente sollte JSX zurückgeben.'
      },
      {
        date: "2023-10-17T12:02:10.000Z",
        html: "<div>Was ist der Unterschied zwischen Props und State?</div>",
        id: "msg-3",
        model: "unknown",
        role: "user",
        text: "Was ist der Unterschied zwischen Props und State?"
      },
      {
        date: "2023-10-17T12:02:20.000Z",
        html: "<div>Props sind Daten, die von einer Elternkomponente...</div>",
        id: "msg-4",
        model: "gpt-4",
        role: "assistant",
        text: "Props sind Daten, die von einer Elternkomponente an eine Kindkomponente übergeben werden und unveränderlich sind. State hingegen ist ein interner Zustand einer Komponente, der sich ändern kann und bei Änderungen ein Re-Rendering auslöst."
      },
      {
        date: "2023-10-17T12:02:30.000Z",
        html: "<div>Wie funktioniert useEffect in React?</div>",
        id: "msg-5",
        model: "unknown",
        role: "user",
        text: "Wie funktioniert useEffect in React?"
      },
      {
        date: "2023-10-17T12:02:40.000Z",
        html: "<div>useEffect ist ein Hook...</div>",
        id: "msg-6",
        model: "gpt-4",
        role: "assistant",
        text: "useEffect ist ein Hook, der Seiteneffekte in Funktionskomponenten ermöglicht. Er wird nach jedem Render ausgeführt, kann aber mit einem Dependency-Array gesteuert werden. Syntax: useEffect(() => { /* code */ }, [dependencies])"
      }
    ]
  },
  {
    meta: {
      timestamp: "2023-10-18T12:00:00.000Z",
      url: "https://chatgpt.com/c/typescript-best-practices",
      title: "TypeScript Best Practices"
    },
    turns: [
      {
        date: "2023-10-18T12:00:10.000Z",
        html: "<div>Was sind TypeScript Generics?</div>",
        id: "msg-1",
        model: "unknown",
        role: "user",
        text: "Was sind TypeScript Generics?"
      },
      {
        date: "2023-10-18T12:00:20.000Z",
        html: "<div>Generics ermöglichen es...</div>",
        id: "msg-2",
        model: "gpt-4",
        role: "assistant",
        text: "Generics ermöglichen es, wiederverwendbare Komponenten zu erstellen, die mit verschiedenen Typen arbeiten können. Sie werden mit spitzen Klammern <T> definiert und bieten Typsicherheit bei gleichzeitiger Flexibilität."
      },
      {
        date: "2023-10-18T12:00:30.000Z",
        html: "<div>Wann sollte ich 'any' verwenden?</div>",
        id: "msg-3",
        model: "unknown",
        role: "user",
        text: "Wann sollte ich 'any' verwenden?"
      },
      {
        date: "2023-10-18T12:00:40.000Z",
        html: "<div>Der Typ 'any' sollte vermieden werden...</div>",
        id: "msg-4",
        model: "gpt-4",
        role: "assistant",
        text: "Der Typ 'any' sollte vermieden werden, da er die Typsicherheit aufhebt. Verwende ihn nur in Ausnahmefällen, etwa bei der Migration von JavaScript zu TypeScript oder wenn externe APIs unbekannte Typen zurückgeben. Besser sind 'unknown' oder spezifische Union Types."
      }
    ]
  }
]

export const mockChats: Chat[] = convertChatGPTExportToChats(mockChatGPTExport)

export function getMockData(): Chat[] {
  return mockChats
}
