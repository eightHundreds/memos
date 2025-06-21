import { Button, Input } from "@usememos/mui";
import { LatLng } from "leaflet";
import { MapPinIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LeafletMap from "@/components/LeafletMap";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Location } from "@/types/proto/api/v1/memo_service";
import { useTranslate } from "@/utils/i18n";
import { getMapConfigManager } from "@/utils/map/map-config-manager";

interface Props {
  location?: Location;
  onChange: (location?: Location) => void;
}

interface State {
  initialized: boolean;
  placeholder: string;
  position?: LatLng;
}

const LocationSelector = (props: Props) => {
  const t = useTranslate();
  const [state, setState] = useState<State>({
    initialized: false,
    placeholder: props.location?.placeholder || "",
    position: props.location ? new LatLng(props.location.latitude, props.location.longitude) : undefined,
  });
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  useEffect(() => {
    setState((state) => ({
      ...state,
      placeholder: props.location?.placeholder || "",
      position: new LatLng(props.location?.latitude || 0, props.location?.longitude || 0),
    }));
  }, [props.location]);

  useEffect(() => {
    if (popoverOpen && !props.location) {
      const handleError = (error: any, errorMessage: string) => {
        setState({ ...state, initialized: true });
        toast.error(errorMessage);
        console.error(error);
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude; // WGS84 坐标
            const lng = position.coords.longitude; // WGS84 坐标
            const newPosition = new LatLng(lat, lng);

            // 浏览器返回的是WGS84坐标，直接使用，【无需转换】
            setState((prevState) => ({
              ...prevState,
              position: newPosition,
              initialized: true,
              placeholder: "", // 清空placeholder，准备获取新的地址
            }));

            // 获取地址信息
            setTimeout(() => {
              fetchReverseGeocoding(newPosition);
            }, 100);
          },
          (error) => {
            handleError(error, "Failed to get current position");
          },
        );
      } else {
        handleError("Geolocation is not supported by this browser.", "Geolocation is not supported by this browser.");
      }
    }
  }, [popoverOpen]);

  // 【转换边界】分离地理编码逻辑，只在用户新选择位置时触发
  const fetchReverseGeocoding = async (position: LatLng) => {
    try {
      // 使用当前地图策略进行逆地理编码
      const strategy = getMapConfigManager().getStrategy();
      const result = await strategy.reverseGeocode(position.lng, position.lat);

      if (result.success && result.address) {
        setState((prevState) => ({ ...prevState, placeholder: result.address }));
      } else {
        // 如果地理编码失败，可以显示一个默认提示
        console.warn("逆地理编码未返回有效地址");
      }
    } catch (error) {
      toast.error("获取地址信息失败");
      console.error("逆地理编码失败:", error);
    }
  };

  // 只在用户通过地图选择位置时触发地理编码
  const onPositionChanged = (position: LatLng) => {
    // position 参数已经是 WGS84 格式，直接存储
    setState((prevState) => ({ ...prevState, position, placeholder: "" }));
    fetchReverseGeocoding(position);
  };

  const removeLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    props.onChange(undefined);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button className="flex items-center justify-center p-0" size="sm" variant="plain">
          <MapPinIcon className="w-5 h-5 mx-auto shrink-0" />
          {props.location && (
            <>
              <span className="ml-0.5 text-sm text-ellipsis whitespace-nowrap overflow-hidden max-w-32">{props.location.placeholder}</span>
              <XIcon className="w-5 h-5 mx-auto shrink-0 hidden group-hover:block opacity-60 hover:opacity-80" onClick={removeLocation} />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center">
        <div className="min-w-80 sm:w-128 flex flex-col justify-start items-start">
          <LeafletMap key={JSON.stringify(state.initialized)} latlng={state.position} onChange={onPositionChanged} />
          <div className="mt-2 w-full flex flex-row justify-between items-center gap-2">
            <div className="flex flex-row items-center justify-start gap-2">
              <Input
                placeholder="Choose a position first."
                value={state.placeholder}
                size="sm"
                startDecorator={
                  state.position && (
                    <span className="text-xs opacity-60">
                      [{state.position.lat.toFixed(2)}, {state.position.lng.toFixed(2)}]
                    </span>
                  )
                }
                disabled={!state.position}
                onChange={(e) => setState((state) => ({ ...state, placeholder: e.target.value }))}
              />
            </div>
            <Button
              className="shrink-0"
              color="primary"
              size="sm"
              onClick={() => {
                // 提交时传递 WGS84 坐标给父组件，用于存储
                props.onChange(
                  Location.fromPartial({
                    placeholder: state.placeholder,
                    latitude: state.position?.lat,
                    longitude: state.position?.lng,
                  }),
                );
                setPopoverOpen(false);
              }}
              disabled={!state.position || state.placeholder.length === 0}
            >
              {t("common.confirm")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LocationSelector;
