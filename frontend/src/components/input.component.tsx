import { InputHTMLAttributes, ReactNode, useId } from "react";

type InputTextProps = InputHTMLAttributes<HTMLInputElement> & {
  containerClassName?: string;
  endAdornment?: ReactNode;
};

export function InputText({
  containerClassName,
  className,
  endAdornment,
  id,
  ...props
}: InputTextProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div
      className={`flex flex-col items-start p-0 gap-[7px] w-[384px] max-w-full h-[39px] ${containerClassName ?? ""}`.trim()}
    >
      <div className="box-border flex flex-row items-center px-[15px] py-[7px] gap-2 w-full h-[39px] border border-[#957139] rounded-md bg-transparent">
        <input
          id={inputId}
          className={`w-full min-w-0 h-[15px] border-0 outline-0 bg-transparent font-[Inter,sans-serif] font-normal text-xs leading-[15px] text-black placeholder:text-black placeholder:opacity-80 ${className ?? ""}`.trim()}
          {...props}
        />
        {endAdornment ? (
          <span className="inline-flex items-center justify-center">
            {endAdornment}
          </span>
        ) : null}
      </div>
    </div>
  );
}
