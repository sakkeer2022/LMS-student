import type { ComponentProps } from "react";

/** The only place a native <form> is rendered (UI lint). */
export function Form(props: ComponentProps<"form">) {
  return <form {...props} />;
}
