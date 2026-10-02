import { Injectable } from '@angular/core';

export interface DashboardStatsCache {
  totalBrands: number;
  totalCategories: number;
  totalModels: number;
  totalProducts: number | null;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStatsService {
  private readonly cacheKey = 'giantess_dashboard_stats';
  private readonly cacheTtl = 15 * 60 * 1000; // 15 minutes

  getCachedStats(): DashboardStatsCache | null {
    try {
      const value = sessionStorage.getItem(this.cacheKey);
      if (!value) {
        return null;
      }

      const cached = JSON.parse(value) as DashboardStatsCache;
      if (Date.now() - cached.timestamp > this.cacheTtl) {
        this.clearCache();
        return null;
      }

      return cached;
    } catch {
      this.clearCache();
      return null;
    }
  }

  setCachedStats(stats: Omit<DashboardStatsCache, 'timestamp'>): void {
    const payload: DashboardStatsCache = {
      ...stats,
      timestamp: Date.now()
    };

    try {
      sessionStorage.setItem(this.cacheKey, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }

  clearCache(): void {
    try {
      sessionStorage.removeItem(this.cacheKey);
    } catch {
      // ignore storage errors
    }
  }
}
