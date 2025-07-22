import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GeolocateControl, Map, Marker, Popup } from 'maplibre-gl';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MapService } from '../../@Service/map.service';
import { Subscription } from 'rxjs';
import {
  GEOJSONMapData,
  UserSettings,
} from '../../@Interface/mapData.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { MaplibreService } from '../../@Service/maplibre.service';
import { MatCardModule } from '@angular/material/card';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  providers: [MapService, MaplibreService],
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mobileControlsContainer') mobileControlsContainer: ElementRef;
  @ViewChild('desktopControlsContainer') desktopControlsContainer: ElementRef;
  private getMapsSub: Subscription;

  public map: Map;
  private geolocate = new GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserLocation: true,
  });
  private userLocationMarker: any;

  public layers: Array<{
    name: string;
    visible: boolean;
    color: string;
    geoJSON: {};
    group: string;
  }> = [];

  public layerGroups: Array<string> = [];

  public USER_SETTINGS: UserSettings = {
    layerVisibility: {
      layers: [],
    },
  };

  public isMobileControlPanelOpen: boolean = false;

  constructor(
    private mapService: MapService,
    private mapHelper: MaplibreService
  ) {}

  ngOnInit(): void {
    this.fetchUserSettingsFromLocalStorage();
    this.map = new Map({
      container: 'map',
      center: [18.420267, 47.089091],
      style:
        'https://api.maptiler.com/maps/openstreetmap/style.json?key=s1MwlFKobYrylkMVoLgc',
      zoom: 16,
      minZoom: 5,
      maplibreLogo: false,
      attributionControl: false,
    });

    this.map.addControl(this.geolocate);
    //fetch geojsons here
    this.getMapsSub = this.mapService.getNavbarControls().subscribe({
      next: (res: Array<GEOJSONMapData>) => {
        const nonUniqueGroups: string[] = [];
        res.forEach((data) => {
          const layerSetting = this.USER_SETTINGS.layerVisibility.layers.find(
            (layer) => layer.layerName === data.name
          );

          this.layers.push({
            name: data.name,
            visible: layerSetting?.isVisible ?? true,
            color: data.color,
            geoJSON: data,
            group: data.group,
          });

          nonUniqueGroups.push(data.group);
        });
        this.updateUserSettingsToLocalStorage();

        this.layerGroups = nonUniqueGroups.filter((value, index, array) => {
          return array.indexOf(value) === index;
        });
        this.manageLayers();
      },
      error: (error: HttpErrorResponse): HttpErrorResponse => {
        return error;
      },
    });
  }

  ngAfterViewInit(): void {
    this.map.on('load', () => {
      this.map.on('touchmove', () => {
        //fetch autoAuthUser here, if neccessary
      });

      this.map.on('mousemove', () => {
        //fetch autoAuthUser here, if neccessary
      });

      this.geolocate.on('geolocate', (e) => {
        const lngLat: any = [e.coords.longitude, e.coords.latitude];

        const marker = new Marker({})
          .setLngLat([e.coords.longitude, e.coords.latitude])
          .addTo(this.map);

        // Optionally, you can also add a popup to the marker
        marker.setPopup(new Popup().setText('You are here!'));
      });
    });
  }

  public manageLayers(
    singleLayerVisibility?: MatSlideToggleChange,
    layerName?: string
  ) {
    if (layerName && singleLayerVisibility) {
      /**
       * single layer toggle->
       */
      this.mapHelper.toggleLayer(
        this.map,
        layerName,
        singleLayerVisibility?.checked
      );
      /**
       * saving setting to localstorage->
       */
      const targetLayer = this.USER_SETTINGS.layerVisibility.layers.find(
        (layer) => layer.layerName === layerName
      );

      if (targetLayer) {
        targetLayer.isVisible = singleLayerVisibility?.checked;
      } else {
        this.USER_SETTINGS.layerVisibility.layers.push({
          layerName: layerName,
          isVisible: singleLayerVisibility?.checked,
        });
      }

      this.updateUserSettingsToLocalStorage();
    } else {
      /**
       * batch layer render->
       */
      this.layers.forEach((layer) => {
        this.mapHelper.addGeoJSONLayer(
          this.map,
          layer.geoJSON,
          layer.name,
          layer.color,
          `${layer.name}-source`,
          layer.visible
        );
      });
    }
  }

  private fetchUserSettingsFromLocalStorage() {
    localStorage.getItem('USER_SETTINGS');
    if (localStorage.getItem('USER_SETTINGS')) {
      this.USER_SETTINGS = JSON.parse(
        localStorage.getItem('USER_SETTINGS') as string
      );
    }
  }

  private updateUserSettingsToLocalStorage() {
    localStorage.setItem('USER_SETTINGS', JSON.stringify(this.USER_SETTINGS));
  }

  public getLayersForGroup(group: string): Array<any> {
    return this.layers.filter((layer: any) => layer.group === group);
  }

  private createCustomMarkerElemenet(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundImage = 'url(assets/icon/location_icon.svg)';
    el.style.backgroundSize = 'cover';
    el.style.borderRadius = '50%';

    console.log('Adding marker element:', el);
    return el;
  }

  public geolocateUser() {
    if (this.geolocate) {
      setTimeout(() => {
        this.map.resize(); // 💥 important fix here
        this.geolocate.trigger();
        console.log('geolocate: ', this.geolocate);
      }, 100); // Delay helps after UI interaction / panel open
    }
  }
  ngOnDestroy(): void {
    this.getMapsSub.unsubscribe();
  }
}
