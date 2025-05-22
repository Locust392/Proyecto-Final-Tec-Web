import { AlumnosService } from 'src/app/services/alumnos.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';



@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit{

  public name_user:string = "";
  public lista_alumnos:any[]= [];

  constructor(
    public facadeService: FacadeService,
    private alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ){}

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    //Lista de admins
    this.obtenerAlumnos();
  }

  //Obtener lista de usuarios
  public obtenerAlumnos(){
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response)=>{
        this.lista_alumnos = response;
        console.log("Lista users: ", this.lista_alumnos);
      }, (error)=>{
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  public goEditar(idUser: number){
    this.router.navigate(["registro-usuarios/alumno/" + idUser]);
  }

  public delete(idUser: number){
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
    data: { id: idUser, rol: 'alumno' },
    height: '288px',
    width: '328px',
  });

  dialogRef.afterClosed().subscribe(result => {
    if(result?.isDelete){
      this.obtenerAlumnos(); // Recarga la lista
    } else {
      alert("Alumno no eliminado");
    }
  });
  }

}

