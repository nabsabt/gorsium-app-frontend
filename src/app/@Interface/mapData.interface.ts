export interface GEOJSONMapData {
  name: string;
  geojson: JSON | object;
  color: string;
  group: string;
}

export interface UserSettings {
  layerVisibility: {
    layers: Array<{ layerName: string; isVisible: boolean }>;
  };
}
