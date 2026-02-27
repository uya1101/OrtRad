import React, { useState, useEffect } from 'react';
import { T } from '../../constants/tokens';

interface TypingTextProps {
  words: string[];
}

export default function TypingText({ words }: TypingTextProps) {
  const [display, setDisplay] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const w = words[wi];
    const id = setTimeout(() => {
      if (!del && ci < w.length) { setDisplay(w.slice(0, ci + 1)); setCi(c => c + 1); }
      else if (!del && ci === w.length) { setTimeout(() => setDel(true), 1800); }
      else if (del && ci > 0) { setDisplay(w.slice(0, ci - 1)); setCi(c => c - 1); }
      else { setDel(false); setWi(v => (v + 1) % words.length); }
    }, del ? 35 : 78);
    return () => clearTimeout(id);
  }, [ci, del, wi, words]);

  return (
    <span style={{ color: T.neonBlue, textShadow: "0 0 22px rgba(56,189,248,0.55)" }}>
      {display}
      <span style={{ animation: "blink 1.1s step-end infinite", color: T.neonTeal }}>▌</span>
    </span>
  );
}
