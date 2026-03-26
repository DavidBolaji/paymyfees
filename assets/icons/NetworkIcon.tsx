import * as React from "react";

type NetworkIconProps = {
  size?: number;
  color?: string;
  secondaryColor?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const NetworkIcon = ({
  size = 50,
  color = "currentColor",
  secondaryColor = "#EFE8F5",
  strokeWidth = 2.5,
  className,
  ...props
}: NetworkIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      className={className}
      {...props}
    >
      {/* Outer rounded square */}
      <path
        d="M5.20801 25.0007C5.20801 15.6708 5.20801 11.0058 8.10642 8.1074C11.0049 5.20898 15.6698 5.20898 24.9997 5.20898C34.3295 5.20898 38.9945 5.20898 41.893 8.1074C44.7913 11.0058 44.7913 15.6708 44.7913 25.0007C44.7913 34.3304 44.7913 38.9954 41.893 41.894C38.9945 44.7923 34.3295 44.7923 24.9997 44.7923C15.6698 44.7923 11.0049 44.7923 8.10642 41.894C5.20801 38.9954 5.20801 34.3304 5.20801 25.0007Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* Top-left node */}
      <path
        d="M17.708 20.834C15.9821 20.834 14.583 19.4349 14.583 17.709C14.583 15.9831 15.9821 14.584 17.708 14.584C19.4339 14.584 20.833 15.9831 20.833 17.709C20.833 19.4349 19.4339 20.834 17.708 20.834Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {/* Bottom-right node */}
      <path
        d="M32.292 35.416C34.0178 35.416 35.417 34.0168 35.417 32.291C35.417 30.5652 34.0178 29.166 32.292 29.166C30.5662 29.166 29.167 30.5652 29.167 32.291C29.167 34.0168 30.5662 35.416 32.292 35.416Z"
        stroke={secondaryColor}
        strokeWidth={1.5}
      />

      {/* Connecting lines */}
      <path
        d="M20.833 17.709H35.4163"
        stroke={secondaryColor}
        strokeWidth={1.5}
        strokeLinecap="round"
      />

      <path
        d="M29.1663 32.291H14.583"
        stroke={secondaryColor}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
};