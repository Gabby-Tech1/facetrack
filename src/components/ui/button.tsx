import React from "react";
import type { ButtonComponentTypes } from "../../interfaces/button.component.interface";

const ButtonComponent: React.FC<ButtonComponentTypes> = (props) => {
  return (
    <button
      onClick={props.onClick}
      className={props.className}
      type={props.type}
    >
      <span className="text-slate-900 font-medium">{props.text}</span>
    </button>
  );
};

export default ButtonComponent;
