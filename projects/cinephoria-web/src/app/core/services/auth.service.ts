import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserRole = 'client' | 'employee' | 'admin';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private readonly userRoleSubject = new BehaviorSubject<UserRole | null>(null);

  constructor() {
    const storedRole = localStorage.getItem('userRole');
    const storedLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    this.isLoggedInSubject.next(storedLoggedIn);
    this.userRoleSubject.next(storedRole as UserRole | null);
  }
}
