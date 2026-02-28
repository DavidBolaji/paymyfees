import * as React from "react";

type GradientWalletIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const GradientWalletIcon = ({
  size = 50,
  color = "#ffffff",
  strokeWidth = 2.5,
  className,
  ...props
}: GradientWalletIconProps) => {
  const gradientId = React.useId();

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

      <path
        d="M6.25 17.709H31.25C37.1425 17.709 40.0887 17.709 41.9194 19.5396C43.75 21.3702 43.75 24.3165 43.75 30.209V32.2923C43.75 38.1848 43.75 41.1311 41.9194 42.9617C40.0887 44.7923 37.1425 44.7923 31.25 44.7923H18.75C12.8574 44.7923 9.91117 44.7923 8.08058 42.9617C6.25 41.1311 6.25 38.1848 6.25 32.2923V17.709Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M31.25 17.7055V8.56378C31.25 6.71098 29.7479 5.20898 27.8952 5.20898C27.3617 5.20898 26.8358 5.33623 26.3613 5.58019L7.83812 15.1033C6.863 15.6046 6.25 16.609 6.25 17.7055"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M36.4596 32.2923C37.0348 32.2923 37.5013 31.8259 37.5013 31.2507C37.5013 30.6754 37.0348 30.209 36.4596 30.209M36.4596 32.2923C35.8844 32.2923 35.418 31.8259 35.418 31.2507C35.418 30.6754 35.8844 30.209 36.4596 30.209M36.4596 32.2923V30.209"
        stroke={color}
        strokeWidth={strokeWidth - 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <defs>
        <linearGradient
          id={gradientId}
          x1="25"
          y1="0"
          x2="25"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#002561" />
          <stop offset="0.576923" stopColor="#00296B" />
          <stop offset="1" stopColor="#001B4D" />
        </linearGradient>
      </defs>
    </svg>
  );
};