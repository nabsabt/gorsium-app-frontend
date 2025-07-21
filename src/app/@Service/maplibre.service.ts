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
    sourceName: string
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
  }
}
