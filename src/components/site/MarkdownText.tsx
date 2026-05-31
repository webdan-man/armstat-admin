"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { cn } from "@/lib/utils";

type MarkdownTextProps = {
  children?: string | null;
  className?: string;
  as?: "p" | "div" | "span" | "h1";
};

export function MarkdownText({ children, className, as: Tag = "p" }: MarkdownTextProps) {
  const text = children?.trim();
  if (!text) return null;

  const WrapperTag = Tag === "span" ? "span" : "div";

  return (
    <WrapperTag className={cn(className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ href, children: linkChildren }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-[rgba(15,104,192,1)] underline hover:opacity-80"
            >
              {linkChildren}
            </a>
          ),
          p: ({ children: paragraphChildren }) => (
            <span className="block not-last:mb-3">{paragraphChildren}</span>
          ),
          strong: ({ children: strongChildren }) => (
            <strong className="font-semibold">{strongChildren}</strong>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </WrapperTag>
  );
}
