import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Brands } from './brands';

describe('Brands', () => {
  let component: Brands;
  let fixture: ComponentFixture<Brands>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Brands],
    }).compileComponents();

    fixture = TestBed.createComponent(Brands);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all brands', () => {
    const brandCards = fixture.nativeElement.querySelectorAll('.group');
    expect(brandCards.length).toBe(component.brands.length);
  });
});
