import { DivIcon, LatLng } from "leaflet";
import { MapPinIcon } from "lucide-react";
import { useEffect, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { getMapConfigManager } from "@/utils/map/map-config-manager";

const markerIcon = new DivIcon({
  className: "relative border-none",
  html: ReactDOMServer.renderToString(<MapPinIcon className="absolute bottom-1/2 -left-1/2" fill="pink" size={24} />),
});

interface MarkerProps {
  position: LatLng | undefined;
  onChange: (position: LatLng) => void;
  readonly?: boolean;
}

const LocationMarker = (props: MarkerProps) => {
  // 获取地图策略
  const strategy = getMapConfigManager().getStrategy();

  // 内部状态统一使用 WGS84 坐标系，只在显示时根据策略转换
  const [position, setPosition] = useState<LatLng | undefined>(props.position);

  const map = useMapEvents({
    click(e) {
      if (props.readonly) {
        return;
      }

      // 【转换边界】根据地图策略转换点击坐标为标准坐标
      const clickCoords = e.latlng;
      const [wgsLng, wgsLat] = strategy.transformFromMap(clickCoords.lng, clickCoords.lat);
      const wgsPosition = new LatLng(wgsLat, wgsLng);

      // 内部状态和对外传递都使用 WGS84
      setPosition(wgsPosition);
      map.locate();
      props.onChange(wgsPosition);
    },
    locationfound() {},
  });

  useEffect(() => {
    map.attributionControl.setPrefix("");
    map.locate();
  }, [map]);

  // props.position 传入的已经是 WGS84，直接使用
  useEffect(() => {
    setPosition(props.position);
  }, [props.position]);

  // 【转换边界】根据地图策略转换为显示坐标
  const displayPosition = position
    ? (() => {
        const [displayLng, displayLat] = strategy.transformForDisplay(position.lng, position.lat);
        return new LatLng(displayLat, displayLng);
      })()
    : undefined;

  return displayPosition === undefined ? null : <Marker position={displayPosition} icon={markerIcon}></Marker>;
};

interface MapProps {
  readonly?: boolean;
  latlng?: LatLng;
  onChange?: (position: LatLng) => void;
}

const LeafletMap = (props: MapProps) => {
  // 获取当前地图配置和策略
  const configManager = getMapConfigManager();
  const config = configManager.getConfig();
  const strategy = configManager.getStrategy();

  // 默认中心点坐标（从配置获取，WGS84坐标系）
  const defaultCenter = new LatLng(config.center.latitude, config.center.longitude);
  const position = props.latlng || defaultCenter;

  // 【转换边界】根据地图策略转换中心点为显示坐标
  const [displayLng, displayLat] = strategy.transformForDisplay(position.lng, position.lat);
  const mapCenter = new LatLng(displayLat, displayLng);

  // 获取瓦片配置
  const tileConfig = strategy.getTileConfig();

  return (
    <MapContainer className="w-full h-72" center={mapCenter} zoom={config.zoom} scrollWheelZoom={false}>
      <TileLayer
        url={tileConfig.url}
        subdomains={tileConfig.subdomains}
        minZoom={tileConfig.minZoom}
        maxZoom={tileConfig.maxZoom}
        attribution={tileConfig.attribution}
      />
      {/* 传递 WGS84 坐标给 LocationMarker */}
      <LocationMarker position={position} readonly={props.readonly} onChange={props.onChange ? props.onChange : () => {}} />
    </MapContainer>
  );
};

export default LeafletMap;
