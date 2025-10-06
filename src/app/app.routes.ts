import { Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { BigCalendarComponent } from './big-calendar/big-calendar.component';

export const routes: Routes = [

    { path: 'home', component: HomeComponent }, // Agrega esta ruta
    { path: 'calendar', component: BigCalendarComponent }
    
];
