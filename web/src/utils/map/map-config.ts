// 地图配置文件
// 统一管理地图相关的配置项和API密钥

export interface MapConfig {
  // 高德地图配置
  amap: {
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

// 注意：逆地理编码现在通过后端代理接口实现，API key安全存储在服务端
