import * as React from "react";

type CheckBoldIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const CheckBoldIcon = ({
  size = 45,
  color = "currentColor",
  strokeWidth = 8,
  className,
  ...props
}: CheckBoldIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={(size * 34) / 45} // keep original aspect ratio
      viewBox="0 0 45 34"
      fill="none"
      stroke={color}
      className={className}
      {...props}
    >
      <path
        d="M4 18.8633L15.375 29.48L40.4 4"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
