import { Injectable } from '@angular/core';
import { GeolocateControl, Map, Marker, Popup } from 'maplibre-gl';
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
  private userMarker: Marker | null = null;
  private lastPolygonUserIsIn: string | null = null;

  private polygons: Array<{ name: string; feature: any }> = [];

  public addGeoJSONLayer(
    map: Map,
    responseData: any,
    layerName: string,
    layerGroup: string,
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
        'fill-opacity': layerGroup === 'zone' ? 0.4 : 1,
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

  public async addLocationMarkers(
    map: Map,
    dataSource: any,
    layerName: string,
    sourceName: string
  ) {
    map.getLayer(layerName) ? map.removeLayer(layerName) : '';
    map.getSource(sourceName) ? map.removeSource(sourceName) : '';

    /* const image = await map.loadImage(
      './assets/icon/location-pin-svgrepo-com.png'
    ); */
    const base = document.getElementsByTagName('base')[0].href;
    const imagePath = `${base}assets/icon/location-pin-svgrepo-com.png`;
    const image = await map.loadImage(imagePath);

    map.addImage('markerIcon', image.data);

    map.addSource(sourceName, {
      type: 'geojson',
      data: dataSource,
    });

    map.addLayer({
      id: layerName,
      type: 'symbol',
      source: sourceName,
      layout: {
        'icon-image': 'markerIcon',
        'icon-overlap': 'always',
        'icon-size': 0.15,
      },
    });
    map.moveLayer(layerName);

    map.on('click', layerName, (e: any) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.desc;

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      new Popup().setLngLat(coordinates).setHTML(description).addTo(map);

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'places', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'places', () => {
        map.getCanvas().style.cursor = '';
      });
    });
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

  public removeGeolocate(map: Map) {
    map.removeControl(this.geolocate);
  }

  public addGeolocateMarker(map: Map) {
    this.geolocate.on('geolocate', (e) => {
      if (!this.userMarker) {
        this.userMarker = new Marker({})
          .setLngLat([e.coords.longitude, e.coords.latitude])
          .addTo(map);
      } else {
        this.userMarker.setLngLat([e.coords.longitude, e.coords.latitude]);
      }

      const userLocation: any = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [e.coords.longitude, e.coords.latitude],
        },
      };

      let foundPolygon = null;
      /**
       * 1.Check, if user is inside any of the DB-stored polygons (zones)->
       */
      for (const polygon of this.polygons) {
        const inside = booleanPointInPolygon(userLocation, polygon.feature);
        if (inside) {
          foundPolygon = polygon.name;
          break;
        }
      }

      /**
       * 2.If the currently entered polygon  !== to the previously entered polygon,
       * alert is shown ->
       */
      if (foundPolygon && foundPolygon !== this.lastPolygonUserIsIn) {
        this.snackBar.open(`A ${foundPolygon} területére érkezett!`, '', {
          duration: 5000,
          panelClass: ['notification-snackbar'],
        });
        this.lastPolygonUserIsIn = foundPolygon;
      }

      /**
       * 3. If user is not in ANY of the DB-stored zones, the previously entered
       * polygon is set to null ->
       */
      if (!foundPolygon && this.lastPolygonUserIsIn) {
        this.lastPolygonUserIsIn = null; // reset if user leaves all polygons
      }
    });
  }
  public triggerGeolocate(map: Map) {
    this.geolocate.trigger();
  }
}
