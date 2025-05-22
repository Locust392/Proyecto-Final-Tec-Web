// eventos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  constructor(
    private http: HttpClient,
    private facadeService: FacadeService,
    private validatorService: ValidatorService,
    private errorService: ErrorsService
  ) {}

  registrarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    return this.http.post<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  obtenerEventos(): Observable<any[]> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any[]>(`${environment.url_api}/eventos/`, { headers });
  }

  editarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    return this.http.put<any>(`${environment.url_api}/eventos-edit/`, data, { headers });
  }

  eliminarEvento(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    return this.http.delete<any>(`${environment.url_api}/eventos-edit/?id=${id}`, { headers });
  }

  getEventoById(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any>(`${environment.url_api}/eventos/?id=${id}`, { headers });
  }

  public validarEvento(data: any, editar: boolean): any {
    console.log("Validando evento... ", data);
    let error: any = {};

    const alfanumerico = /^[a-zA-Z0-9\s]+$/;
    const descripcionValida = /^[\w\s.,;:()\u00bf\u00a1!?"'%\-]*$/;
    const cupoValido = /^[1-9][0-9]{0,2}$/;

    // Nombre del evento
    if (!this.validatorService.required(data["nombre"])) {
      error["nombre"] = this.errorService.required;
    } else if (!alfanumerico.test(data["nombre"])) {
      error["nombre"] = "El nombre solo debe contener letras, números y espacios";
    }

    // Lugar
    if (!this.validatorService.required(data["lugar"])) {
      error["lugar"] = this.errorService.required;
    } else if (!alfanumerico.test(data["lugar"])) {
      error["lugar"] = "El lugar solo debe contener letras, números y espacios";
    }

    // Descripción
    if (!this.validatorService.required(data["descripcion"])) {
      error["descripcion"] = this.errorService.required;
    } else if (!this.validatorService.max(data["descripcion"], 300)) {
      error["descripcion"] = this.errorService.max(300);
    } else if (!descripcionValida.test(data["descripcion"])) {
      error["descripcion"] = "La descripción solo debe contener letras, números y signos básicos de puntuación";
    }

    // Cupo
    if (!this.validatorService.required(data["cupo"])) {
      error["cupo"] = this.errorService.required;
    } else if (!cupoValido.test(data["cupo"].toString())) {
      error["cupo"] = "El cupo debe ser un número entero positivo de hasta 3 dígitos";
    }

    return error;
  }
}
