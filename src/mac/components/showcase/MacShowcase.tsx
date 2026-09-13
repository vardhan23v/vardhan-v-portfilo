import { useLayoutEffect, useRef, useState } from "react";
import StackSpread from "../../../components/ui/stack-spread";

export function MacShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [vh, setVh] = useState<number>(0);

  useLayoutEffect(() => {
    const scroller = ref.current?.closest(".mac-content") as HTMLElement | null;
    if (!scroller) return;
    const update = () => setVh(scroller.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(scroller);
    window.addEventListener("resize", update);
    document.addEventListener("readystatechange", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      document.removeEventListener("readystatechange", update);
    };
  }, []);

  return (
    <div ref={ref} className="mac-showcase">
      <StackSpread scrollLength={280} bgColor="#ececeb" stickyHeight={vh} />
    </div>
  );
}