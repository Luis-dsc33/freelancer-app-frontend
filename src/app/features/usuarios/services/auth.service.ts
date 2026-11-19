import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse, RegistrarUsuarioRequest } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.gatewayUrl}/api/usuarios/Auth`;

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  get currentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  constructor(private http: HttpClient) {}

  registrar(datos: RegistrarUsuarioRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.baseUrl}/registro`, datos);
  }

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, datos).pipe(
      tap(respuesta => {
        localStorage.setItem('jwt_token', respuesta.token);
        this.currentUserSubject.next(respuesta);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.currentUserSubject.next(null);
  }
}