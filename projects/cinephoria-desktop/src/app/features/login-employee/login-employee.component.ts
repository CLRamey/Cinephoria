import { Component } from '@angular/core';

@Component({
  selector: 'cad-login-employee',
  template: `
    <cad-header></cad-header>
    <csh-employee-c-login></csh-employee-c-login>
  `,
  styleUrl: './login-employee.component.scss',
})
export class LoginEmployeeComponent {}
