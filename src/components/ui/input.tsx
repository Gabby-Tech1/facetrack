import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import type { InputTypes } from "../../types/form.component.types";

const Input: React.FC<InputTypes> = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  const toggleVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex flex-col gap-1 relative">
      <label className="antialiased text-white" htmlFor={props.fieldId}>
        {props.label}
      </label>
      <div className="relative mt-1 mb-8">
        <input
          required={props.required}
          type={
            props.isPassword ? (showPassword ? "text" : "password") : props.type
          }
          id={props.fieldId}
          name={props.fieldName}
          placeholder={props.placeholder}
          onChange={props.onChange}
          className="w-full pr-10 outline-none border rounded-lg px-2 py-1 focus:border-2 focus:border-accent focus:outline-none placeholder:antialiased placeholder:text-gray-500"
        />

        {/* Show toggle icon only for password fields */}
        {props.isPassword && (
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
