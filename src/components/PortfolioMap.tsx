'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import MapGL, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre';
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { FeatureCollection, Point } from 'geojson';
import type { GeoJSONSource } from 'maplibre-gl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import 'maplibre-gl/dist/maplibre-gl.css';
import { EnergyLabel } from '@/components/PropertyCard';
import { buildingOperationalStats } from '@/data/buildingOperationalStats';
import { useThemeMode } from '@/theme-mode-context';
import type { Building } from '@/data/buildings';

// ── Types ──

interface PopupState {
  building: Building;
  longitude: number;
  latitude: number;
}

// ── Popup card ──

function BuildingPopup({ building }: { building: Building }) {
  const { themeColors: c } = useThemeMode();
  const stats = buildingOperationalStats[building.name];
  const energyRating = stats?.sustainability?.weiiRating;

  return (
    <Box sx={{ width: 210 }}>
      {building.image && (
        <Box
          component="img"
          src={building.image}
          alt={building.name}
          sx={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
        />
      )}
      <Box sx={{ p: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5, mb: 0.25 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.3 }}>
            {building.name}
          </Typography>
          {energyRating && <EnergyLabel rating={energyRating} size="small" />}
        </Box>
        {building.address && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.4 }}>
            {building.address}
          </Typography>
        )}
        <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            bgcolor: building.hasContract ? c.statusGood : c.statusOffline,
          }} />
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
            {building.hasContract ? 'Active contract' : 'No contract'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ── Constants ──

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? '';
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
const INTERACTIVE_LAYERS = ['clusters', 'unclustered-point'];

// ── Main component ──

interface PortfolioMapProps {
  buildings: Building[];
}

export default function PortfolioMap({ buildings }: PortfolioMapProps) {
  const { themeColors: c } = useThemeMode();
  const mapRef = useRef<MapRef>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);

  // Build GeoJSON — one feature per building using pre-computed coordinates
  const geojson = useMemo<FeatureCollection<Point>>(() => ({
    type: 'FeatureCollection',
    features: buildings.map(b => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
      properties: { name: b.name, hasContract: b.hasContract },
    })),
  }), [buildings]);

  // Build a lookup map for O(1) access on click
  const buildingByName = useMemo(
    () => new Map(buildings.map(b => [b.name, b])),
    [buildings]
  );

  const initialViewState = useMemo(() => {
    if (buildings.length === 0) return { longitude: 5.2913, latitude: 52.1326, zoom: 7 };
    const lngs = buildings.map(b => b.lng);
    const lats = buildings.map(b => b.lat);
    return {
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      zoom: 7,
    };
  }, [buildings]);

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) { setPopup(null); return; }

    const [lng, lat] = (feature.geometry as Point).coordinates;

    if (feature.layer.id === 'clusters') {
      const clusterId = feature.properties?.cluster_id;
      const source = mapRef.current?.getSource('buildings') as GeoJSONSource | undefined;
      source?.getClusterExpansionZoom(clusterId).then(zoom => {
        mapRef.current?.easeTo({ center: [lng, lat], zoom: zoom + 0.5, duration: 400 });
      });
    } else if (feature.layer.id === 'unclustered-point') {
      const building = buildingByName.get(feature.properties?.name);
      if (building) setPopup({ building, longitude: lng, latitude: lat });
    }
  }, [buildingByName]);

  const handleMouseEnter = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = 'pointer';
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = '';
  }, []);

  if (!MAPTILER_KEY) {
    return (
      <Box sx={{
        height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 1,
        bgcolor: c.bgSecondary, borderRadius: '12px', border: '1px dashed', borderColor: 'divider',
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>Map not configured</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
          Add <code>NEXT_PUBLIC_MAPTILER_KEY</code> to your <code>.env.local</code> file.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 'calc(100vh - 140px)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        mt: 3,
        '& .maplibregl-popup-content': {
          padding: 0,
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: `0 4px 20px ${c.shadowMedium}`,
        },
        '& .maplibregl-popup-close-button': {
          fontSize: '16px',
          color: c.textSecondary,
          padding: '4px 8px',
        },
        '& .maplibregl-ctrl-group': {
          borderRadius: '8px',
          overflow: 'hidden',
          border: `1px solid ${c.borderPrimary}`,
          boxShadow: `0 2px 8px ${c.shadow}`,
        },
      }}
    >
      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={INTERACTIVE_LAYERS}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        <NavigationControl position="bottom-right" showCompass={false} />

        <Source
          id="buildings"
          type="geojson"
          data={geojson}
          cluster
          clusterMaxZoom={13}
          clusterRadius={48}
        >
          {/* Cluster circle */}
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': c.brand,
              'circle-radius': ['step', ['get', 'point_count'], 22, 10, 28, 30, 34],
              'circle-stroke-width': 3,
              'circle-stroke-color': 'rgba(255,255,255,0.7)',
            }}
          />

          {/* Cluster count label */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 13,
            }}
            paint={{ 'text-color': '#ffffff' }}
          />

          {/* Individual pin */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': ['case', ['==', ['get', 'hasContract'], true], c.brand, c.statusOffline],
              'circle-radius': 9,
              'circle-stroke-width': 2.5,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>

        {popup && (
          <Popup
            longitude={popup.longitude}
            latitude={popup.latitude}
            anchor="bottom"
            offset={14}
            closeButton
            closeOnClick={false}
            onClose={() => setPopup(null)}
          >
            <BuildingPopup building={popup.building} />
          </Popup>
        )}
      </MapGL>
    </Box>
  );
}
