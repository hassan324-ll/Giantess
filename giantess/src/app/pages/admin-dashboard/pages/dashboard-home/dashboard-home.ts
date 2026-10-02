import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBoxesStacked,
  faBoxOpen,
  faChartLine,
  faFire,
  faMicrochip,
  faScrewdriverWrench
} from '@fortawesome/free-solid-svg-icons';
import './dashboard-home.css';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome {
  faBoxesStacked = faBoxesStacked;
  faBoxOpen = faBoxOpen;
  faChartLine = faChartLine;
  faFire = faFire;
  faMicrochip = faMicrochip;
  faScrewdriverWrench = faScrewdriverWrench;

  cards = [
    {
      title: 'Brand Catalog',
      description: 'Manage scanner and terminal brands',
      color: '#1e63da',
      icon: faBoxesStacked,
      badge: 'Brands',
      route: '/admin-dashboard/brand-management',
      action: 'Manage Brands'
    },
    {
      title: 'Device Models',
      description: 'Organize model families by category',
      color: '#1fb4d9',
      icon: faMicrochip,
      badge: 'Models',
      route: '/admin-dashboard/model-management',
      action: 'Manage Models'
    },
    {
      title: 'Parts Inventory',
      description: 'Maintain replacement parts and pricing',
      color: '#2563eb',
      icon: faScrewdriverWrench,
      badge: 'Products',
      route: '/admin-dashboard/product-management',
      action: 'Manage Products'
    },
  ];

  trendingActivities = [
    { name: 'Newcomer referral activities', description: 'Participating is recommended for special offers.', status: 'Pending', actions: ['Review', 'Pause', 'Delete'] },
    { name: 'Training camp specials', description: 'Focus on skill organization to empty special offers', status: 'In Progress', actions: ['Review', 'Pause', 'Delete'] },
  ];
}
