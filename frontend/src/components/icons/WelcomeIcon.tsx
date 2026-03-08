import Image from "next/image";
import Logo from "./login.svg";

export function WelcomeIcon() {
  return (
    <Image src={Logo} alt="Welcome Icon" />
  );
}
