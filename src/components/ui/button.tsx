import React from "react";
import type { ButtonComponentTypes } from "../../types/button.component.types";

const ButtonComponent: React.FC<ButtonComponentTypes> = (props) => {
  return (
    <button onClick={props.onClick} className={props.className}>
      <span className="text-slate-900 font-medium">{props.text}</span>
    </button>
  );
};

export default ButtonComponent;
