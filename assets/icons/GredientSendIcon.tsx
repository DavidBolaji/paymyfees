import * as React from "react";

type GradientSendIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const GradientSendIcon = ({
  size = 50,
  color = "#ffffff",
  strokeWidth = 2.5,
  className,
  ...props
}: GradientSendIconProps) => {
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
        d="M43.8481 6.36092C39.3106 1.47432 5.17886 13.4448 5.20705 17.8152C5.23901 22.7713 18.5364 24.2959 22.222 25.33C24.4385 25.9517 25.032 26.5892 25.5431 28.9134C27.8577 39.4392 29.0197 44.6746 31.6683 44.7915C35.8899 44.9781 48.2764 11.1298 43.8481 6.36092Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />

      <path
        d="M23.957 26.0417L31.2487 18.75"
        stroke={color}
        strokeWidth={strokeWidth}
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