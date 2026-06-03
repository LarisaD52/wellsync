// src/hooks/useInfiniteResources.js
// ─────────────────────────────────────────────────────────────
// Gold Challenge: infinite scroll based on backend pagination.
// Fetches next page when user scrolls to bottom. Uses prefetch
// to load the next page before it's needed.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE  = "http://localhost:3001/api";
const PAGE_SIZE = 5;

export function useInfiniteResources(filters = {}) {
  const [items, setItems]           = useState([]);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(false);
  const [hasMore, setHasMore]       = useState(true);
  const prefetchCache               = useRef({});
  const observerRef                 = useRef(null);
  const sentinelRef                 = useRef(null);

  // ── Build query string ──────────────────────────────────────
  function buildQuery(p) {
    const params = new URLSearchParams({
      page:     String(p),
      pageSize: String(PAGE_SIZE),
    });
    if (filters.search)     params.set("search",     filters.search);
    if (filters.department) params.set("department", filters.department);
    if (filters.type)       params.set("type",       filters.type);
    if (filters.sortBy)     params.set("sortBy",     filters.sortBy);
    if (filters.order)      params.set("order",      filters.order);
    return params.toString();
  }

  // ── Fetch a page (with cache) ───────────────────────────────
  const fetchPage = useCallback(async (p) => {
    const key = buildQuery(p);
    if (prefetchCache.current[key]) return prefetchCache.current[key];

    const res  = await fetch(`${API_BASE}/resources?${key}`);
    const data = await res.json();
    prefetchCache.current[key] = data;
    return data;
  }, [filters]); // eslint-disable-line

  // ── Prefetch next page ──────────────────────────────────────
  const prefetchNext = useCallback((currentPage) => {
    if (currentPage < totalPages) {
      fetchPage(currentPage + 1).catch(() => {});
    }
  }, [fetchPage, totalPages]);

  // ── Load next page ──────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const data = await fetchPage(page);
      setItems(prev => page === 1 ? data.data : [...prev, ...data.data]);
      setTotalPages(data.pagination.totalPages);
      setHasMore(page < data.pagination.totalPages);
      setPage(p => p + 1);
      // Prefetch next page immediately
      prefetchNext(page);
    } catch {
      console.error("[Infinite] Failed to load page", page);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchPage, prefetchNext]);

  // ── Reset when filters change ───────────────────────────────
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    prefetchCache.current = {};
  }, [JSON.stringify(filters)]); // eslint-disable-line

  // ── IntersectionObserver on sentinel element ────────────────
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore, loading]);

  // Initial load
  useEffect(() => {
    loadMore();
  }, []); // eslint-disable-line

  return { items, loading, hasMore, sentinelRef, totalPages };
}
