import { Map, Source, Layer, Popup } from '@vis.gl/react-maplibre';
import { useState, useMemo, useCallback } from 'react';
import type { ExpressionSpecification, MapLayerMouseEvent } from 'maplibre-gl';
import GeocoderControl from './components/geocoder-control';
import YouAreHere from './components/you-are-here';
import { middleOfUSA } from './lib/constants';
import { countiesLayer, highlightLayer } from './lib/map-styles';

export default function App() {
  const [hoverInfo, setHoverInfo] = useState<{
    longitude: number;
    latitude: number;
    countyName: string;
  } | null>(null);

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    const county = event.features && event.features[0];
    setHoverInfo({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      countyName: county && county.properties.name.split(',')[0]
    });
  }, []);

  const selectedCounty = (hoverInfo && hoverInfo.countyName) || '';
  const filter: ExpressionSpecification = useMemo(
    () => ['in', selectedCounty || 'N/A', ['get', 'name']],
    [selectedCounty]
  );

  return (
    <Map
      initialViewState={{
        longitude: middleOfUSA[0],
        latitude: middleOfUSA[1],
        zoom: 2
      }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      onMouseMove={onHover}
      interactiveLayerIds={['counties']}
    >
      <GeocoderControl
        position="top-left"
        minLength={2}
        placeholder="Buscar localização..."
      />
      <YouAreHere />

      <Source
        id="counties"
        type="geojson"
        data="https://raw.githubusercontent.com/visgl/deck.gl-data/refs/heads/master/examples/arc/counties.json"
      >
        <Layer {...countiesLayer} />
        <Layer {...highlightLayer} filter={filter} />
      </Source>

      {selectedCounty && (
        <Popup
          longitude={hoverInfo!.longitude}
          latitude={hoverInfo!.latitude}
          offset={[0, -10] as [number, number]}
          closeButton={false}
          className="county-info"
        >
          {selectedCounty}
        </Popup>
      )}
    </Map>
  );
}