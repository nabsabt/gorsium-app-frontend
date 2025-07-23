import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { GEOJSONMapData } from '../@Interface/mapData.interface';

@Injectable()
export class MapService {
  constructor(private http: HttpClient) {}

  public getGEOJSONFeatures(): Observable<Array<GEOJSONMapData>> {
    return this.http.get<Array<GEOJSONMapData>>(
      `${environment.apiURL}/map/getGEOJSONLayers`
    );
  }

  public getLocationMarkers(): Observable<JSON | object> {
    return this.http.get<JSON | object>(
      `${environment.apiURL}/map/getLocationMarkers`
    );
  }
}
