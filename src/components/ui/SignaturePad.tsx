"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface SignaturePadHandle {
  clear: () => void;
  /** The drawing as a PNG, or null when nothing is drawn. */
  toPng: () => Promise<Blob | null>;
}

/**
 * A canvas to draw a signature with a finger, pen or mouse (pointer events). `onInkChange` reports whether
 * anything is drawn, so the caller can enable "Sign". Drawing stays inside the canvas and the page does not
 * scroll while a finger draws on it.
 */
export const SignaturePad = forwardRef<
  SignaturePadHandle,
  { onInkChange?: (hasInk: boolean) => void; label?: string }
>(function SignaturePad(
  { onInkChange, label = "Draw your signature here" },
  ref,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const inked = useRef(false);
  const [cleared, setCleared] = useState(true);

  // Match the canvas bitmap to its size on screen (and the screen's pixel density) so lines stay sharp
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = element.getBoundingClientRect();
    element.width = Math.round(width * ratio);
    element.height = Math.round(height * ratio);
    const context = element.getContext("2d");
    if (context) {
      context.scale(ratio, ratio);
      context.lineWidth = 2.2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#0f172a";
    }
  }, []);

  function point(event: React.PointerEvent<HTMLCanvasElement>): {
    x: number;
    y: number;
  } {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }

  function setInk(value: boolean): void {
    if (inked.current === value) return;
    inked.current = value;
    setCleared(!value);
    onInkChange?.(value);
  }

  useImperativeHandle(ref, () => ({
    clear() {
      const element = canvas.current;
      element?.getContext("2d")?.clearRect(0, 0, element.width, element.height);
      setInk(false);
    },
    toPng() {
      const element = canvas.current;
      if (!element || !inked.current) return Promise.resolve(null);
      return new Promise((resolve) => element.toBlob(resolve, "image/png"));
    },
  }));

  return (
    <div className="ui-signature">
      <canvas
        ref={canvas}
        className="ui-signature__canvas"
        role="img"
        aria-label={label}
        onPointerDown={(event) => {
          const context = event.currentTarget.getContext("2d");
          if (!context) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          drawing.current = true;
          const { x, y } = point(event);
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x + 0.01, y + 0.01);
          context.stroke();
          setInk(true);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return;
          const context = event.currentTarget.getContext("2d");
          if (!context) return;
          const { x, y } = point(event);
          context.lineTo(x, y);
          context.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
        onPointerCancel={() => {
          drawing.current = false;
        }}
      />
      {cleared && <span className="ui-signature__hint">{label}</span>}
    </div>
  );
});
