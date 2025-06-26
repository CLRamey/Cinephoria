import { Component } from '@angular/core';
import { CinemaInfoService } from '../../services/cinema-info.service';
import { OnInit } from '@angular/core';
import { CinemaInfo } from '../../interfaces/cinema-info';

@Component({
  selector: 'caw-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  cinemaInfo: CinemaInfo[] = [];
  currentYear: number = new Date().getFullYear();

  constructor(private cinemaInfoService: CinemaInfoService) {}

  ngOnInit(): void {
    this.cinemaInfoService.getCinemaInfo().subscribe({
      next: data => {
        this.cinemaInfo = data && data.CinemaInfo ? data.CinemaInfo : [];
      },
      error: err => {
        console.error('Erreur lors de la récupération des informations cinéma:', err);
      },
      complete: () => {
        if (this.cinemaInfo.length === 0) {
          console.warn('Aucune information de cinéma disponible.');
        }
      },
    });
  }

  getCurrentYear(): number {
    return this.currentYear;
  }
}
