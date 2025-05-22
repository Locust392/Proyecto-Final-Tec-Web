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
export class AlumnosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) {}

  public esquemaAlumno() {
    return {
      'rol': '',
      'matricula': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'telefono': '',
      'edad': '',
      'semestre': '',
      'carrera': ''
    };
  }

  public validarAlumno(data: any, editar: boolean) {
  console.log("Validando alumno... ", data);

  let error: any = [];

  if (!this.validatorService.required(data["matricula"])) {
    error["matricula"] = this.errorService.required;
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

  // Solo durante REGISTRO (no edición), exige password y confirmar_password
  if (!editar) {
    if (!this.validatorService.required(data["password"])) {
      error["password"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["confirmar_password"])) {
      error["confirmar_password"] = this.errorService.required;
    }
  }

  if (!this.validatorService.required(data["fecha_nacimiento"])) {
    error["fecha_nacimiento"] = this.errorService.required;
  }

  if (!this.validatorService.required(data["curp"])) {
    error["curp"] = this.errorService.required;
  }

  if (!this.validatorService.required(data["rfc"])) {
    error["rfc"] = this.errorService.required;
  } else if (!this.validatorService.min(data["rfc"], 12)) {
    error["rfc"] = this.errorService.min(12);
  } else if (!this.validatorService.max(data["rfc"], 13)) {
    error["rfc"] = this.errorService.max(13);
  }

  if (!this.validatorService.required(data["edad"])) {
    error["edad"] = this.errorService.required;
  }

  if (!this.validatorService.required(data["telefono"])) {
    error["telefono"] = this.errorService.required;
  }

  if (!this.validatorService.required(data["ocupacion"])) {
    error["ocupacion"] = this.errorService.required;
  }

  return error;
}
  public registrarAlumno(data: any): Observable<any> {
    return this.http.post<any>(`${environment.url_api}/alumnos/`, data, httpOptions);
  }

  public obtenerListaAlumnos(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<any>(`${environment.url_api}/lista-alumnos/`, { headers });
  }

  public getAlumnoByID(idUser: number): Observable<any> {
    return this.http.get<any>(`${environment.url_api}/alumnos/?id=${idUser}`, httpOptions);
  }

  public editarAlumno(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.put<any>(`${environment.url_api}/alumnos-edit/`, data, { headers });
  }

  public eliminarAlumno(idUser: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.delete<any>(`${environment.url_api}/alumnos-edit/?id=${idUser}`, { headers });
  }
}
