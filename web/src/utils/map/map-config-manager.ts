// 地图配置管理器
// 基于API动态获取地图策略
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
  private initialized: boolean = false;

  constructor() {
    // 先使用默认策略，等待异步初始化
    this.strategy = new OpenStreetMapStrategy();
    this.config = {
      center: {
        latitude: 31.2304, // 上海（WGS84）
        longitude: 121.4737,
      },
      zoom: 13,
    };

    // 异步初始化地图配置
    this.initializeMapConfig();
  }

  private async initializeMapConfig() {
    try {
      const response = await fetch("/api/v1/workspace/settings/MAP_RELATED");
      const setting = await response.json();

      let mapProvider = "amap"; // 默认值
      if (setting.mapRelatedSetting?.mapProvider) {
        // 将枚举值转换为字符串
        const providerEnum = setting.mapRelatedSetting.mapProvider;
        if (providerEnum === 1) {
          // AMAP
          mapProvider = "amap";
        } else if (providerEnum === 2) {
          // OSM
          mapProvider = "openstreetmap";
        }
      }

      this.strategy = this.createStrategy(mapProvider);
      this.initialized = true;

      console.log(`Map config initialized with provider: ${mapProvider}`);
    } catch (error) {
      console.warn("Failed to fetch map config from API, using default Amap:", error);
      // 回退到默认值
      this.strategy = this.createStrategy("amap");
      this.initialized = true;
    }
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

  async getStrategy(): Promise<MapStrategy> {
    // 等待初始化完成
    await this.waitForInitialization();
    return this.strategy;
  }

  getConfig(): MapConfig {
    return this.config;
  }

  private async waitForInitialization(): Promise<void> {
    // 如果已经初始化，直接返回
    if (this.initialized) {
      return;
    }

    // 等待初始化完成
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.initialized) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50); // 每50ms检查一次
    });
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
