import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Map } from 'maplibre-gl';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MapService } from '../../@Service/map.service';
import { Subscription } from 'rxjs';
import { GEOJSONMapData } from '../../@Interface/mapData.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { MaplibreService } from '../../@Service/maplibre.service';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
  ],
  providers: [MapService, MaplibreService],
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mobileControlsContainer') mobileControlsContainer: ElementRef;
  @ViewChild('desktopControlsContainer') desktopControlsContainer: ElementRef;
  private getMapsSub: Subscription;

  public map: Map;

  constructor(
    private mapService: MapService,
    private mapHelper: MaplibreService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.map = new Map({
      container: 'map',
      center: [18.42, 47.089],
      style:
        'https://api.maptiler.com/maps/openstreetmap/style.json?key=s1MwlFKobYrylkMVoLgc',
      zoom: 16,
      minZoom: 15,
      maplibreLogo: false,
      attributionControl: false,
    });

    this.map.on('load', () => {
      //fetch geojsons here
      this.getMapsSub = this.mapService.getNavbarControls().subscribe({
        next: (res: Array<GEOJSONMapData>) => {
          console.log(res);
          res.forEach((data) => {
            this.mapHelper.addGeoJSONLayer(
              this.map,
              data,
              data.name,
              data.color,
              `${data.name}-source`
            );
          });
        },
        error: (error: HttpErrorResponse): HttpErrorResponse => {
          return error;
        },
      });

      this.map.on('touchmove', () => {
        //fetch autoAuthUser here, if neccessary
      });

      this.map.on('mousemove', () => {
        //fetch autoAuthUser here, if neccessary
      });
    });
  }

  ngOnDestroy(): void {
    this.getMapsSub.unsubscribe();
  }
}
