import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faHome,
  faChartLine,
  faBox,
  faUsers,
  faFile,
  faBullhorn,
  faKey,
  faSignOutAlt,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../services/auth.service';
import './admin-sidebar.css';

interface MenuItem {
  label: string;
  route: string;
  icon: IconDefinition;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
  faSignOutAlt = faSignOutAlt;

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin-dashboard/home', icon: faHome },
    { label: 'Product Management', route: '/admin-dashboard/product-management', icon: faBox },
    { label: 'Brand Management', route: '/admin-dashboard/brand-management', icon: faBullhorn },
    { label: 'Category Management', route: '/admin-dashboard/category-management', icon: faUsers },
    { label: 'Model Management', route: '/admin-dashboard/model-management', icon: faFile },
    { label: 'Membership Management', route: '/admin-dashboard/membership-management', icon: faUsers },
    { label: 'Marketing Tools', route: '/admin-dashboard/marketing-tools', icon: faBullhorn },
    { label: 'Trending Analytics', route: '/admin-dashboard/trending-analytics', icon: faChartLine },
    { label: 'Change Password', route: '/admin-dashboard/change-password', icon: faKey }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout(false);
    this.router.navigate(['/admin-login']);
  }
}
