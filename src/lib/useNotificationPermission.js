import { useEffect, useState } from "react";

export function useNotificationPermission() {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return "unsupported";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const sendTestNotification = () => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    new Notification("Naomi", {
      body: "This is what your reminders will look like.",
      icon: "/icons/icon-192.png",
    });
  };

  return { permission, requestPermission, sendTestNotification };
}