export interface ParsedMessage {
  reasoning: string | null;
  answer: string;
  isThinking: boolean;
}

/**
 * Parses assistant responses containing reasoning model <think>...</think> blocks.
 * Supports partial/incomplete tags during live streaming.
 */
export function parseThinkingMessage(text: string): ParsedMessage {
  const thinkStart = text.indexOf("<think>");
  if (thinkStart === -1) {
    return { reasoning: null, answer: text, isThinking: false };
  }

  const thinkEnd = text.indexOf("</think>", thinkStart + 7);
  if (thinkEnd === -1) {
    // Tag is currently open (streaming reasoning)
    const reasoning = text.substring(thinkStart + 7);
    return {
      reasoning,
      answer: "",
      isThinking: true,
    };
  }

  // Tag is fully closed
  const reasoning = text.substring(thinkStart + 7, thinkEnd);
  const answer = text.substring(thinkEnd + 8);
  return {
    reasoning,
    answer,
    isThinking: false,
  };
}
