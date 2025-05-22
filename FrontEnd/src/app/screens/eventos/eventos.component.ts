import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { EventosService } from 'src/app/services/eventos.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss']
})
export class EventosComponent implements OnInit {
  eventoForm!: FormGroup;
  minDate: Date = new Date();
  invalidHorario: boolean = false;
  responsables: any[] = [];
  modoEdicion: boolean = false;
  modoLectura: boolean = false;
  eventoEditando: any = null;
  descripcionLength: number = 0;

  constructor(
    private fb: FormBuilder,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private eventosService: EventosService,
    private route: ActivatedRoute,
    private router: Router,
    private facadeService: FacadeService,
    @Optional() private dialogRef?: MatDialogRef<EventosComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any
  ) {}

  async ngOnInit(): Promise<void> {
    const rolUsuario = this.facadeService.getUserGroup();

    const alfanumericoRegex = /^[a-zA-Z0-9\s]+$/;
    const descripcionRegex = /^[\w\s.,;:()¿?¡!"'%\-]*$/;
    const cupoRegex = /^[1-9][0-9]{0,2}$/;

    this.eventoForm = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.pattern(alfanumericoRegex)]],
      tipo: ['', Validators.required],
      fecha: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      hora_fin: ['', Validators.required],
      lugar: ['', [Validators.required, Validators.pattern(alfanumericoRegex)]],
      publico: ['', Validators.required],
      programa: [''],
      responsable: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(300), Validators.pattern(descripcionRegex)]],
      cupo: ['', [Validators.required, Validators.pattern(cupoRegex), Validators.max(999)]]
    });

    this.eventoForm.get('descripcion')?.valueChanges.subscribe(value => {
      this.descripcionLength = value?.length || 0;
    });

    this.eventoForm.get('nombre')?.valueChanges.subscribe(value => {
      if (value && !alfanumericoRegex.test(value)) {
        const clean = value.replace(/[^a-zA-Z0-9\s]/g, '');
        this.eventoForm.get('nombre')?.setValue(clean, { emitEvent: false });
      }
    });

    this.eventoForm.get('cupo')?.valueChanges.subscribe(value => {
      if (value && parseInt(value, 10) > 999) {
        this.eventoForm.get('cupo')?.setValue(999, { emitEvent: false });
      }
    });

    this.eventoForm.get('publico')?.valueChanges.subscribe(value => {
      if (value !== 'Estudiantes') {
        this.eventoForm.get('programa')?.setValue('');
      }
    });

    await this.cargarResponsables();

    this.route.queryParams.subscribe(async (params) => {
      if (params['readonly'] === 'true') {
        this.modoLectura = true;
      }

      if (!this.modoLectura && rolUsuario !== 'administrador') {
        alert('No tienes permiso para registrar o editar eventos.');
        this.router.navigate(['/lista-eventos']);
        return;
      }

      if (params['id']) {
        this.modoEdicion = true;
        const eventos = await firstValueFrom(this.eventosService.obtenerEventos());
        const evento = eventos.find((e: any) => e.id == params['id']);
        if (evento) {
          this.eventoEditando = evento;
          this.cargarEvento(evento);
        }
      }
    });
  }

  async cargarResponsables(): Promise<void> {
    this.responsables = [];

    const [admins, maestros] = await Promise.all([
      firstValueFrom(this.administradoresService.obtenerListaAdmins()),
      firstValueFrom(this.maestrosService.obtenerListaMaestros())
    ]);

    const adminConRol = admins
      .filter(a => a.user)
      .map(a => ({
        id: a.user.id,
        first_name: a.user.first_name,
        last_name: a.user.last_name,
        rol: 'administrador'
      }));

    const maestrosConRol = maestros
      .filter(m => m.user)
      .map(m => ({
        id: m.user.id,
        first_name: m.user.first_name,
        last_name: m.user.last_name,
        rol: 'maestro'
      }));

    this.responsables.push(...adminConRol, ...maestrosConRol);
  }

  cargarEvento(evento: any): void {
    const convertirHora12 = (hora: string): string => {
      const [h, m] = hora.split(':');
      let hour = parseInt(h, 10);
      const meridian = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour}:${m} ${meridian}`;
    };

    this.eventoEditando = evento;

    this.eventoForm.patchValue({
      id: evento.id,
      nombre: evento.nombre,
      tipo: evento.tipo,
      fecha: evento.fecha,
      hora_inicio: convertirHora12(evento.hora_inicio),
      hora_fin: convertirHora12(evento.hora_fin),
      lugar: evento.lugar,
      publico: evento.publico,
      programa: evento.programa,
      responsable: this.responsables.find(r => r.id === evento.responsable),
      descripcion: evento.descripcion,
      cupo: evento.cupo
    });

    this.descripcionLength = evento.descripcion?.length || 0;

    if (this.modoLectura) {
      this.eventoForm.disable();
    }
  }

  onSubmit(): void {
    if (this.modoLectura) return;

    const horaInicioStr = this.eventoForm.get('hora_inicio')?.value;
    const horaFinStr = this.eventoForm.get('hora_fin')?.value;

    const convertirHora24 = (hora12: string): string => {
      const [time, modifier] = hora12.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    };

    const horaInicio24 = convertirHora24(horaInicioStr);
    const horaFin24 = convertirHora24(horaFinStr);

    const fechaBase = new Date();
    const dateInicio = new Date(`${fechaBase.toDateString()} ${horaInicio24}`);
    const dateFin = new Date(`${fechaBase.toDateString()} ${horaFin24}`);

    if (dateInicio >= dateFin) {
      this.invalidHorario = true;
      return;
    }

    if (this.eventoForm.valid) {
      const evento = { ...this.eventoForm.value };
      evento.fecha = new Date(evento.fecha).toISOString().slice(0, 10);
      evento.hora_inicio = horaInicio24;
      evento.hora_fin = horaFin24;

      if (typeof evento.responsable === 'object' && evento.responsable.id) {
        evento.responsable = evento.responsable.id;
      }

      const request = this.modoEdicion
        ? this.eventosService.editarEvento({ ...evento, id: this.eventoEditando.id })
        : this.eventosService.registrarEvento(evento);

      request.subscribe({
        next: () => {
          alert(this.modoEdicion ? 'Evento actualizado correctamente' : 'Evento registrado correctamente');
          this.eventoForm.reset();
          this.router.navigate(['/lista-eventos']);
        },
        error: err => {
          console.error('Error:', err);
        }
      });
    }
  }
}
