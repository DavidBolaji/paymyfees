import * as React from "react";

type SearchGlobeIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const GlobalSearchIcon = ({
  size = 50,
  color = "currentColor",
  strokeWidth = 2.5,
  className,
  ...props
}: SearchGlobeIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      stroke={color}
      className={className}
      {...props}
    >
      <path
        d="M45.8327 25.0013C45.8327 13.4954 36.5052 4.16797 24.9994 4.16797C13.4934 4.16797 4.16602 13.4954 4.16602 25.0013C4.16602 36.5071 13.4934 45.8346 24.9994 45.8346"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M41.6673 11.8742C39.72 12.0146 37.2259 12.7685 35.4963 15.0071C32.3725 19.0505 29.2486 19.3879 27.1661 18.0401C24.0421 16.0184 26.6673 12.7437 23.0009 10.9641C20.6113 9.80426 20.2782 6.64807 21.6081 4.16797"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M4.16602 22.918C5.75456 24.2973 7.97947 25.5601 10.6009 25.5601C16.0169 25.5601 17.1001 26.5948 17.1001 30.7342C17.1001 34.8736 17.1001 34.8736 18.1833 37.978C18.8879 39.9973 19.1342 42.0167 17.7298 43.7513"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M41.4565 41.517L45.834 45.832M43.9763 35.511C43.9763 40.1664 40.1948 43.9402 35.53 43.9402C30.8654 43.9402 27.084 40.1664 27.084 35.511C27.084 30.8558 30.8654 27.082 35.53 27.082C40.1948 27.082 43.9763 30.8558 43.9763 35.511Z"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
};
