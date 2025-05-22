import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
declare var $:any;

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit{
  @Input() rol: string = "";
  @Input() datos_user: any = {};
  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public alumno:any= {};
  public token: string = "";
  public errors:any={};
  public editar:boolean = false;
  public idUser: Number = 0;

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private alumnosService: AlumnosService,
  ){}

  ngOnInit(): void {
  // Verifica si vienes desde una URL con ID (modo edición)
  if (this.activatedRoute.snapshot.params['id'] != undefined) {
    this.editar = true;
    this.idUser = this.activatedRoute.snapshot.params['id'];
    console.log("ID Alumno:", this.idUser);

    // Cargamos los datos del alumno desde el padre (datos_user)
    this.alumno = this.datos_user;

    // ✅ Asegurar que materias_json sea un arreglo (si se usa)
    if (typeof this.alumno.materias_json === 'string') {
      try {
        this.alumno.materias_json = JSON.parse(this.alumno.materias_json);
      } catch {
        this.alumno.materias_json = [];
      }
    } else if (!Array.isArray(this.alumno.materias_json)) {
      this.alumno.materias_json = [];
    }

  } else {
    // Modo registro
    this.alumno = this.alumnosService.esquemaAlumno();
    this.alumno.rol = this.rol;
    this.token = this.facadeService.getSessionToken();
  }

  console.log("Alumno:", this.alumno);
}


  public regresar(){
    this.location.back();
  }

  public registrar(){
    //Validar
    this.errors = [];

    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if(!$.isEmptyObject(this.errors)){
      return false;
    }
    //Validar la contraseña
    if(this.alumno.password == this.alumno.confirmar_password){
      //Aquí si todo es correcto vamos a registrar - aquí se manda a llamar al servicio
      this.alumnosService.registrarAlumno(this.alumno).subscribe(
        (response)=>{
          alert("Usuario registrado correctamente");
          console.log("Usuario registrado: ", response);
          if(this.token != ""){
            this.router.navigate(["home"]);
           }else{
             this.router.navigate(["/"]);
           }
        }, (error)=>{
          alert("No se pudo registrar usuario");
        }
      )
    }else{
      alert("Las contraseñas no coinciden");
      this.alumno.password="";
      this.alumno.confirmar_password="";
    }
  }

  public actualizar(){
    this.errors = [];

  this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
  if(!$.isEmptyObject(this.errors)){
    return false;
  }

  console.log("Pasó la validación");

  this.alumnosService.editarAlumno(this.alumno).subscribe(
    (response)=>{
      alert("Alumno editado correctamente");
      console.log("Alumno editado: ", response);
      this.router.navigate(["home"]);
    }, (error)=>{
      alert("No se pudo editar el alumno");
    }
  );
  }

  //Funciones para password
  showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    console.log(event);
    console.log(event.value.toISOString());

    this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.alumno.fecha_nacimiento);
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }
}
