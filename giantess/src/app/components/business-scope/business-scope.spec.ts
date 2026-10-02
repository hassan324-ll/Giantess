import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessScope } from './business-scope';

describe('BusinessScope', () => {
  let component: BusinessScope;
  let fixture: ComponentFixture<BusinessScope>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessScope]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessScope);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
