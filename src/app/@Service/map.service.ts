import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { GEOJSONMapData } from '../@Interface/mapData.interface';

@Injectable()
export class MapService {
  constructor(private http: HttpClient) {}

  public getNavbarControls(): Observable<Array<GEOJSONMapData>> {
    return this.http.get<Array<GEOJSONMapData>>(
      `${environment.apiURL}/map/getGEOJSONLayers`
    );
  }
}
