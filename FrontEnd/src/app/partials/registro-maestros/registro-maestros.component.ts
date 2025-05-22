import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';
declare var $:any;

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})
export class RegistroMaestrosComponent implements OnInit{
  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  //Para el select
  public areas: any[] = [
    {value: 1, viewValue: 'Desarrollo Web'},
    {value: 2, viewValue: 'Programación'},
    {value: 3, viewValue: 'Bases de datos'},
    {value: 4, viewValue: 'Redes'},
    {value: 5, viewValue: 'Matemáticas'},
  ];

  public materias:any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];

  constructor(
    private maestrosService: MaestrosService,
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService
  ){}

ngOnInit(): void {
  //El primer if valida si existe un parámetro en la URL
  if (this.activatedRoute.snapshot.params['id'] != undefined) {
    this.editar = true;
    //Asignamos a nuestra variable global el valor del ID que viene por la URL
    this.idUser = this.activatedRoute.snapshot.params['id'];
    console.log("ID User: ", this.idUser);

    // Al iniciar la vista asignamos los datos del user
    this.maestro = this.datos_user;

    // ✅ Asegurarse que el área de investigación sea numérico
    this.maestro.area_investigacion = Number(this.maestro.area_investigacion);

    // ✅ Asegurarse que materias_json sea un arreglo válido
    if (typeof this.maestro.materias_json === 'string') {
      try {
        this.maestro.materias_json = JSON.parse(this.maestro.materias_json);
      } catch {
        this.maestro.materias_json = [];
      }
    } else if (!Array.isArray(this.maestro.materias_json)) {
      this.maestro.materias_json = [];
    }

  } else {
    this.maestro = this.maestrosService.esquemaMaestro();
    this.maestro.rol = this.rol;
    this.token = this.facadeService.getSessionToken();
  }

  //Imprimir datos en consola
  console.log("Maestro: ", this.maestro);
}



  public regresar(){
    this.location.back();
  }

 public registrar() {
  // Validar
  this.errors = [];

  console.log("Validando maestro... ", this.maestro);
  this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
  console.log("Errores de validación:", this.errors);

  if (!$.isEmptyObject(this.errors)) {
    return false;
  }

  // Validar contraseñas
  if (this.maestro.password === this.maestro.confirmar_password) {
    // ✅ Mostrar los datos que se enviarán
    console.log("Datos enviados al backend:", this.maestro);

    // Enviar al backend
    this.maestrosService.registrarMaestro(this.maestro).subscribe({
      next: (response) => {
        alert("Usuario registrado correctamente");
        console.log("Usuario registrado: ", response);
        if (this.token != "") {
          this.router.navigate(["home"]);
        } else {
          this.router.navigate(["/"]);
        }
      },
      error: (error) => {
  console.error("Error al registrar:", error);
  if (error.error) {
    console.error("Detalles del error 400:", error.error);
    alert("Error al registrar: " + JSON.stringify(error.error));
  } else {
    alert("No se pudo registrar usuario. Revisa la consola.");
  }
}

    });

  } else {
    alert("Las contraseñas no coinciden");
    this.maestro.password = "";
    this.maestro.confirmar_password = "";
  }
}


  public actualizar(){
    console.log("Click en ACTUALIZAR");

    this.errors = [];

    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    console.log("Errores detectados:", this.errors);
    if(!$.isEmptyObject(this.errors)){
      return false;
    }

    // CORRECCIÓN 1: Forzar que el campo sea tipo número
    this.maestro.area_investigacion = Number(this.maestro.area_investigacion);

    // CORRECCIÓN 2: Confirmar que se está enviando todo correctamente
    console.log("Pasó la validación");
    console.log("Datos enviados al backend:", this.maestro);

    this.maestrosService.editarMaestro(this.maestro).subscribe(
      (response)=>{
        alert("Maestro editado correctamente");
        console.log("Maestro editado: ", response);
        this.router.navigate(["home"]);
      }, (error)=>{
        alert("No se pudo editar el maestro");
        console.error(error);
      }
    );
  }

public checkboxChange(event: any) {
  console.log("Evento: ", event);

  // Asegurar que el arreglo exista
  if (!this.maestro.materias_json) {
    this.maestro.materias_json = [];
  }

  if (event.checked) {
    this.maestro.materias_json.push(event.source.value);
  } else {
    this.maestro.materias_json = this.maestro.materias_json.filter(
      (materia: any) => materia !== event.source.value
    );
  }
}


  public revisarSeleccion(nombre: string){
    if(this.maestro.materias_json){
      var busqueda = this.maestro.materias_json.find((element)=>element==nombre);
      if(busqueda != undefined){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
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

    this.maestro.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.maestro.fecha_nacimiento);
  }
}
