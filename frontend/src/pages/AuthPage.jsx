import { useState } from "react";
import authScreenAtom from "../atoms/authAtom";
import LoginCard from "../components/Login";
import SignupCard from "../components/SignupCard";
import { useRecoilValue } from "recoil";

export const AuthPage = () => {
  const authScreenState = useRecoilValue(authScreenAtom);
  const [value, setValue] = useState("login");
  return <>{authScreenState === "login" ? <LoginCard /> : <SignupCard />}</>;
};
