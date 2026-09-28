import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PinPad } from "@/components/PinPad";
import { SpeakButton } from "@/components/SpeakButton";

describe("PinPad", () => {
  it("collects at most 4 digits and supports backspace and clear", () => {
    const { container } = render(<PinPad name="pin" clearLabel="Clear" />);
    const hidden = () => (container.querySelector('input[name="pin"]') as HTMLInputElement).value;

    for (const d of ["1", "2", "3", "4", "5"]) fireEvent.click(screen.getByRole("button", { name: d }));
    expect(hidden()).toBe("1234");

    fireEvent.click(screen.getByRole("button", { name: "Backspace" }));
    expect(hidden()).toBe("123");

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(hidden()).toBe("");
  });
});

describe("SpeakButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("speaks the text in the Indian locale voice", () => {
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", { speak, cancel: vi.fn(), getVoices: () => [] });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        lang = "";
        rate = 1;
        constructor(public text: string) {}
      },
    );

    render(<SpeakButton text="अनार" label="Listen" />);
    fireEvent.click(screen.getByRole("button", { name: "Listen: अनार" }));

    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0]).toMatchObject({ text: "अनार", lang: "hi-IN" });
  });

  it("renders nothing when the browser has no speech support", () => {
    const { container } = render(<SpeakButton text="Apple" label="Listen" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("voiceLangFor", () => {
  it("uses the Hindi voice for Devanagari text and the English voice otherwise", async () => {
    const { voiceLangFor } = await import("@/components/SpeakButton");
    expect(voiceLangFor("जोड़")).toBe("hi-IN");
    expect(voiceLangFor("Adding with Objects")).toBe("en-IN");
  });
});
