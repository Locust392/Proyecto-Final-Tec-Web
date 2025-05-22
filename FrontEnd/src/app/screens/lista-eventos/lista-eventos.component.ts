import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { EventosService } from 'src/app/services/eventos.service';
import { ConfirmarEditarModalComponent } from 'src/app/modals/confirmar-editar-modal/confirmar-editar-modal.component';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-lista-eventos',
  templateUrl: './lista-eventos.component.html',
  styleUrls: ['./lista-eventos.component.scss']
})
export class ListaEventosComponent implements OnInit {
  displayedColumns: string[] = [
    'nombre', 'tipo', 'fecha', 'horario', 'lugar',
    'responsable', 'editar', 'eliminar'
  ];

  dataSource = new MatTableDataSource<any>();
  rolUsuario: string = '';
  idUsuario: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private eventosService: EventosService,
    private router: Router,
    private dialog: MatDialog,
    private facadeService: FacadeService
  ) {}

  ngOnInit(): void {
    this.rolUsuario = this.facadeService.getUserGroup();
    this.idUsuario = Number(this.facadeService.getUserId());
    this.obtenerEventos();
  }

  obtenerEventos(): void {
    this.eventosService.obtenerEventos().subscribe({
      next: (eventos) => {
        console.log("Eventos cargados desde backend:", eventos);

        if (this.rolUsuario === 'maestro') {
          eventos = eventos.filter((e: any) =>
            e.responsable === this.idUsuario || e.publico === 'Todos' || e.publico === 'Docentes'
          );
          this.displayedColumns = [
            'nombre', 'tipo', 'fecha', 'horario', 'lugar',
            'responsable', 'ver'
          ];
        }

        if (this.rolUsuario === 'alumno') {
          eventos = eventos.filter((e: any) =>
            e.publico === 'Estudiantes' || e.publico === 'Todos'
          );
          this.displayedColumns = [
            'nombre', 'tipo', 'fecha', 'horario', 'lugar',
            'responsable', 'ver'
          ];
        }

        this.dataSource = new MatTableDataSource(eventos);
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error('Error al obtener eventos:', err);
      }
    });
  }

  editarEvento(evento: any): void {
    const dialogRef = this.dialog.open(ConfirmarEditarModalComponent, {
      data: { rol: 'evento' },
      width: '328px',
      height: '288px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.isConfirmed) {
        localStorage.setItem('evento_a_editar', JSON.stringify(evento));
        this.router.navigate(['/eventos'], {
          queryParams:{id: evento.id}
        });
      }
    });
  }

  eliminarEvento(id: number): void {
      console.log('🗑️ Eliminando evento con ID:', id); // 👈 LOG DE DEPURACIÓN

    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      width: '400px',
      data: {
        id: id,
        rol: 'evento académico'
      }
    });


    dialogRef.afterClosed().subscribe(result => {
  if (result?.isDelete) {
    // 🔄 Solo recarga los eventos, NO elimines otra vez
    this.obtenerEventos();
  }
});
      }


  verEvento(evento: any): void {
    this.router.navigate(['/eventos'], {
      queryParams: { id: evento.id, readonly: true }
    });
  }
}
