// 地图配置文件
// 统一管理地图相关的配置项和API密钥

export interface MapConfig {
  // 高德地图配置
  amap: {
    key: string;
    webApiBase: string;
    tileUrl: string;
    subdomains: string[];
    attribution: string;
  };
  // 默认地图中心点（上海，WGS84坐标系）
  defaultCenter: {
    latitude: number;
    longitude: number;
  };
  // 地图显示配置
  display: {
    defaultZoom: number;
    minZoom: number;
    maxZoom: number;
  };
}

// 地图配置
export const MAP_CONFIG: MapConfig = {
  amap: {
    // 注意：实际部署时需要申请高德地图API key并设置环境变量
    key: import.meta.env.VITE_AMAP_KEY || "YOUR_AMAP_KEY",
    webApiBase: "https://restapi.amap.com/v3",
    tileUrl: "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    subdomains: ["1", "2", "3", "4"],
    attribution: "&copy; 高德地图",
  },
  defaultCenter: {
    latitude: 31.2304, // 上海纬度（WGS84）
    longitude: 121.4737, // 上海经度（WGS84）
  },
  display: {
    defaultZoom: 13,
    minZoom: 1,
    maxZoom: 19,
  },
};

// 构建高德地图逆地理编码API URL
export const buildAmapReverseGeocodingUrl = (longitude: number, latitude: number): string => {
  const { webApiBase, key } = MAP_CONFIG.amap;
  return `${webApiBase}/geocode/regeo?location=${longitude},${latitude}&output=json&key=${key}`;
};

// 构建备用逆地理编码API URL（OpenStreetMap）
export const buildOsmReverseGeocodingUrl = (longitude: number, latitude: number): string => {
  return `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=zh-CN`;
};
