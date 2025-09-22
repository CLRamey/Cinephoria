import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyPolicyComponent } from '../../projects/cinephoria-web/src/app/utils/dialogs/privacy-policy/privacy-policy.component';

describe('PrivacyPolicyComponent', () => {
  let component: PrivacyPolicyComponent;
  let fixture: ComponentFixture<PrivacyPolicyComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPolicyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the main dialog title', () => {
    const title = compiled.querySelector('h2[mat-dialog-title]');
    expect(title).toBeTruthy();
    expect(title?.textContent).toContain('Politique de confidentialité');
  });

  it('should have a close button with mat-dialog-close attribute', () => {
    const button = compiled.querySelector('button[mat-dialog-close]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Fermer');
  });
});
