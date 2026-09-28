"use client";

import { useState } from "react";

/**
 * Big-button number pad for a 4-digit PIN, usable by young children.
 * The value is submitted through a hidden input named `name`.
 */
export function PinPad({ name, clearLabel }: { name: string; clearLabel: string }) {
  const [pin, setPin] = useState("");

  const press = (digit: string) => setPin((p) => (p.length < 4 ? p + digit : p));

  return (
    <div>
      <input type="hidden" name={name} value={pin} />
      <div className="mb-3 flex justify-center gap-3" aria-live="polite" aria-label={`${pin.length} of 4`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-5 w-5 rounded-full border-2 border-brand-500 ${i < pin.length ? "bg-brand-500" : "bg-white"}`}
          />
        ))}
      </div>
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <PadButton key={d} onClick={() => press(d)}>
            {d}
          </PadButton>
        ))}
        <PadButton onClick={() => setPin("")} label={clearLabel}>
          ✖
        </PadButton>
        <PadButton onClick={() => press("0")}>0</PadButton>
        <PadButton onClick={() => setPin((p) => p.slice(0, -1))} label="Backspace">
          ⌫
        </PadButton>
      </div>
    </div>
  );
}

function PadButton({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="h-16 rounded-2xl border-2 border-amber-200 bg-white text-2xl font-bold shadow-sm transition active:scale-95 active:bg-amber-100"
    >
      {children}
    </button>
  );
}
