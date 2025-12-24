import * as React from "react";

type CloseCircleIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const CloseCircleIcon = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.5,
  className,
  ...props
}: CloseCircleIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      className={className}
      {...props}
    >
      <path
        d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.17188 14.8319L14.8319 9.17188"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.8319 14.8319L9.17188 9.17188"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
