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
  // The strokes are kept so the drawing can be redrawn when the canvas changes size
  const strokes = useRef<{ x: number; y: number }[][]>([]);
  const [cleared, setCleared] = useState(true);

  function paint(): void {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const ratio = window.devicePixelRatio || 1;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, element.width / ratio, element.height / ratio);
    context.lineWidth = 2.2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#0f172a";
    for (const stroke of strokes.current) {
      context.beginPath();
      stroke.forEach((p, i) =>
        i === 0 ? context.moveTo(p.x, p.y) : context.lineTo(p.x, p.y),
      );
      if (stroke.length === 1)
        context.lineTo(stroke[0]!.x + 0.01, stroke[0]!.y + 0.01);
      context.stroke();
    }
  }

  // The canvas sits in a dialog that is closed (zero size) until it opens, so its bitmap is sized whenever
  // its box changes, to the box on screen and the screen's pixel density; the strokes are then redrawn
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const fit = (): void => {
      const { width, height } = element.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const ratio = window.devicePixelRatio || 1;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      paint();
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
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
      strokes.current = [];
      paint();
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
          event.currentTarget.setPointerCapture(event.pointerId);
          drawing.current = true;
          strokes.current.push([point(event)]);
          paint();
          setInk(true);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return;
          strokes.current[strokes.current.length - 1]?.push(point(event));
          paint();
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
