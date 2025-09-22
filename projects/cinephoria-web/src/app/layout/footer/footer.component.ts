import { Component, OnInit, OnDestroy } from '@angular/core';
import { CinemaInfoService } from '../../services/cinema-info.service';
import { CinemaInfo } from '../../interfaces/cinema';
import { Subscription } from 'rxjs';

@Component({
  selector: 'caw-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit, OnDestroy {
  cinemaInfo: CinemaInfo[] = [];
  currentYear: number = new Date().getFullYear();

  constructor(private readonly cinemaInfoService: CinemaInfoService) {}

  private readonly subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    const cinSub = this.cinemaInfoService.getCinemaInfo().subscribe({
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
    this.subscriptions.add(cinSub);
  }

  getCurrentYear(): number {
    return this.currentYear;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
