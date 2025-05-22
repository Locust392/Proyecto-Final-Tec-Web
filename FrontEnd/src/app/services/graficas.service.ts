import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GraficasService {

  private apiUrl = 'http://localhost:8000/api/usuarios-totales/'; // ajusta si es necesario

  constructor(private http: HttpClient) {}

  obtenerTotalesUsuarios(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
