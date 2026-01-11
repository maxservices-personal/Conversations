import { useState, useEffect } from "react";

// Custom hook to get current date and time
export function useCurrentTime({ utc = false } = {}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

  const getTime = () => {
    const date = currentTime;
    if (utc) {
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes().toString().padStart(2, "0");
      const seconds = date.getUTCSeconds().toString().padStart(2, "0");
      return `${hours}:${minutes}:${seconds} UTC`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  const getDate = () => {
    const date = currentTime;
    if (utc) {
      const year = date.getUTCFullYear();
      const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
      const day = date.getUTCDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return { getTime, getDate };
}
