"use client";
import { forwardRef, type ComponentProps } from "react";
import { buttonClass, type ButtonStyle } from "./button-style";
import { cx } from "./utils";

export const Button = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button"> & ButtonStyle
>(function Button(
  { variant, size, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={cx(buttonClass({ variant, size }), className)}
    />
  );
});
