"use client";

/** Big on-screen number pad for typing answers on a phone. */
export function NumberPad({
  onDigit,
  onBackspace,
  onClear,
  clearLabel,
}: {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  clearLabel: string;
}) {
  const key =
    "h-14 rounded-2xl border-2 border-amber-200 bg-white text-2xl font-bold shadow-sm transition active:scale-95 active:bg-amber-100";
  return (
    <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <button key={d} type="button" className={key} onClick={() => onDigit(d)}>
          {d}
        </button>
      ))}
      <button type="button" className={key} onClick={onClear} aria-label={clearLabel}>
        ✖
      </button>
      <button type="button" className={key} onClick={() => onDigit("0")}>
        0
      </button>
      <button type="button" className={key} onClick={onBackspace} aria-label="Backspace">
        ⌫
      </button>
    </div>
  );
}
