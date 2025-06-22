import { Button, Input, Option, Select } from "@mui/joy";
import { isEqual } from "lodash-es";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { workspaceSettingNamePrefix } from "@/store/common";
import { workspaceStore } from "@/store/v2";
import { WorkspaceSettingKey } from "@/store/v2/workspace";
import { WorkspaceMapRelatedSetting_MapProvider } from "@/types/proto/api/v1/workspace_setting_service";
import { useTranslate } from "@/utils/i18n";

const MapConfigSection = observer(() => {
  const t = useTranslate();
  const [isRequesting, setIsRequesting] = useState(false);

  const originalSetting = workspaceStore.getWorkspaceSettingByKey(WorkspaceSettingKey.MAP_RELATED);

  const [mapSetting, setMapSetting] = useState({
    mapProvider: originalSetting?.mapRelatedSetting?.mapProvider || WorkspaceMapRelatedSetting_MapProvider.AMAP,
    amapApiKey: originalSetting?.mapRelatedSetting?.amapApiKey || "",
  });

  useEffect(() => {
    if (originalSetting?.mapRelatedSetting) {
      setMapSetting({
        mapProvider: originalSetting.mapRelatedSetting.mapProvider || WorkspaceMapRelatedSetting_MapProvider.AMAP,
        amapApiKey: originalSetting.mapRelatedSetting.amapApiKey || "",
      });
    }
  }, [originalSetting]);

  const handleUpdateSetting = async () => {
    if (isRequesting) {
      return;
    }

    setIsRequesting(true);
    try {
      await workspaceStore.upsertWorkspaceSetting({
        name: `${workspaceSettingNamePrefix}${WorkspaceSettingKey.MAP_RELATED}`,
        mapRelatedSetting: {
          mapProvider: mapSetting.mapProvider,
          amapApiKey: mapSetting.amapApiKey,
        },
      });
    } catch (error) {
      console.error("Failed to update map settings:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const isModified = !isEqual(mapSetting, {
    mapProvider: originalSetting?.mapRelatedSetting?.mapProvider || WorkspaceMapRelatedSetting_MapProvider.AMAP,
    amapApiKey: originalSetting?.mapRelatedSetting?.amapApiKey || "",
  });

  return (
    <div className="w-full flex flex-col gap-2 pt-2 pb-4">
      <p className="font-medium text-gray-700 dark:text-gray-300">{t("setting.map-config")}</p>
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex flex-row justify-between items-center">
          <span className="truncate">{t("setting.map-config-section.map-provider")}</span>
          <Select
            className="w-40"
            value={mapSetting.mapProvider}
            onChange={(_, value) => {
              if (value !== null) {
                setMapSetting((prev) => ({ ...prev, mapProvider: value }));
              }
            }}
          >
            <Option value={WorkspaceMapRelatedSetting_MapProvider.AMAP}>{t("setting.map-config-section.amap")}</Option>
            <Option value={WorkspaceMapRelatedSetting_MapProvider.OSM}>{t("setting.map-config-section.openstreetmap")}</Option>
          </Select>
        </div>

        {mapSetting.mapProvider === WorkspaceMapRelatedSetting_MapProvider.AMAP && (
          <div className="w-full flex flex-col gap-2">
            <div className="w-full flex flex-row justify-between items-center">
              <span className="truncate">{t("setting.map-config-section.amap-api-key")}</span>
            </div>
            <Input
              className="w-full"
              placeholder={t("setting.map-config-section.amap-api-key-placeholder")}
              value={mapSetting.amapApiKey}
              onChange={(e) => setMapSetting((prev) => ({ ...prev, amapApiKey: e.target.value }))}
              type="password"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("setting.map-config-section.amap-api-key-description")}</p>
          </div>
        )}

        <div className="w-full flex flex-row justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t("setting.map-config-section.description")}</span>
        </div>

        <div className="w-full flex flex-row justify-end">
          <Button disabled={!isModified || isRequesting} loading={isRequesting} onClick={handleUpdateSetting}>
            {t("common.save")}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default MapConfigSection;
