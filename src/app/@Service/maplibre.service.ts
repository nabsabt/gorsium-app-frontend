import { Injectable } from '@angular/core';
import { GeolocateControl, Map, Marker } from 'maplibre-gl';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class MaplibreService {
  constructor(private snackBar: MatSnackBar) {}

  private geolocate = new GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserLocation: true,
    showAccuracyCircle: true,
  });

  private polygons: Array<{ name: string; feature: any }> = [];

  public addGeoJSONLayer(
    map: Map,
    responseData: any,
    layerName: string,
    layerColor: string,
    sourceName: string,
    isLayerVisible?: boolean
  ) {
    /**
     * add zones to polygons->
     */
    this.polygons.push({ name: layerName, feature: responseData.features[0] });

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
        /*  'text-color': `${layerColor}`, */
        'text-color': 'black',
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

  public addGeolocate(map: Map) {
    map.addControl(this.geolocate);
  }
  public addGeolocateMarker(map: Map) {
    this.geolocate.on('geolocate', (e) => {
      const marker = new Marker({})
        .setLngLat([e.coords.longitude, e.coords.latitude])
        .addTo(map);

      const userLocation: any = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [e.coords.longitude, e.coords.latitude],
        },
      };

      this.polygons.forEach((polygon) => {
        const inside = booleanPointInPolygon(userLocation, polygon.feature);
        if (inside) {
          this.snackBar.open(`You are inside of ${polygon.name}`, '', {
            duration: 5000,
            panelClass: ['notification-snackbar'],
          });
        }
      });
    });
  }
  public triggerGeolocate(map: Map) {
    //map.resize();
    this.geolocate.trigger();
  }
}
