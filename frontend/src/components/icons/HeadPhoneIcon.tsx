import Image from 'next/image';
import Logo from './headphone.svg';

type HeadPhoneIconProps = {
  className?: string;
};

export function HeadPhoneIcon({ className }: HeadPhoneIconProps) {
  return <Image src={Logo} alt="" aria-hidden="true" className={className} />;
}
