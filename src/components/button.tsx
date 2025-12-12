import { Button } from "@radix-ui/themes";
import React from "react";
import type { ButtonComponentTypes } from "../types/button.component.types";

const ButtonComponent: React.FC<ButtonComponentTypes> = (props) => {
  return (
    <div>
      <Button onClick={props.onClick} className="cursor-pointer">
        <span>{props.text}</span>
      </Button>
    </div>
  );
};

export default ButtonComponent;
