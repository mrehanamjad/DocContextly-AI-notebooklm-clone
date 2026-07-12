// "use client";

// import { useMemo } from "react";
// import { parseThinkingMessage } from "@/lib/thinking-parser";
// import { ThinkingBlock } from "./ThinkingBlock";
// import { MarkdownView } from "./SourcesPanel";

// interface AssistantMessageRendererProps {
//   text: string;
//   isStreaming?: boolean;
//   renderContent?: (parsedContent: string) => React.ReactNode;
// }

// export function AssistantMessageRenderer({
//   text,
//   isStreaming = false,
//   renderContent,
// }: AssistantMessageRendererProps) {
//   const parsed = useMemo(() => parseThinkingMessage(text), [text]);

//   return (
//     <div className="space-y-1">
//       {parsed.reasoning !== null && (
//         <ThinkingBlock reasoning={parsed.reasoning} isThinking={parsed.isThinking && isStreaming} />
//       )}

//       {(!parsed.isThinking || parsed.answer) && (
//         <div className="text-sm leading-relaxed text-foreground/80">
//           {renderContent ? (
//             renderContent(parsed.answer)
//           ) : (
//             <>
//               <MarkdownView>{parsed.answer}</MarkdownView>
//               {isStreaming && (
//                 <span className="inline-block w-1.5 h-4 bg-primary align-middle ml-0.5 caret-blink" />
//               )}
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useMemo } from "react";
import { parseThinkingMessage } from "@/lib/thinking-parser";
import { ThinkingBlock } from "./ThinkingBlock";
import { MarkdownView } from "./SourcesPanel";
import { StreamingText } from "./StreamingText";

interface AssistantMessageRendererProps {
  text: string;
  isStreaming?: boolean;
  renderContent?: (parsedContent: string) => React.ReactNode;
}

export function AssistantMessageRenderer({
  text,
  isStreaming = false,
  renderContent,
}: AssistantMessageRendererProps) {
  const parsed = useMemo(() => parseThinkingMessage(text), [text]);

  return (
    <div className="space-y-1">
      {parsed.reasoning !== null && (
        <ThinkingBlock reasoning={parsed.reasoning} isThinking={parsed.isThinking && isStreaming} />
      )}

      {(!parsed.isThinking || parsed.answer) && (
        <div className="text-sm leading-relaxed text-foreground/80">
          {renderContent ? (
            renderContent(parsed.answer)
          ) : isStreaming ? (
            <StreamingText text={parsed.answer} />
          ) : (
            <div className="animate-settle-in">
              <MarkdownView>{parsed.answer}</MarkdownView>
            </div>
          )}
        </div>
      )}
    </div>
  );
}