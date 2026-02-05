"use client";

import { useState } from "react";

interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyButton({
  value,
  label = "Copy to Clipboard",
  copiedLabel = "Copied!",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No-op: clipboard may be unavailable in some contexts.
    }
  };

  return (
    <button onClick={handleCopy} className={className} type="button">
      {copied ? copiedLabel : label}
    </button>
  );
}
