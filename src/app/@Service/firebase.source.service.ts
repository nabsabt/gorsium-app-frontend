import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class FirebaseSourceService {
  constructor(private http: HttpClient) {}

  public getHomeImageURLs(): Observable<Array<string>> {
    return this.http.get<Array<string>>(
      `${environment.apiURL}/firebase/getHomeImageURLs`
    );
  }
}
