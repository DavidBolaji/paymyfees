import * as React from "react";

type BarChartIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const BarChartIcon = ({
  size = 50,
  color = "currentColor",
  strokeWidth = 2.5,
  className,
  ...props
}: BarChartIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size} // square icon
      viewBox="0 0 50 50"
      fill="none"
      stroke={color}
      className={className}
      {...props}
    >
      {/* Base line */}
      <path
        d="M6.25 45.834H43.75"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* First bar */}
      <path
        d="M11.6666 17.457H8.33333C7.1875 17.457 6.25 18.3945 6.25 19.5404V37.4987C6.25 38.6445 7.1875 39.582 8.33333 39.582H11.6666C12.8124 39.582 13.7499 38.6445 13.7499 37.4987V19.5404C13.7499 18.3945 12.8124 17.457 11.6666 17.457Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Second bar */}
      <path
        d="M26.6666 10.8125H23.3333C22.1875 10.8125 21.25 11.75 21.25 12.8958V37.5C21.25 38.6458 22.1875 39.5833 23.3333 39.5833H26.6666C27.8124 39.5833 28.7499 38.6458 28.7499 37.5V12.8958C28.7499 11.75 27.8124 10.8125 26.6666 10.8125Z"
        strokeWidth={strokeWidth - 1} // slightly thinner like original
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Third bar */}
      <path
        d="M41.6666 4.16602H38.3333C37.1875 4.16602 36.25 5.10352 36.25 6.24935V37.4994C36.25 38.6452 37.1875 39.5827 38.3333 39.5827H41.6666C42.8124 39.5827 43.7499 38.6452 43.7499 37.4994V6.24935C43.7499 5.10352 42.8124 4.16602 41.6666 4.16602Z"
        strokeWidth={strokeWidth - 1} // slightly thinner like original
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
