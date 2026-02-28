import * as React from "react";

type ClipboardCheckIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const ClipboardCheckIcon = ({
  size = 40,
  color = "currentColor",
  strokeWidth = 2.5,
  className,
  ...props
}: ClipboardCheckIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      {...props}
    >
      {/* Main container */}
      <path
        d="M33.3327 26.6663V13.333C33.3327 8.61896 33.3327 6.26194 31.8682 4.79747C30.4037 3.33301 28.0467 3.33301 23.3327 3.33301H16.666C11.952 3.33301 9.59495 3.33301 8.13048 4.79747C6.66602 6.26194 6.66602 8.61896 6.66602 13.333V26.6663C6.66602 31.3803 6.66602 33.7373 8.13048 35.2018C9.59495 36.6663 11.952 36.6663 16.666 36.6663H23.3327C28.0467 36.6663 30.4037 36.6663 31.8682 35.2018C33.3327 33.7373 33.3327 31.3803 33.3327 26.6663Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Top clip */}
      <path
        d="M25.8327 3.33301H14.166C14.166 5.69002 14.166 6.86854 14.8982 7.60077C15.6305 8.33301 16.809 8.33301 19.166 8.33301H20.8327C23.1897 8.33301 24.3682 8.33301 25.1005 7.60077C25.8327 6.86854 25.8327 5.69002 25.8327 3.33301Z"
        stroke={color}
        strokeWidth={strokeWidth - 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Check mark */}
      <path
        d="M12.5 18.333L14.1667 19.9997L17.5 15.833"
        stroke={color}
        strokeWidth={strokeWidth - 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lines */}
      <path
        d="M21.666 28.333H26.666M21.666 18.333H26.666"
        stroke={color}
        strokeWidth={strokeWidth - 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dot */}
      <path
        d="M14.1504 28.1123H14.1671"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};