export interface InputTypes {
  placeholder: string;
  icon?: boolean;
  size?: string;
  variant?: string;
  color?: string;
  radius?: string;
  fieldId: string;
  type: React.HTMLInputTypeAttribute;
  label: string;
  required?: boolean;
  className?: string;
  fieldName?: string;
  isPassword?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
