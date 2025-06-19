import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { HeaderModule } from './layout/header/header.module';
import { FooterModule } from './layout/footer/footer.module';
import { HomeModule } from './features/home/home.module';
import { FilmsModule } from './features/films/films.module';
import { ReservationModule } from './features/reservation/reservation.module';
import { LoginClientModule } from './features/auth/login-client/login-client.module';
import { AdminModule } from './features/admin/admin.module';
import { EmployeeModule } from './features/employee/employee.module';
import { ClientModule } from './features/client/client.module';
import { ContactModule } from './features/contact/contact.module';
import { LoginEmployeeModule } from './features/auth/login-employee/login-employee.module';
import { LoginAdminModule } from './features/auth/login-admin/login-admin.module';
import { InscriptionModule } from './features/auth/inscription/inscription.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HeaderModule,
    FooterModule,
    HomeModule,
    FilmsModule,
    ReservationModule,
    LoginClientModule,
    LoginEmployeeModule,
    LoginAdminModule,
    InscriptionModule,
    AdminModule,
    EmployeeModule,
    ClientModule,
    ContactModule,
  ],
  providers: [provideAnimationsAsync(), provideHttpClient(withInterceptorsFromDi())],
  bootstrap: [AppComponent],
})
export class AppModule {}
