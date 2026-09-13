import type { ReactNode } from "react";
import { useTilt } from "../../../hooks/useTilt";

/** 3D tilt wrapper — feeds --rx/--ry to [target]. Keeps the target as the
 *  grid/flex child (wrapper is inside the revealed cell). */
export function Tilt({
  target,
  maxDeg = 6,
  children,
}: {
  target: string;
  maxDeg?: number;
  children: ReactNode;
}) {
  const ref = useTilt<HTMLDivElement>(maxDeg, target);
  return <div ref={ref}>{children}</div>;
}