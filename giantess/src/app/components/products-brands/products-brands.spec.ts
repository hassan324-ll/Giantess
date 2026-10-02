import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsBrands } from './products-brands';

describe('ProductsBrands', () => {
  let component: ProductsBrands;
  let fixture: ComponentFixture<ProductsBrands>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsBrands]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsBrands);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
