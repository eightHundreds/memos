// 地图配置管理器
// 基于环境变量在编译时确定地图策略
import { MapStrategy, OpenStreetMapStrategy, AmapStrategy } from "./map-strategy";

interface MapConfig {
  center: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
}

class MapConfigManager {
  private strategy: MapStrategy;
  private config: MapConfig;

  constructor() {
    // 基于运行时配置或环境变量确定地图策略
    // 尝试从全局配置或环境变量读取 provider
    const windowProvider = window.__MEMOS_CONFIG__?.mapProvider;
    const envProvider = import.meta.env.VITE_MAP_PROVIDER;

    function isValidProvider(p?: string): p is string {
      return !!p && !/\{\{.*\}\}/.test(p);
    }

    const mapProvider = (
      isValidProvider(windowProvider) ? windowProvider : isValidProvider(envProvider) ? envProvider : "openstreetmap"
    ).toLowerCase();

    this.strategy = this.createStrategy(mapProvider);
    this.config = {
      center: {
        latitude: 31.2304, // 上海（WGS84）
        longitude: 121.4737,
      },
      zoom: 13,
    };
  }

  private createStrategy(provider: string): MapStrategy {
    switch (provider.toLowerCase()) {
      case "openstreetmap":
        console.log("Using OpenStreetMap strategy");
        return new OpenStreetMapStrategy();

      case "amap":
        console.log("Using Amap strategy");
        return new AmapStrategy();

      default:
        console.warn(`Unknown map provider: ${provider}, falling back to OpenStreetMap`);
        return new OpenStreetMapStrategy();
    }
  }

  getStrategy(): MapStrategy {
    return this.strategy;
  }

  getConfig(): MapConfig {
    return this.config;
  }
}

// 单例实例
let configManagerInstance: MapConfigManager | null = null;

export function getMapConfigManager(): MapConfigManager {
  if (!configManagerInstance) {
    configManagerInstance = new MapConfigManager();
  }
  return configManagerInstance;
}
