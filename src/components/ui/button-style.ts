export type ButtonVariant = "primary" | "outline" | "ghost";
export type ButtonStyle = { variant?: ButtonVariant; size?: "md" | "lg" };

export function buttonClass({ variant = "primary", size = "md" }: ButtonStyle) {
  return `ui-button ui-button--${variant} ui-button--${size}`;
}
