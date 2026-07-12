"use client";

import { useMemo, useRef } from "react";

interface StreamingTextProps {
  text: string;
}

export function StreamingText({ text }: StreamingTextProps) {
  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  const mountedCount = useRef(0);

  const startIndex = mountedCount.current;
  mountedCount.current = tokens.length;

  return (
    <span className="whitespace-pre-wrap">
      {tokens.map((tok, i) => {
        if (tok === "") return null;
        const isNew = i >= startIndex;
        return (
          <span
            key={i}
            className={isNew ? "inline-block animate-word-fade-in" : undefined}
            style={
              isNew
                ? { animationDelay: `${Math.min((i - startIndex) * 12, 120)}ms` }
                : undefined
            }
          >
            {tok}
          </span>
        );
      })}
    </span>
  );
}