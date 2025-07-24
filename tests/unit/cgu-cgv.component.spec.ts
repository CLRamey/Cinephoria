import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CguCgvComponent } from '../../projects/cinephoria-web/src/app/utils/dialogs/cgu-cgv/cgu-cgv.component';

describe('CguCgvComponent', () => {
  let component: CguCgvComponent;
  let fixture: ComponentFixture<CguCgvComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CguCgvComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CguCgvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the main title', () => {
    const title = compiled.querySelector('h2[mat-dialog-title]');
    expect(title).toBeTruthy();
    expect(title?.textContent).toContain("Conditions générales d'utilisation");
  });

  it('should have a close button with mat-dialog-close attribute', () => {
    const button = compiled.querySelector('button[mat-dialog-close]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Fermer');
  });
});
