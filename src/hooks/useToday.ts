import { useEffect, useState } from "react";
import { localDate } from "../utils/dates";
import { millisecondsToMidnight } from "../utils/dailyTasks";
export function useToday() {
  const [today, setToday] = useState(localDate);
  useEffect(() => {
    let midnight: ReturnType<typeof setTimeout>;
    const update = () => {
      setToday(localDate());
      clearTimeout(midnight);
      midnight = setTimeout(update, millisecondsToMidnight() + 10);
    };
    update();
    const safety = setInterval(() => {
      if (document.visibilityState === "visible") setToday(localDate());
    }, 30000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearTimeout(midnight);
      clearInterval(safety);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return today;
}
