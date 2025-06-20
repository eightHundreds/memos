import "@github/relative-time-element";
import { CssVarsProvider } from "@mui/joy";
import { observer } from "mobx-react-lite";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import "./i18n";
import router from "./router";
import { initialUserStore } from "./store/v2/user";
import { initialWorkspaceStore } from "./store/v2/workspace";
import "./style.css";
import theme from "./theme";
import "@usememos/mui/dist/index.css";
import "leaflet/dist/leaflet.css";

const Main = observer(() => (
  <CssVarsProvider theme={theme}>
    <RouterProvider router={router} />
    <Toaster position="top-right" toastOptions={{ className: "dark:bg-zinc-700 dark:text-gray-300" }} />
  </CssVarsProvider>
));

(async () => {
  await initialWorkspaceStore();
  await initialUserStore();

  const container = document.getElementById("root");
  const root = createRoot(container as HTMLElement);
  root.render(<Main />);

  // 注册PWA Service Worker（由vite-plugin-pwa自动处理）
  if ("serviceWorker" in navigator) {
    // vite-plugin-pwa会自动注入Service Worker注册代码
    console.log("PWA Service Worker 将由 vite-plugin-pwa 自动注册");
  }
})();
