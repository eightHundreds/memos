import { Button, Card, CardContent, IconButton, Typography } from "@mui/joy";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // 阻止默认的浏览器安装提示
      e.preventDefault();
      // 保存事件以便稍后使用
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      console.log("PWA 已安装");
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // 显示安装提示
    deferredPrompt.prompt();

    // 等待用户响应
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("用户同意安装PWA");
    } else {
      console.log("用户拒绝安装PWA");
    }

    // 清理
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // 暂时隐藏提示，但保留deferredPrompt以便用户稍后可以安装
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <Card variant="soft" color="primary" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm shadow-lg">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex-shrink-0">
          <Download className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <Typography level="title-sm" className="font-medium">
            安装 Memos 应用
          </Typography>
          <Typography level="body-sm" className="text-gray-600 dark:text-gray-300">
            安装到桌面，获得更好的使用体验
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="solid" onClick={handleInstallClick} className="flex-shrink-0">
            安装
          </Button>
          <IconButton size="sm" variant="plain" onClick={handleDismiss} className="flex-shrink-0">
            <X className="h-4 w-4" />
          </IconButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
