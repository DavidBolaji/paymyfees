import * as React from "react";

type EditSquareIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const EditSquareIcon = ({
  size = 45,
  color = "currentColor",
  strokeWidth = 2.5,
  className,
  ...props
}: EditSquareIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 45 45"
      fill="none"
      stroke={color}
      className={className}
      {...props}
    >
      <path
        d="M30.7967 8.63454L32.6529 6.77831C34.1908 5.24056 36.684 5.24056 38.2217 6.77831C39.7594 8.31607 39.7594 10.8092 38.2217 12.347L36.3654 14.2032M30.7967 8.63454L18.3105 21.1207C17.3589 22.0725 16.6838 23.2646 16.3574 24.5702L15 30L20.4298 28.6425C21.7354 28.3162 22.9275 27.6411 23.8793 26.6895L36.3654 14.2032M30.7967 8.63454L36.3654 14.2032"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M35.6248 25.3125C35.6248 31.4766 35.6248 34.5585 33.9225 36.633C33.6109 37.0127 33.2627 37.3609 32.8828 37.6725C30.8085 39.375 27.7264 39.375 21.5623 39.375H20.625C13.5539 39.375 10.0184 39.375 7.82173 37.1782C5.62506 34.9817 5.625 31.446 5.625 24.375V23.4375C5.625 17.2735 5.625 14.1915 7.32739 12.1171C7.63907 11.7373 7.98731 11.3891 8.36707 11.0774C10.4415 9.375 13.5235 9.375 19.6875 9.375"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
