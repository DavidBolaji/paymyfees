import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DashboardStats, TimelineData } from '@/src/types';

interface ChartDataItem {
  month: string;
  value: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  chartData: ChartDataItem[];
  timelineData: TimelineData | null;
  selectedYear: string;
  selectedLoanId: string | null;
  hasHydrated: boolean;
  lastFetched: number | null;
  lastChartFetch: Record<string, number>; // Track fetch time per year

  setStats: (stats: DashboardStats | null) => void;
  setChartData: (data: ChartDataItem[], year: string) => void;
  setTimelineData: (data: TimelineData | null) => void;
  setSelectedYear: (year: string) => void;
  setSelectedLoanId: (id: string | null) => void;
  setHasHydrated: (value: boolean) => void;
  setLastFetched: (timestamp: number) => void;
  shouldRefetch: () => boolean;
  shouldRefetchChart: (year: string) => boolean;
  clearCache: () => void;
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      stats: null,
      chartData: [],
      timelineData: null,
      selectedYear: '2026',
      selectedLoanId: null,
      hasHydrated: false,
      lastFetched: null,
      lastChartFetch: {},

      setStats: (stats) =>
        set({
          stats,
        }),

      setChartData: (data, year) =>
        set((state) => ({
          chartData: data,
          lastChartFetch: {
            ...state.lastChartFetch,
            [year]: Date.now(),
          },
        })),

      setTimelineData: (data) =>
        set({
          timelineData: data,
        }),

      setSelectedYear: (year) =>
        set({
          selectedYear: year,
        }),

      setSelectedLoanId: (id) =>
        set({
          selectedLoanId: id,
          lastFetched: null, // Force refetch when loan selection changes
        }),

      setHasHydrated: (value) =>
        set({
          hasHydrated: value,
        }),

      setLastFetched: (timestamp) =>
        set({
          lastFetched: timestamp,
        }),

      // Check if dashboard stats should be refetched
      shouldRefetch: () => {
        const { lastFetched, stats } = get();

        // No data in store, should fetch
        if (!stats) {
          return true;
        }

        // No last fetch timestamp, should fetch
        if (!lastFetched) {
          return true;
        }

        // Check if cache has expired
        const now = Date.now();
        const cacheAge = now - lastFetched;
        return cacheAge > CACHE_DURATION;
      },

      // Check if chart data for a specific year should be refetched
      shouldRefetchChart: (year) => {
        const { lastChartFetch, chartData } = get();

        // No data in store, should fetch
        if (!chartData || chartData.length === 0) {
          return true;
        }

        // No last fetch timestamp for this year, should fetch
        if (!lastChartFetch[year]) {
          return true;
        }

        // Check if cache has expired
        const now = Date.now();
        const cacheAge = now - lastChartFetch[year];
        return cacheAge > CACHE_DURATION;
      },

      clearCache: () =>
        set({
          stats: null,
          chartData: [],
          timelineData: null,
          lastFetched: null,
          lastChartFetch: {},
        }),
    }),
    {
      name: 'paymyfees-dashboard-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useDashboardStore;
