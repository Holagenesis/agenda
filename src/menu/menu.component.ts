// menu.component.ts
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {

  // Creamos un evento de salida llamado 'vistaSeleccionada'
  @Output() vistaSeleccionada = new EventEmitter<'dashboard' | 'calendario'>();

  // Este método emitirá el nombre de la vista que queremos mostrar
  navegarA(vista: 'dashboard' | 'calendario') {
    this.vistaSeleccionada.emit(vista);
  }

}