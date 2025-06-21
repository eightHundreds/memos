package v1

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/labstack/echo/v4"
)

// GeocodeResponse 地理编码响应结构
type GeocodeResponse struct {
	Address string `json:"address"`
	Success bool   `json:"success"`
}

// AmapGeocodeResponse 高德地图逆地理编码API响应结构
type AmapGeocodeResponse struct {
	Status   string `json:"status"`
	Regeocode struct {
		FormattedAddress string `json:"formatted_address"`
	} `json:"regeocode"`
}

// OSMGeocodeResponse OpenStreetMap逆地理编码API响应结构
type OSMGeocodeResponse struct {
	DisplayName string `json:"display_name"`
}

// ReverseGeocode 逆地理编码接口
func (s *APIV1Service) ReverseGeocode(c echo.Context) error {
	// 获取坐标参数
	lngStr := c.QueryParam("lng")
	latStr := c.QueryParam("lat")
	
	if lngStr == "" || latStr == "" {
		return c.JSON(http.StatusBadRequest, GeocodeResponse{
			Address: "",
			Success: false,
		})
	}

	lng, err := strconv.ParseFloat(lngStr, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, GeocodeResponse{
			Address: "",
			Success: false,
		})
	}

	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, GeocodeResponse{
			Address: "",
			Success: false,
		})
	}

	// 获取地图提供商配置
	mapProvider := os.Getenv("MAP_PROVIDER")
	if mapProvider == "" {
		mapProvider = "amap"
	}

	var response GeocodeResponse

	switch mapProvider {
	case "amap":
		response = s.amapReverseGeocode(lng, lat)
	case "openstreetmap", "osm":
		response = s.osmReverseGeocode(lng, lat)
	default:
		// 默认使用OSM作为后备
		response = s.osmReverseGeocode(lng, lat)
	}

	return c.JSON(http.StatusOK, response)
}

// amapReverseGeocode 使用高德地图API进行逆地理编码
func (s *APIV1Service) amapReverseGeocode(lng, lat float64) GeocodeResponse {
	amapKey := os.Getenv("AMAP_KEY")
	if amapKey == "" {
		// 如果没有高德地图key，回退到OSM
		return s.osmReverseGeocode(lng, lat)
	}

	// 调用高德地图API
	url := fmt.Sprintf("https://restapi.amap.com/v3/geocode/regeo?location=%f,%f&output=json&key=%s", lng, lat, amapKey)
	
	resp, err := http.Get(url)
	if err != nil {
		// 出错时回退到OSM
		return s.osmReverseGeocode(lng, lat)
	}
	defer resp.Body.Close()

	var amapResp AmapGeocodeResponse
	if err := json.NewDecoder(resp.Body).Decode(&amapResp); err != nil {
		// 解析失败时回退到OSM
		return s.osmReverseGeocode(lng, lat)
	}

	if amapResp.Status == "1" && amapResp.Regeocode.FormattedAddress != "" {
		return GeocodeResponse{
			Address: amapResp.Regeocode.FormattedAddress,
			Success: true,
		}
	}

	// 高德API失败时回退到OSM
	return s.osmReverseGeocode(lng, lat)
}

// osmReverseGeocode 使用OpenStreetMap API进行逆地理编码
func (s *APIV1Service) osmReverseGeocode(lng, lat float64) GeocodeResponse {
	url := fmt.Sprintf("https://nominatim.openstreetmap.org/reverse?lat=%f&lon=%f&format=json&accept-language=zh-CN", lat, lng)
	
	resp, err := http.Get(url)
	if err != nil {
		return GeocodeResponse{
			Address: "",
			Success: false,
		}
	}
	defer resp.Body.Close()

	var osmResp OSMGeocodeResponse
	if err := json.NewDecoder(resp.Body).Decode(&osmResp); err != nil {
		return GeocodeResponse{
			Address: "",
			Success: false,
		}
	}

	if osmResp.DisplayName != "" {
		return GeocodeResponse{
			Address: osmResp.DisplayName,
			Success: true,
		}
	}

	return GeocodeResponse{
		Address: "",
		Success: false,
	}
}