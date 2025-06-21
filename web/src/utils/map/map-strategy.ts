// 地图策略模式实现
// 支持多种地图服务提供商，统一接口，可配置切换
import { gcj02towgs84, wgs84togcj02 } from "./coordinate";

// 地图配置接口
export interface MapTileConfig {
  url: string;
  subdomains?: string[];
  minZoom: number;
  maxZoom: number;
  attribution: string;
}

// 地理编码结果接口
export interface GeocodeResult {
  address: string;
  success: boolean;
}

// 地图策略接口
export interface MapStrategy {
  readonly name: string;
  readonly displayName: string;

  // 获取瓦片配置
  getTileConfig(): MapTileConfig;

  // 坐标转换：输入坐标 → 地图显示坐标
  transformForDisplay(lng: number, lat: number): [number, number];

  // 坐标转换：地图点击坐标 → 标准坐标
  transformFromMap(lng: number, lat: number): [number, number];

  // 逆地理编码
  reverseGeocode(lng: number, lat: number): Promise<GeocodeResult>;
}

// OpenStreetMap 策略
export class OpenStreetMapStrategy implements MapStrategy {
  readonly name = "openstreetmap";
  readonly displayName = "OpenStreetMap";

  getTileConfig(): MapTileConfig {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c"],
      minZoom: 1,
      maxZoom: 19,
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    };
  }

  transformForDisplay(lng: number, lat: number): [number, number] {
    // OpenStreetMap 使用 WGS84，无需转换
    return [lng, lat];
  }

  transformFromMap(lng: number, lat: number): [number, number] {
    // OpenStreetMap 使用 WGS84，无需转换
    return [lng, lat];
  }

  async reverseGeocode(lng: number, lat: number): Promise<GeocodeResult> {
    try {
      // OpenStreetMap 使用 WGS84 坐标直接查询
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh-CN`);
      const data = await response.json();

      if (data && data.display_name) {
        return {
          address: data.display_name,
          success: true,
        };
      }

      return { address: "", success: false };
    } catch (error) {
      console.error("OpenStreetMap 逆地理编码失败:", error);
      return { address: "", success: false };
    }
  }
}

// 高德地图策略
export class AmapStrategy implements MapStrategy {
  readonly name = "amap";
  readonly displayName = "高德地图";

  constructor() {
    // 不再需要API key，使用后端代理
  }

  getTileConfig(): MapTileConfig {
    return {
      url: "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      subdomains: ["1", "2", "3", "4"],
      minZoom: 1,
      maxZoom: 19,
      attribution: "&copy; 高德地图",
    };
  }

  transformForDisplay(lng: number, lat: number): [number, number] {
    // 高德地图使用 GCJ02，需要从 WGS84 转换
    return wgs84togcj02(lng, lat);
  }

  transformFromMap(lng: number, lat: number): [number, number] {
    // 高德地图点击返回 GCJ02，需要转换为 WGS84
    return gcj02towgs84(lng, lat);
  }

  async reverseGeocode(lng: number, lat: number): Promise<GeocodeResult> {
    try {
      // 使用后端代理接口进行逆地理编码
      const response = await fetch(`/api/v1/geocode/reverse?lng=${lng}&lat=${lat}`);
      const data = await response.json();

      return {
        address: data.address || "",
        success: data.success || false,
      };
    } catch (error) {
      console.error("地理编码失败:", error);
      return { address: "", success: false };
    }
  }
}

// 地图策略工厂
export class MapStrategyFactory {
  private static strategies = new Map<string, () => MapStrategy>();

  static register(name: string, factory: () => MapStrategy) {
    this.strategies.set(name, factory);
  }

  static create(name: string): MapStrategy {
    const factory = this.strategies.get(name);
    if (!factory) {
      throw new Error(`Unknown map strategy: ${name}`);
    }
    return factory();
  }

  static getAvailableStrategies(): Array<{ name: string; displayName: string }> {
    const strategies: Array<{ name: string; displayName: string }> = [];
    for (const [, factory] of this.strategies) {
      const strategy = factory();
      strategies.push({
        name: strategy.name,
        displayName: strategy.displayName,
      });
    }
    return strategies;
  }
}

// 注册默认策略
MapStrategyFactory.register("openstreetmap", () => new OpenStreetMapStrategy());
MapStrategyFactory.register("amap", () => new AmapStrategy());

// 默认策略配置
export const DEFAULT_MAP_STRATEGY = "amap"; // 默认使用高德地图
export const FALLBACK_MAP_STRATEGY = "openstreetmap"; // 备用策略
