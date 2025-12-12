import { TextField } from "@radix-ui/themes";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import type { FormTypes } from "../types/form.component.types";

const Form: React.FC<FormTypes> = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const toggleVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={props.fieldId}>{props.label}</label>

      <TextField.Root
        type={props.isPassword ? (showPassword ? "text" : "password") : "text"}
        id={props.fieldId}
        name={props.fieldName}
        placeholder={props.placeholder}
        onChange={props.onChange}
      >
        {/* Left icon slot (optional) */}
        <TextField.Slot />

        {/* Right icon SLOT — must be INSIDE the Root */}
        {props.isPassword && (
          <TextField.Slot side="right">
            {showPassword ? (
              <EyeOff
                className="cursor-pointer"
                size={18}
                onClick={toggleVisibility}
              />
            ) : (
              <Eye
                className="cursor-pointer"
                size={18}
                onClick={toggleVisibility}
              />
            )}
          </TextField.Slot>
        )}
      </TextField.Root>
    </div>
  );
};

export default Form;
