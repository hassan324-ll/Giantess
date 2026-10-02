import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type HomeCategoryItem = {
  name: string;
  anchorId: string;
  imagePath: string;
  imageClass?: string;
  priority?: boolean;
};

@Component({
  selector: 'app-home-category',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-category.html',
  styleUrl: './home-category.css',
})
export class HomeCategory {
  protected readonly categories: HomeCategoryItem[] = [
    {
      name: 'Mobile Computers',
      anchorId: 'category-mobile-computers',
      imagePath: 'category-1.png',
      imageClass: 'category-image--wide-left',
    },
    {
      name: 'Printers',
      anchorId: 'category-printers',
      imagePath: 'category-2.png',
    },
    {
      name: 'Barcode Scanners',
      anchorId: 'category-barcode-scanners',
      imagePath: 'product-item1.png',
      priority: true,
    },
    {
      name: 'RFID Devices',
      anchorId: 'category-rfid-devices',
      imagePath: 'category-6.png',
    },
    {
      name: 'Vehicle Mounts',
      anchorId: 'category-vehicle-mounts',
      imagePath: 'category-3.png',
      imageClass: 'category-image--wide-left',
    },
    {
      name: 'Accessories',
      anchorId: 'category-accessories',
      imagePath: 'category-5.png',
      imageClass: 'category-image--wide-left',
    },
    {
      name: 'POS Devices',
      anchorId: 'category-pos-devices',
      imagePath: 'carosusel-4.png',
    },
  ];
}
