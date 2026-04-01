import { useState, useEffect } from 'react';
import useDashboardStore from '@/src/stores/dashboardStore';
import { fetchDashboardStats, fetchChartData } from '@/src/utils/dashboard-api';
import { fetchTimelineData } from '@/src/utils/loan-api';

const useDashboard = (forceRefresh = false) => {
  const {
    stats,
    chartData,
    timelineData,
    selectedYear,
    selectedLoanId,
    hasHydrated,
    shouldRefetch,
    shouldRefetchChart,
    setStats,
    setChartData,
    setTimelineData,
    setSelectedYear,
    setLastFetched,
    clearCache,
  } = useDashboardStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    // Wait for hydration before checking cache
    if (!hasHydrated) {
      return;
    }

    const loadData = async () => {
      // Check if we should fetch based on cache status
      const needsFetch = forceRefresh || shouldRefetch();
      const needsChartFetch = forceRefresh || shouldRefetchChart(selectedYear);

      if (!needsFetch && !needsChartFetch) {
        console.log('Using cached dashboard data');
        return;
      }

      console.log('Fetching fresh dashboard data');
      setLoading(true);
      setError(null);

      try {
        const promises = [];

        // Fetch stats if needed
        if (needsFetch) {
          promises.push(
            fetchDashboardStats(selectedLoanId ?? undefined).then((data) => {
              if (data) {
                setStats(data);
              }
            })
          );

          // Fetch timeline data with stats
          promises.push(
            fetchTimelineData().then((data) => {
              if (data) {
                setTimelineData(data);
              }
            })
          );
        }

        // Fetch chart data if needed
        if (needsChartFetch) {
          promises.push(
            fetchChartData(selectedYear).then((data) => {
              if (data) {
                setChartData(data, selectedYear);
              }
            })
          );
        }

        await Promise.all(promises);
        
        if (needsFetch) {
          setLastFetched(Date.now());
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [hasHydrated, forceRefresh, selectedYear, selectedLoanId]);

  // Handle year change
  const handleYearChange = async (year: string) => {
    setSelectedYear(year);
    
    // Check if we need to fetch data for this year
    if (shouldRefetchChart(year)) {
      setLoading(true);
      try {
        const data = await fetchChartData(year);
        if (data) {
          setChartData(data, year);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    }
  };

  // Refresh all dashboard data
  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsData, chartDataResult, timelineDataResult] = await Promise.all([
        fetchDashboardStats(selectedLoanId ?? undefined),
        fetchChartData(selectedYear),
        fetchTimelineData(),
      ]);

      if (statsData) {
        setStats(statsData);
      }
      if (chartDataResult) {
        setChartData(chartDataResult, selectedYear);
      }
      if (timelineDataResult) {
        setTimelineData(timelineDataResult);
      }

      setLastFetched(Date.now());
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    chartData,
    timelineData,
    selectedYear,
    loading: !hasHydrated || loading,
    error,
    handleYearChange,
    refresh,
    clearCache,
  };
};

export default useDashboard;
