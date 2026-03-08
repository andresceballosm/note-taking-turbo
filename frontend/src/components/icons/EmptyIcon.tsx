import Image from "next/image";
import Logo from "./empty.svg";

export function EmptyIcon() {
  return (
    <Image src={Logo} alt="Empty Icon" />
  );
}
