import { Map, Source, Layer, Popup } from '@vis.gl/react-maplibre';
import { useState, useMemo, useCallback } from 'react';
import type { ExpressionSpecification, MapLayerMouseEvent } from 'maplibre-gl';
import GeocoderControl from './components/geocoder-control';
import YouAreHere from './components/you-are-here';
import { citiesLayer, highlightCityLayer, usaCitiesLayer, highlightUSACityLayer } from './lib/map-styles';

export default function App() {
  const [hoverInfoBR, setHoverInfoBR] = useState<{
    longitude: number;
    latitude: number;
    cityName: string;
  } | null>(null);

  const [hoverInfoUS, setHoverInfoUS] = useState<{
    longitude: number;
    latitude: number;
    cityName: string;
  } | null>(null);


  const selectedCity = (hoverInfoBR && hoverInfoBR.cityName) || '';
  const filterBR: ExpressionSpecification = useMemo(
    () => ['in', selectedCity || 'N/A', ['get', 'nome']],
    [selectedCity]
  );

  const selectedUSACity = (hoverInfoUS && hoverInfoUS.cityName) || '';
  const filterUS: ExpressionSpecification = useMemo(
    () => ['in', selectedUSACity || 'N/A', ['get', 'name']],
    [selectedUSACity]
  );

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features && event.features[0];
    if (!feature) return;

    // Verifica se é cidade do Brasil
    if (feature.properties.nome) {
      setHoverInfoBR({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        cityName: feature.properties.nome
      });
      setHoverInfoUS(null);
    }
    // Verifica se é cidade dos EUA
    else if (feature.properties.name) {
      setHoverInfoUS({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        cityName: feature.properties.name
      });
      setHoverInfoBR(null);
    }
  }, []);

  return (
    <Map
      initialViewState={{
        longitude: -60,
        latitude: 10,
        zoom: 2.5
      }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      onMouseMove={onHover}
      interactiveLayerIds={['cities', 'usa-cities']}
    >
      <GeocoderControl
        position="top-left"
        minLength={2}
        placeholder="Buscar localização..."
      />
      <YouAreHere />

      {/* Cidades do Brasil */}
      <Source
        id="cities"
        type="geojson"
        data="https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-100-mun.json"
      >
        <Layer {...citiesLayer} />
        <Layer {...highlightCityLayer} filter={filterBR} />
      </Source>

      {/* Cidades dos EUA */}
      <Source
        id="usa-cities"
        type="geojson"
        data="https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
      >
        <Layer {...usaCitiesLayer} />
        <Layer {...highlightUSACityLayer} filter={filterUS} />
      </Source>

      {selectedCity && (
        <Popup
          longitude={hoverInfoBR!.longitude}
          latitude={hoverInfoBR!.latitude}
          offset={[0, -10] as [number, number]}
          closeButton={false}
          className="city-info"
        >
          {selectedCity}
        </Popup>
      )}

      {selectedUSACity && (
        <Popup
          longitude={hoverInfoUS!.longitude}
          latitude={hoverInfoUS!.latitude}
          offset={[0, -10] as [number, number]}
          closeButton={false}
          className="usa-city-info"
        >
          {selectedUSACity}
        </Popup>
      )}
    </Map>
  );
}