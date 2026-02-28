import * as React from "react";

type BuildingIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const BuildingIcon = ({
  size = 40,
  color = "currentColor",
  strokeWidth = 2,
  className,
  ...props
}: BuildingIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={(size * 41) / 40} // preserves original aspect ratio
      viewBox="0 0 40 41"
      fill="none"
      className={className}
      {...props}
    >
      <path
        d="M20 12.4138L30.6667 17.931V40H9.33333V17.931L20 12.4138ZM20 12.4138V0M0 40H40M4 40V23.4483H9.33333M36 40V23.4483H30.6667M17.3333 40V31.7241H22.6667V40M20 1.37931H28V6.89655H20M20 26.2069C19.2928 26.2069 18.6145 25.9163 18.1144 25.3989C17.6143 24.8816 17.3333 24.1799 17.3333 23.4483C17.3333 22.7166 17.6143 22.015 18.1144 21.4976C18.6145 20.9803 19.2928 20.6897 20 20.6897C20.7072 20.6897 21.3855 20.9803 21.8856 21.4976C22.3857 22.015 22.6667 22.7166 22.6667 23.4483C22.6667 24.1799 22.3857 24.8816 21.8856 25.3989C21.3855 25.9163 20.7072 26.2069 20 26.2069Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};