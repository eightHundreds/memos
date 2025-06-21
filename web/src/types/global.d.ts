// 全局配置类型定义
declare global {
  interface Window {
    __MEMOS_CONFIG__?: {
      mapProvider?: string;
    };
  }
}

export {};