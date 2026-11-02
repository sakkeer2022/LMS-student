import { forwardRef, type ComponentProps } from "react";
import { cx } from "./utils";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  function Input({ className, ...props }, ref) {
    return <input {...props} ref={ref} className={cx("ui-input", className)} />;
  },
);
