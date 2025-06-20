import { Alert, Typography } from "@mui/joy";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <Alert
      color="warning"
      variant="soft"
      className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm flex items-center gap-2"
      startDecorator={<WifiOff className="h-4 w-4" />}
    >
      <Typography level="body-sm">你当前处于离线状态，部分功能可能无法使用</Typography>
    </Alert>
  );
};

export default NetworkStatus;
