import Image from 'next/image';
import Logo from './vol.svg';

type VolIconProps = {
  className?: string;
};

export function VolIcon({ className }: VolIconProps) {
  return <Image src={Logo} alt="" aria-hidden="true" className={className} />;
}
