// hooks/useNotificationPermission.ts
import { useState, useEffect, useCallback } from "react";

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return { permission, supported, requestPermission };
}
