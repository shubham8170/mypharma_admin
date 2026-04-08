import type { ReactNode } from "react";

type PageToolbarProps = {
  children?: ReactNode;
};

export function PageToolbar({ children }: PageToolbarProps) {
  return <div className="page-toolbar">{children}</div>;
}
