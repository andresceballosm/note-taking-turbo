import Image from 'next/image';
import Logo from './eye.svg';

type EyeIconProps = {
  className?: string;
};

export function EyeIcon({ className }: EyeIconProps) {
  return <Image src={Logo} alt="" aria-hidden="true" className={className} />;
}
