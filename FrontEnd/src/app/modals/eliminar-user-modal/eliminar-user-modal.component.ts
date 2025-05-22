import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { EventosService } from 'src/app/services/eventos.service'; // ✅ IMPORTADO

@Component({
  selector: 'app-eliminar-user-modal',
  templateUrl: './eliminar-user-modal.component.html',
  styleUrls: ['./eliminar-user-modal.component.scss']
})
export class EliminarUserModalComponent implements OnInit {

  public rol: string = "";

  constructor(
    private administradoresService: AdministradoresService,
    private eventosService: EventosService, // ✅ INYECTADO
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService,
    private dialogRef: MatDialogRef<EliminarUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.rol = this.data.rol;
  }

  public cerrar_modal() {
    this.dialogRef.close({ isDelete: false });
  }

  public eliminarUser() {
    if (this.rol === "administrador") {
      this.administradoresService.eliminarAdmin(this.data.id).subscribe(
        (response) => {
          console.log(response);
          this.dialogRef.close({ isDelete: true });
        },
        (error) => {
          this.dialogRef.close({ isDelete: false });
        }
      );
    } else if (this.rol === "maestro") {
      this.maestrosService.eliminarMaestro(this.data.id).subscribe(
        (response) => {
          console.log(response);
          this.dialogRef.close({ isDelete: true });
        },
        (error) => {
          this.dialogRef.close({ isDelete: false });
        }
      );
    } else if (this.rol === "alumno") {
      this.alumnosService.eliminarAlumno(this.data.id).subscribe(
        (response) => {
          console.log(response);
          this.dialogRef.close({ isDelete: true });
        },
        (error) => {
          this.dialogRef.close({ isDelete: false });
        }
      );
    } else if (this.rol === "evento académico") {
      this.eventosService.eliminarEvento(this.data.id).subscribe(
        (response) => {
          console.log("✅ Eliminado:", response);
          this.dialogRef.close({ isDelete: true });
        },
        (error) => {
          if (error.status === 404 && error.error?.details === "Evento eliminado") {
            console.warn("⚠️ Ya estaba eliminado, forzando éxito.");
            this.dialogRef.close({ isDelete: true });
          } else {
            console.error("❌ Error real al eliminar:", error);
            this.dialogRef.close({ isDelete: false });
          }
        }
      );
    } else {
      this.dialogRef.close({ isDelete: false });
    }
  }
}
