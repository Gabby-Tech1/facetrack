import React from "react";
import { logo } from "../../imports/images/images";
import ButtonComponent from "../../components/ui/button";
import Input from "../../components/ui/input";
import "../../App.css";
import { Card } from "@radix-ui/themes";

const Login: React.FC = () => {
  return (
    //global container for component
    <div className="flex flex-col items-center justify-center min-h-screen place-items-center">
      {/*container for header of auth page*/}
      <div className="flex flex-col items-center">
        <img
          className=" mb-4 logo"
          src={logo}
          alt="App Logo depicting a facial recognition system"
        />
        <p className="large-text antialiased">FaceTrack</p>
        <p className="small-text antialiased text-gray-400">
          Sign in to your account
        </p>
      </div>

      {/*container for form field card*/}
      <Card className="mt-12 bg-card-background w-lg" size="5">
        <div className="">
          {/*email field*/}
          <Input
            type="text"
            placeholder="admin@facetrack.com"
            fieldId="email"
            icon
            label="Email"
          ></Input>

          {/*password field*/}
          <Input
            type="password"
            placeholder="Enter your password"
            fieldId="password"
            icon
            isPassword={true}
            label="Password"
          ></Input>

          {/*button*/}
          <ButtonComponent
            className="w-full bg-accent/80 h-10 rounded-lg hover:bg-accent transition-colors cursor-pointer flex items-center justify-center mb-4"
            text="Sign In"
          ></ButtonComponent>

          <Card className="mt-12">
            <p className="text-white antialiased text-sm">
              Example Credentials:
            </p>
            <p>
              <span className=" antialiased text-sm">Super Admin: </span>{" "}
              <span className="text-gray-500 antialiased text-sm">
                admin@facetrack.com / admin123
              </span>
            </p>
            <p></p>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default Login;
