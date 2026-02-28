import * as React from "react";

type MenuIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const MenuIcon = ({
  size = 24,
  color = "#141B34",
  strokeWidth = 2,
  className,
  ...props
}: MenuIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M4 5H14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 12H20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 19H20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};