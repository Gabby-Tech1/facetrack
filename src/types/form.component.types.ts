export interface FormTypes {
  placeholder: string;
  icon?: boolean;
  size?: string;
  variant?: string;
  color?: string;
  radius?: string;
  fieldId: string;
  label: string;
  fieldName?: string;
  isPassword?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
