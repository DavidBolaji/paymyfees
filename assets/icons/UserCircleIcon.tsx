import * as React from "react";

type UserCircleIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const UserCircleIcon = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.5,
  className,
  ...props
}: UserCircleIconProps) => {
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
      {/* User head */}
      <path
        d="M12.1187 12.7805C12.0487 12.7705 11.9587 12.7705 11.8787 12.7805C10.1187 12.7205 8.71875 11.2805 8.71875 9.51047C8.71875 7.70047 10.1787 6.23047 11.9987 6.23047C13.8087 6.23047 15.2787 7.70047 15.2787 9.51047C15.2687 11.2805 13.8787 12.7205 12.1187 12.7805Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* User shoulders/body */}
      <path
        d="M18.7417 19.3796C16.9617 21.0096 14.6017 21.9996 12.0017 21.9996C9.40172 21.9996 7.04172 21.0096 5.26172 19.3796C5.36172 18.4396 5.96172 17.5196 7.03172 16.7996C9.77172 14.9796 14.2517 14.9796 16.9717 16.7996C18.0417 17.5196 18.6417 18.4396 18.7417 19.3796Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Outer circle */}
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};