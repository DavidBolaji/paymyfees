import * as React from "react";

type LinkSwapIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const LinkSwapIcon = ({
  size = 45,
  color = "currentColor",
  strokeWidth = 2.5,
  className,
  ...props
}: LinkSwapIconProps) => {
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
        d="M17.8555 27.0674L27.0675 17.8555"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Top-right plus */}
      <path
        d="M39.4043 30.0156H35.6472M30.0117 39.4101V35.6524"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom-left plus */}
      <path
        d="M5.59375 14.9843H9.35074M14.9862 5.58984V9.34764"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Top-right link */}
      <path
        d="M28.3251 23.5683C30.4626 24.955 32.654 24.5851 34.2558 22.9829L39.8701 17.3673C41.7042 15.5329 41.7042 12.5588 39.8701 10.7244L34.2726 5.12579C32.4387 3.2914 29.4651 3.2914 27.6312 5.12579L22.0167 10.7415C20.701 12.0575 19.9413 14.5588 21.4973 16.7083"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom-left link */}
      <path
        d="M23.568 28.3306C24.9544 30.4686 24.5845 32.6603 22.9829 34.2625L17.3683 39.8781C15.5343 41.7124 12.5608 41.7124 10.7268 39.8781L5.1294 34.2794C3.29541 32.4451 3.29541 29.4709 5.1294 27.6366L10.7439 22.021C12.0596 20.7049 14.5604 19.945 16.7094 21.5014"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
