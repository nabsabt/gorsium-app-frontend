import { Injectable } from '@angular/core';
import { Map } from 'maplibre-gl';

@Injectable()
export class MaplibreService {
  constructor() {}

  public addGeoJSONLayer(
    map: Map,
    responseData: any,
    layerName: string,
    layerColor: string,
    sourceName: string,
    isLayerVisible?: boolean
  ) {
    map.getLayer(layerName) ? map.removeLayer(layerName) : '';
    map.getLayer(`${layerName}-label`)
      ? map.removeLayer(`${layerName}-label`)
      : '';

    map.getSource(sourceName) ? map.removeSource(sourceName) : '';

    map.addSource(sourceName, {
      type: 'geojson',
      data: responseData,
    });

    map.addLayer({
      id: layerName,
      source: sourceName,
      type: 'fill',
      paint: {
        'fill-color': `${layerColor}`,
        'fill-opacity': 0.4,
        'fill-outline-color': `black`,
      },
    });

    map.addLayer({
      id: `${layerName}-label`,
      source: sourceName,
      type: 'symbol',
      layout: {
        'text-field': ['get', 'label_name'],
        'text-size': 14,
        'text-justify': 'auto',
        'text-anchor': 'center',
      },
      paint: {
        'text-color': `${layerColor}`,
      },
    });

    if (!isLayerVisible) {
      map.setLayoutProperty(layerName, 'visibility', 'none');
      map.setLayoutProperty(`${layerName}-label`, 'visibility', 'none');
    }
  }

  public toggleLayer(map: Map, layername: string, isVisible: boolean) {
    if (isVisible) {
      map.setLayoutProperty(layername, 'visibility', 'visible');
      map.setLayoutProperty(`${layername}-label`, 'visibility', 'visible');
    } else {
      map.setLayoutProperty(layername, 'visibility', 'none');
      map.setLayoutProperty(`${layername}-label`, 'visibility', 'none');
    }
  }
}
