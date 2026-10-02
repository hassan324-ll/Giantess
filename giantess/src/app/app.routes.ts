import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'brands/:brandSlug/categories/:categorySlug/models/:modelSlug/products',
    loadComponent: () =>
      import('./pages/model-products/model-products').then((m) => m.ModelProducts)
  },
  {
    path: 'products/:productSlug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail)
  },
  {
    path: 'brands/:brandSlug/categories/:categorySlug/models/:modelSlug/products/:productSlug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail)
  },
  {
    path: 'brands/:brandSlug/categories/:categorySlug/models',
    loadComponent: () =>
      import('./pages/category-models/category-models').then((m) => m.CategoryModels)
  },
  {
    path: 'brands/:brandSlug/categories',
    loadComponent: () =>
      import('./pages/brand-categories/brand-categories').then((m) => m.BrandCategories)
  },
  {
    path: 'login',
    redirectTo: 'contact',
    pathMatch: 'full'
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search-results/search-results').then((m) => m.SearchResults)
  },
  {
    path: 'legal-terms-of-use',
    loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal),
    data: {
      title: 'Legal Terms of Use',
      breadcrumb: 'Legal Terms of Use',
      type: 'terms'
    }
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal),
    data: {
      title: 'Privacy Policy',
      breadcrumb: 'Privacy Policy',
      type: 'privacy'
    }
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./pages/admin-login/admin-login').then((m) => m.AdminLogin),
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/admin-dashboard/pages/dashboard-home/dashboard-home').then(m => m.DashboardHome)
      },
      {
        path: 'product-management',
        loadComponent: () => import('./pages/admin-dashboard/pages/product-management/product-management').then(m => m.ProductManagement)
      },
      {
        path: 'brand-management',
        loadComponent: () => import('./pages/admin-dashboard/pages/brand-management/brand-management').then(m => m.BrandManagement)
      },
      {
        path: 'category-management',
        loadComponent: () => import('./pages/admin-dashboard/pages/category-management/category-management').then(m => m.CategoryManagement)
      },
      {
        path: 'model-management',
        loadComponent: () => import('./pages/admin-dashboard/pages/model-management/model-management').then(m => m.ModelManagement)
      },
      {
        path: 'membership-management',
        loadComponent: () => import('./pages/admin-dashboard/pages/membership-management/membership-management').then(m => m.MembershipManagement)
      },
      {
        path: 'marketing-tools',
        loadComponent: () => import('./pages/admin-dashboard/pages/marketing-tools/marketing-tools').then(m => m.MarketingTools)
      },
      {
        path: 'trending-analytics',
        loadComponent: () => import('./pages/admin-dashboard/pages/trending-analytics/trending-analytics').then(m => m.TrendingAnalytics)
      },
      {
        path: 'system-management',
        loadComponent: () => import('./pages/admin-dashboard/pages/system-management/system-management').then(m => m.SystemManagement)
      },
      {
        path: 'administrator-management',
        loadComponent: () => import('./pages/admin-dashboard/pages/administrator-management/administrator-management').then(m => m.AdministratorManagement)
      },
      {
        path: 'change-password',
        loadComponent: () => import('./pages/admin-dashboard/pages/change-password/change-password').then(m => m.ChangePassword)
      },
      {
        path: 'basic-settings',
        loadComponent: () => import('./pages/admin-dashboard/pages/basic-settings/basic-settings').then(m => m.BasicSettings)
      }
    ]
  }
];
