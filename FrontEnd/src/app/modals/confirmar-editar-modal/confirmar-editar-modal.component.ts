import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmar-editar-modal',
  templateUrl: './confirmar-editar-modal.component.html',
  styleUrls: ['./confirmar-editar-modal.component.scss']
})
export class ConfirmarEditarModalComponent implements OnInit {

  public rol: string = "";

  constructor(
    private dialogRef: MatDialogRef<ConfirmarEditarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.rol = this.data.rol || "evento";
  }

  cerrar_modal(): void {
    this.dialogRef.close({ isConfirmed: false });
  }

  eliminarUser(): void {
    this.dialogRef.close({ isConfirmed: true });
  }
}
