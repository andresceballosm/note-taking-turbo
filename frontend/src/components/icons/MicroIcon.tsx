import Image from 'next/image';
import Logo from './micro.svg';

type MicroIconProps = {
  className?: string;
};

export function MicroIcon({ className }: MicroIconProps) {
  return <Image src={Logo} alt="" aria-hidden="true" className={className} />;
}
