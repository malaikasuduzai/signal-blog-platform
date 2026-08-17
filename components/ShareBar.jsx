// components/ShareBar.jsx
"use client";

import { useState, useEffect } from "react";
import styles from "./ShareBar.module.css";

export default function ShareBar({ title, path }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const shareUrl = `${origin}${path}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>Share:</span>
      <div className={styles.icons}>
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label={`Share on ${l.label}`}
          >
            {l.label}
          </a>
        ))}
        <button type="button" onClick={handleCopy} className={styles.iconLink}>
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
