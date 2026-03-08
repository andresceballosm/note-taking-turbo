import Image from "next/image";
import Logo from "./signup.svg";

export function SignupIcon() {
  return (
    <Image src={Logo} alt="Signup Icon" />
  );
}
