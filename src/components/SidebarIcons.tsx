import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconSvg({ className, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(p: IconProps) {
  return (
    <IconSvg {...p}>
      <path
        d="M3 10.5 9 4.5 16 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 17h14V8.5L10 3 3 8.5V17Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </IconSvg>
  );
}

export function IconInventory(p: IconProps) {
  return (
    <IconSvg {...p}>
      <path
        d="M4.5 7.5 10 4l5.5 3.5V16a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V7.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M4.5 7.5 10 11l5.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconSvg>
  );
}

export function IconOrders(p: IconProps) {
  return (
    <IconSvg {...p}>
      <rect x="4" y="3.5" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconSvg>
  );
}

export function IconSuppliers(p: IconProps) {
  return (
    <IconSvg {...p}>
      <path
        d="M4 16.5V6.5L10 3.5l6 3v10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7.5 16.5v-5h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </IconSvg>
  );
}

export function IconCustomers(p: IconProps) {
  return (
    <IconSvg {...p}>
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.5 16.5c0-2.5 2-4.5 5.5-4.5s5.5 2 5.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </IconSvg>
  );
}

export function IconAnalytics(p: IconProps) {
  return (
    <IconSvg {...p}>
      <path d="M4 14V10M10 14V6M16 14v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 16.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </IconSvg>
  );
}

export function IconSettings({ className, ...rest }: IconProps) {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
    >
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
