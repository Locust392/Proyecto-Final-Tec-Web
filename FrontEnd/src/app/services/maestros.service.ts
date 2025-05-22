import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';
import { FacadeService } from './facade.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class MaestrosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) {}

  public esquemaMaestro() {
    return {
      'rol':'',
      'clave_maestro': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'telefono': '',
      'rfc': '',
      'especialidad': '',
      'edad': ''
    }
  }

public validarMaestro(data: any, editar: boolean) {
  console.log("Validando maestro... ", data);

  let error: any = [];

  if (!this.validatorService.required(data["id_trabajador"])) {
    error["id_trabajador"] = this.errorService.required;
  }

  if (!this.validatorService.required(data["first_name"])) {
    error["first_name"] = this.errorService.required;
  }

  if (!this.validatorService.required(data["last_name"])) {
    error["last_name"] = this.errorService.required;
  }

  if (!this.validatorService.required(data["email"])) {
    error["email"] = this.errorService.required;
  } else if (!this.validatorService.max(data["email"], 40)) {
    error["email"] = this.errorService.max(40);
  } else if (!this.validatorService.email(data["email"])) {
    error["email"] = this.errorService.email;
  }

  // Solo si es registro, se validan las contraseñas
  if (!editar) {
    if (!this.validatorService.required(data["password"])) {
      error["password"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["confirmar_password"])) {
      error["confirmar_password"] = this.errorService.required;
    }
  }

  if (!this.validatorService.required(data["telefono"])) {
    error["telefono"] = this.errorService.required;
  }

  if (!this.validatorService.required(data["rfc"])) {
    error["rfc"] = this.errorService.required;
  } else if (!this.validatorService.min(data["rfc"], 12)) {
    error["rfc"] = this.errorService.min(12);
  } else if (!this.validatorService.max(data["rfc"], 13)) {
    error["rfc"] = this.errorService.max(13);
  }

  if (!this.validatorService.required(data["cubiculo"])) {
    error["cubiculo"] = this.errorService.required;
  }

  if (!this.validatorService.required(data["area_investigacion"])) {
    error["area_investigacion"] = this.errorService.required;
  }

  if (!this.validatorService.required(data["materias_json"]) || data["materias_json"].length === 0) {
    error["materias_json"] = "Debes seleccionar al menos una materia";
  }

  return error;
}


  public registrarMaestro(data: any): Observable<any> {
    return this.http.post<any>(`${environment.url_api}/maestros/`, data, httpOptions);
  }

  public obtenerListaMaestros(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<any>(`${environment.url_api}/lista-maestros/`, { headers });
  }

  public getMaestroByID(idUser: number): Observable<any> {
    return this.http.get<any>(`${environment.url_api}/maestros/?id=${idUser}`, httpOptions);
  }

  public editarMaestro(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.put<any>(`${environment.url_api}/maestros-edit/`, data, { headers });
  }

  public eliminarMaestro(idUser: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.delete<any>(`${environment.url_api}/maestros-edit/?id=${idUser}`, { headers });
  }
}
