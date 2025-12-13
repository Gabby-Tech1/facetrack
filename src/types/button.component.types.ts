export interface ButtonComponentTypes {
  text: string;
  onClick?: () => void;
  className?: string;
  type: "button" | "submit" | "reset";
}
