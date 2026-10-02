import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faMobileScreenButton,
  faBarcode,
  faCog,
  faMagnifyingGlass,
  faChartBar,
  faBriefcase,
  faPrint,
  faFeather,
  faStar,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons';

interface Brand {
  name: string;
  icon: IconDefinition;
}

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './brands.html',
  styleUrl: './brands.css',
})
export class Brands {
  brands: Brand[] = [
    { name: 'MOTOROLA', icon: faMobileScreenButton },
    { name: 'ZEBRA', icon: faBarcode },
    { name: 'Honeywell', icon: faCog },
    { name: 'Datalogic', icon: faMagnifyingGlass },
    { name: 'Intermec', icon: faChartBar },
    { name: 'Urovo', icon: faBriefcase },
    { name: 'TSC', icon: faPrint },
    { name: 'Bluebird', icon: faFeather },
    { name: 'ZENOVA', icon: faStar },
    { name: 'Other Brands', icon: faGlobe },
  ];
}
