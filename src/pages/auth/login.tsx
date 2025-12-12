import React from "react";
import { logo } from "../../imports/images/images";
import { Box, Card } from "@radix-ui/themes";
import Form from "../../components/form";
import ButtonComponent from "../../components/button";

const Login: React.FC = () => {
  return (
    //global container for component
    <div className="flex justify-center flex-col items-center">
      {/*container for header of auth page*/}
      <div>
        <img
          className="w-24 "
          src={logo}
          alt="App Logo depicting a facial recognition system"
        />
        <p>FaceTrack</p>
        <p>Sign in to your account</p>
      </div>

      {/*container for form field card*/}
      <Box maxWidth="240px">
        <Card asChild size="5">
          <div>
            {/*email field*/}
            <Form
              placeholder="admin@facetrack.com"
              fieldId="email"
              icon
              label="Email"
            ></Form>

            {/*password field*/}
            <Form
              placeholder="Enter your password"
              fieldId="email"
              icon
              isPassword={true}
              label="Password"
            ></Form>

            {/*button*/}
            <ButtonComponent text="Sign In"></ButtonComponent>

            <Card>
              <div>
                <p>Example Credentials:</p>
                <p>
                  <span>Super Admin: </span>{" "}
                  <span>admin@facetrack.com / admin123</span>
                </p>
                <p></p>
              </div>
            </Card>
          </div>
        </Card>
      </Box>
    </div>
  );
};

export default Login;
