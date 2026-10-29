import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Live IST clock, updates every 30s. Returns "14:32 IST". */
export function useIstTime(withSuffix = true) {
  const [t, setT] = useState("--:--");
  useEffect(() => {
    const tick = () => {
      try {
        setT(fmt.format(new Date()));
      } catch {
        const d = new Date();
        setT(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
      }
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return withSuffix ? `${t} IST` : t;
}
