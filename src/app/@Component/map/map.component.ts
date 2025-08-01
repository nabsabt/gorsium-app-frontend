import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Map } from 'maplibre-gl';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [MapService, MaplibreService],
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  private getMapsSub: Subscription;
  private getZonesSub: Subscription;
  private getLocationsSub: Subscription;

  public isLoading: boolean;
  public map: Map;
  public currentZone: string | null;

  public objects: Array<{
    name: string;
    visible: boolean;
    color: string;
    geoJSON: {};
  }> = [];

  public zones: Array<{
    name: string;
    color: string;
    geoJSON: {};
  }> = [];

  public USER_SETTINGS: UserSettings = {
    layerVisibility: {
      layers: [],
    },
  };

  public isMobileControlPanelOpen: boolean = false;

  constructor(
    private mapService: MapService,
    private mapHelper: MaplibreService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
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

    this.mapHelper.addGeolocate(this.map);

    /**
     * fetch objects ->
     */
    this.getMapsSub = this.mapService.getGEOJSONObjects().subscribe({
      next: (res: Array<GEOJSONMapData>) => {
        res.forEach((data) => {
          const layerSetting = this.USER_SETTINGS.layerVisibility.layers.find(
            (layer) => layer.layerName === data.name
          );

          this.objects.push({
            name: data.name,
            visible: layerSetting?.isVisible ?? true,
            color: data.color,
            geoJSON: data,
          });
        });
        this.updateUserSettingsToLocalStorage();

        this.manageLayers();
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse): HttpErrorResponse => {
        this.isLoading = false;
        this.snackBar.open(error.error.message, '', {
          duration: 3000,
          panelClass: ['danger-snackbar'],
        });
        return error;
      },
    });

    /**
     * fetch zones and add them to map here->
     */
    this.getZonesSub = this.mapService.getGEOJSONZones().subscribe({
      next: (res: Array<GEOJSONMapData>) => {
        res.forEach((data) => {
          this.zones.push({
            name: data.name,
            color: data.color,
            geoJSON: data,
          });

          this.mapHelper.addGEOJSONZones(
            this.map,
            data,
            data.name,
            data.color,
            `${data.name}-source`
          );
        });

        this.isLoading = false;
      },
      error: (error: HttpErrorResponse): HttpErrorResponse => {
        this.isLoading = false;
        this.snackBar.open(error.error.message, '', {
          duration: 3000,
          panelClass: ['danger-snackbar'],
        });
        return error;
      },
    });

    //fetch locationMarkers here
    this.getLocationsSub = this.mapService.getLocationMarkers().subscribe({
      next: (res: any) => {
        this.mapHelper.addLocationMarkers(
          this.map,
          res,
          res.name,
          `${res.name}-source`
        );
      },
      error: (error: HttpErrorResponse): HttpErrorResponse => {
        this.isLoading = false;
        this.snackBar.open(error.error.message, '', {
          duration: 3000,
          panelClass: ['danger-snackbar'],
        });
        return error;
      },
    });

    this.mapHelper.currentZone.subscribe((zone) => (this.currentZone = zone));
  }

  ngAfterViewInit(): void {
    this.map.on('load', () => {
      this.map.on('touchmove', () => {
        //fetch autoAuthUser here, if neccessary
      });

      this.map.on('mousemove', () => {
        //fetch autoAuthUser here, if neccessary
      });

      this.mapHelper.addGeolocateMarker(this.map);
      this.mapHelper.triggerGeolocate(this.map);
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
      this.objects.forEach((layer) => {
        this.mapHelper.addGeoJSONObjectsLayer(
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

  public geolocateUser() {
    this.mapHelper.triggerGeolocate(this.map);
  }

  public panToGorsium() {
    this.map.flyTo({ center: [18.42052, 47.08989], zoom: 17 });
  }

  ngOnDestroy(): void {
    this.getMapsSub.unsubscribe();
    if (this.map) {
      this.mapHelper.removeGeolocate(this.map);
    }
    if (this.getLocationsSub) {
      this.getLocationsSub.unsubscribe();
    }
    if (this.getZonesSub) {
      this.getZonesSub.unsubscribe();
    }
  }
}
