import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCategory } from './home-category';

describe('HomeCategory', () => {
  let component: HomeCategory;
  let fixture: ComponentFixture<HomeCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeCategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
