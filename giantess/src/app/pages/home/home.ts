import { Component } from '@angular/core';
import { HeroCarousel } from "../../components/hero-carousel/hero-carousel";
import { HomeCategory } from '../../components/home-category/home-category';
import { BusinessScope } from '../../components/business-scope/business-scope';
import { ProductsBrands } from '../../components/products-brands/products-brands';
import { Faqs } from '../../components/faqs/faqs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroCarousel, HomeCategory, BusinessScope, ProductsBrands, Faqs],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
