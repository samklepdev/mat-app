import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { searchTreatmentFacilities, TreatmentFacility, SearchResult } from '../../api/findTreatment';
import { SearchFilters, FilterState, DEFAULT_FILTERS, RadiusMiles } from '../../components/features/SearchFilters';
import {
  saveProvider,
  removeProvider,
  isProviderSaved,
  getSavedProviders,
} from '../../db';
import { SavedProvider } from '../../types';

// ─── Facility card ────────────────────────────────────────────────────────────

function FacilityCard({
  facility,
  onSaveToggle,
  isSaved,
}: {
  facility: TreatmentFacility;
  onSaveToggle: (f: TreatmentFacility) => void;
  isSaved: boolean;
}) {
  const handleCall = () => {
    if (facility.phone) {
      Linking.openURL(`tel:${facility.phone.replace(/[^\d]/g, '')}`);
    }
  };

  const handleDirections = () => {
    const query = encodeURIComponent(
      `${facility.street1}, ${facility.city}, ${facility.state} ${facility.zip}`
    );
    Linking.openURL(`https://maps.apple.com/?address=${query}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName}>{facility.name}</Text>
            <Text
              style={[
                styles.sourceBadge,
                facility.source === 'samhsa' && styles.sourceBadgeSamhsa,
              ]}
            >
              {facility.source === 'samhsa' ? 'SAMHSA registry' : 'Google search'}
            </Text>
          </View>
          <Text style={styles.cardAddress}>
            {facility.street1}, {facility.city}, {facility.state} {facility.zip}
          </Text>
          <View style={styles.cardMetaRow}>
            <Text style={styles.cardDistance}>{facility.milesAway.toFixed(1)} mi away</Text>
            {facility.rating !== undefined && (
              <Text style={styles.cardRating}>
                ★ {facility.rating.toFixed(1)}
                {facility.ratingCount ? ` (${facility.ratingCount})` : ''}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onSaveToggle(facility)}
          hitSlop={10}
          style={styles.saveBtn}
        >
          <Text style={[styles.saveBtnText, isSaved && styles.saveBtnTextActive]}>
            {isSaved ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardActions}>
        {facility.phone && (
          <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
            <Text style={styles.actionBtnText}>Call</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={handleDirections}>
          <Text style={styles.actionBtnText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function FindCareScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<TreatmentFacility[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastCoordsRef = React.useRef<{ lat: number; lng: number } | null>(null);

  const filteredFacilities = facilities;

  const refreshSavedIds = useCallback(() => {
    const saved = getSavedProviders();
    setSavedIds(new Set(saved.map((p) => p.id as string)));
  }, []);

  useEffect(() => {
    refreshSavedIds();
  }, [refreshSavedIds]);

  const handleReset = () => {
    setFacilities([]);
    setHasSearched(false);
    setError(null);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location access is needed to find care near you.');
        setLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      lastCoordsRef.current = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      const result = await searchTreatmentFacilities({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        radiusMiles: filters.radiusMiles,
        page: 1,
      });

      console.log('[FindCare] results count:', result.facilities.length);
      console.log('[FindCare] first result:', result.facilities[0]?.name);
      setFacilities(result.facilities);
      setCurrentPage(1);
      setTotalPages(result.totalPages);
      setHasSearched(true);
    } catch (err) {
      console.log('[FindCare] error:', err);
      setError("Couldn't load nearby care right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = async (radius: RadiusMiles) => {
    if (!lastCoordsRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const result = await searchTreatmentFacilities({
        latitude: lastCoordsRef.current.lat,
        longitude: lastCoordsRef.current.lng,
        radiusMiles: radius,
        page: 1,
      });
      setFacilities(result.facilities);
      setCurrentPage(1);
      setTotalPages(result.totalPages);
    } catch {
      setError("Couldn't reload results. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!lastCoordsRef.current || loadingMore || currentPage >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await searchTreatmentFacilities({
        latitude: lastCoordsRef.current.lat,
        longitude: lastCoordsRef.current.lng,
        radiusMiles: filters.radiusMiles,
        page: nextPage,
      });
      setFacilities((prev) => [...prev, ...result.facilities]);
      setCurrentPage(nextPage);
      setTotalPages(result.totalPages);
    } catch {
      // silently fail — user can try again
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSaveToggle = (facility: TreatmentFacility) => {
    if (savedIds.has(facility.id)) {
      removeProvider(facility.id);
    } else {
      saveProvider({
        id: facility.id,
        name: facility.name,
        street1: facility.street1,
        city: facility.city,
        state: facility.state,
        zip: facility.zip,
        phone: facility.phone,
        website: facility.website,
        savedAt: new Date().toISOString(),
      });
    }
    refreshSavedIds();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View>
          <Text style={styles.title}>Find care</Text>
          <Text style={styles.sub}>
            MAT providers near you — methadone, buprenorphine, and naltrexone.
          </Text>
        </View>

        {/* Crisis banner — always visible, no search required */}
        <View style={styles.crisisBanner}>
          <Text style={styles.crisisTitle}>Need help today?</Text>
          <Text style={styles.crisisBody}>
            SAMHSA's National Helpline is free, confidential, and available 24/7.
          </Text>
          <TouchableOpacity
            style={styles.crisisButton}
            onPress={() => Linking.openURL('tel:1-800-662-4357')}
          >
            <Text style={styles.crisisButtonText}>Call 1-800-662-4357</Text>
          </TouchableOpacity>
        </View>

        {/* Saved providers link */}
        <TouchableOpacity
          style={styles.savedLink}
          onPress={() => router.push('/saved-providers')}
          activeOpacity={0.7}
        >
          <Text style={styles.savedLinkText}>
            ★ My saved providers {savedIds.size > 0 ? `(${savedIds.size})` : ''}
          </Text>
        </TouchableOpacity>

        {/* Filters — show once results are loaded */}
        {hasSearched && !loading && (
          <SearchFilters
            filters={filters}
            onChange={setFilters}
            resultCount={facilities.length}
            onRadiusChange={handleRadiusChange}
          />
        )}

        {/* Search */}
        {!hasSearched && !loading && (
          <View style={styles.searchPrompt}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              activeOpacity={0.8}
            >
              <Text style={styles.searchButtonText}>Search near me</Text>
            </TouchableOpacity>
            <Text style={styles.searchHint}>
              Uses your location to find providers within 25 miles. Nothing is
              saved or shared unless you choose to.
            </Text>
          </View>
        )}

        {loading && (
          <View style={styles.loadingState}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.loadingText}>Looking nearby…</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleSearch} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasSearched && !loading && !error && (
          <View style={styles.results}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsLabel}>
                {filteredFacilities.length} {filteredFacilities.length === 1 ? 'result' : 'results'}
              </Text>
              <TouchableOpacity onPress={handleReset} hitSlop={10}>
                <Text style={styles.resetButton}>Search again</Text>
              </TouchableOpacity>
            </View>
            {filteredFacilities.length === 0 ? (
              <Text style={styles.emptyText}>
                {facilities.length === 0
                  ? 'No MAT providers found within 50 miles. Try the National Helpline above — they can help you find options further out.'
                  : 'No results match your filters. Try removing some filters to see more providers.'}
              </Text>
            ) : (
              filteredFacilities.map((f) => (
                <FacilityCard
                  key={f.id}
                  facility={f}
                  isSaved={savedIds.has(f.id)}
                  onSaveToggle={handleSaveToggle}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg },
  title: { ...Typography.h1, marginBottom: 4 },
  sub: { ...Typography.bodySmall, lineHeight: 20 },

  crisisBanner: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primaryDim,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 6,
  },
  crisisTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  crisisBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  crisisButton: {
    marginTop: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  crisisButtonText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },

  savedLink: {
    paddingVertical: 10,
  },
  savedLinkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },

  searchPrompt: {
    gap: Spacing.sm,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  searchButtonText: {
    ...Typography.label,
    color: Colors.textInverse,
  },
  searchHint: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
  },

  loadingState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
  },

  errorState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  errorText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },

  results: { gap: Spacing.sm },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetButton: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  loadMoreButton: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  loadMoreText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  resultsLabel: {
    ...Typography.eyebrow,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
  },

  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  sourceBadge: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: Colors.textMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sourceBadgeSamhsa: {
    color: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  cardAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  cardDistance: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  cardRating: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  saveBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  saveBtnTextActive: {
    color: Colors.primary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
});
