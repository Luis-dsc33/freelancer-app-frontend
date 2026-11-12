import { Component } from '@angular/core';
import { AdminLayoutComponent } from '../../components/admin-layout/admin-layout.component';
import { SeccionEnDesarrolloComponent, FiltroMaqueta } from '../../components/seccion-en-desarrollo/seccion-en-desarrollo.component';

// Cascarón de HU-25: estructura visual lista, lógica pendiente.
@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [AdminLayoutComponent, SeccionEnDesarrolloComponent],
  templateUrl: './usuarios.page.html',
})
export class UsuariosAdminPage {
  readonly columnas = ['Nombre', 'Correo', 'Rol', 'Estado', 'Fecha de registro', 'Acciones'];
  readonly filtros: FiltroMaqueta[] = [{ etiqueta: 'Buscar por correo o nombre', tipo: 'texto' }, { etiqueta: 'Rol', tipo: 'opciones', opciones: ['Estudiante', 'Cliente', 'Administrador'] }, { etiqueta: 'Estado', tipo: 'opciones', opciones: ['Activo', 'Suspendido'] }];
}
