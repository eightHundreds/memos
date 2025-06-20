import { Button, Card, CardContent, Chip, Divider, Typography } from "@mui/joy";
import { CheckCircle, Download, Smartphone, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface PWAStatusProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const PWAStatus = ({ isVisible = false, onClose }: PWAStatusProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 检查是否已安装为PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
    }

    // 检查是否通过添加到主屏幕安装
    if (window.navigator && "standalone" in window.navigator) {
      setIsInstalled((window.navigator as any).standalone);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="fixed top-4 right-4 w-80 z-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Typography level="title-md" className="font-medium">
            PWA 状态
          </Typography>
          {onClose && (
            <Button size="sm" variant="plain" onClick={onClose}>
              ×
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {/* 网络状态 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
              <Typography level="body-sm">网络连接</Typography>
            </div>
            <Chip size="sm" color={isOnline ? "success" : "danger"} variant="soft">
              {isOnline ? "在线" : "离线"}
            </Chip>
          </div>

          {/* 安装状态 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <Typography level="body-sm">应用安装</Typography>
            </div>
            <Chip size="sm" color={isStandalone || isInstalled ? "success" : "neutral"} variant="soft">
              {isStandalone || isInstalled ? "已安装" : "未安装"}
            </Chip>
          </div>

          {/* Service Worker状态 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <Typography level="body-sm">离线缓存</Typography>
            </div>
            <Chip size="sm" color="success" variant="soft">
              已启用
            </Chip>
          </div>

          <Divider />

          <div className="space-y-2">
            <Typography level="body-xs" className="text-gray-600 dark:text-gray-300">
              PWA 功能说明：
            </Typography>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
              <li>• 🚀 快速加载：缓存资源以获得更快的加载速度</li>
              <li>• 📱 安装到桌面：像原生应用一样使用</li>
              <li>• 🌐 离线访问：在没有网络时也能查看已缓存的内容</li>
              <li>• 🔄 自动更新：后台自动下载新版本</li>
            </ul>
          </div>

          {!isStandalone && !isInstalled && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-blue-600" />
                <Typography level="body-sm" className="font-medium text-blue-600">
                  安装应用
                </Typography>
              </div>
              <Typography level="body-xs" className="text-blue-600">
                在支持的浏览器中，点击地址栏的安装图标或使用浏览器菜单中的"添加到主屏幕"选项
              </Typography>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAStatus;
