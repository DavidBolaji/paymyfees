import * as React from "react";

type LogoutIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const LogoutIcon = ({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.5,
  className,
  ...props
}: LogoutIconProps) => {
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
        d="M8.89844 7.55828C9.20844 3.95828 11.0584 2.48828 15.1084 2.48828H15.2384C19.7084 2.48828 21.4984 4.27828 21.4984 8.74828V15.2683C21.4984 19.7383 19.7084 21.5283 15.2384 21.5283H15.1084C11.0884 21.5283 9.23844 20.0783 8.90844 16.5383"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12H14.88"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6484 8.64844L15.9984 11.9984L12.6484 15.3484"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
