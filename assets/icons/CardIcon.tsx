import * as React from "react";

type CardIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const CardIcon = ({
  size = 40,
  color = "currentColor",
  strokeWidth = 2.5,
  className,
  ...props
}: CardIconProps) => {
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
      {/* Card container */}
      <path
        d="M3.33398 20.0003C3.33398 14.1045 3.33398 11.1566 5.08865 9.18849C5.3693 8.87371 5.67862 8.58258 6.01308 8.31844C8.1042 6.66699 11.2364 6.66699 17.5007 6.66699H22.5007C28.765 6.66699 31.8972 6.66699 33.9882 8.31844C34.3227 8.58258 34.632 8.87371 34.9127 9.18849C36.6673 11.1566 36.6673 14.1045 36.6673 20.0003C36.6673 25.8962 36.6673 28.844 34.9127 30.8122C34.632 31.127 34.3227 31.418 33.9882 31.6822C31.8972 33.3337 28.765 33.3337 22.5007 33.3337H17.5007C11.2364 33.3337 8.1042 33.3337 6.01308 31.6822C5.67862 31.418 5.3693 31.127 5.08865 30.8122C3.33398 28.844 3.33398 25.8962 3.33398 20.0003Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Small line left */}
      <path
        d="M16.666 26.667H19.166"
        stroke={color}
        strokeWidth={strokeWidth - 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Small line right */}
      <path
        d="M24.166 26.667H29.9993"
        stroke={color}
        strokeWidth={strokeWidth - 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Divider line */}
      <path
        d="M3.33398 15H36.6673"
        stroke={color}
        strokeWidth={strokeWidth - 1}
        strokeLinejoin="round"
      />
    </svg>
  );
};