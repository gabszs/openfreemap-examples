import { Map, Source, Layer, Popup } from '@vis.gl/react-maplibre';
import { useState, useMemo, useCallback } from 'react';
import type { ExpressionSpecification, MapLayerMouseEvent } from 'maplibre-gl';
import GeocoderControl from './components/geocoder-control';
import YouAreHere from './components/you-are-here';
import { citiesLayer, highlightCityLayer, usaCitiesLayer, highlightUSACityLayer } from './lib/map-styles';
import { brStatesLayer, highlightBRStateLayer } from './lib/br-states';

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

  const [zoom, setZoom] = useState(2.5);


  const selectedCity = (hoverInfoBR && hoverInfoBR.cityName) || '';
  const filterBR: ExpressionSpecification = useMemo(
    () => ['in', selectedCity || 'N/A', ['get', 'name']],
    [selectedCity]
  );

  const selectedUSACity = (hoverInfoUS && hoverInfoUS.cityName) || '';
  const filterUS: ExpressionSpecification = useMemo(
    () => ['in', selectedUSACity || 'N/A', ['get', 'name']],
    [selectedUSACity]
  );

  // Mostrar cidades apenas se zoom > 6
  const showCities = zoom > 6;

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features && event.features[0];
    if (!feature) return;

    // Verifica qual camada foi clicada
    const layerId = feature.layer?.id;

    // Verifica se é cidade do Brasil
    if (layerId === 'cities') {
      // Mapeia código IBGE para sigla do estado (primeiros 2 dígitos)
      const stateMap: Record<string, string> = {
        '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
        '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE', '29': 'BA',
        '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP',
        '41': 'PR', '42': 'SC', '43': 'RS',
        '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF'
      };
      const stateCode = feature.properties.id?.substring(0, 2);
      const stateName = stateMap[stateCode] || '';
      const cityName = feature.properties.name + (stateName ? `, ${stateName}` : '');

      setHoverInfoBR({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        cityName: cityName
      });
      setHoverInfoUS(null);
    }
    // Verifica se é estado dos EUA
    else if (layerId === 'usa-cities') {
      setHoverInfoUS({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        cityName: feature.properties.name
      });
      setHoverInfoBR(null);
    }
  }, []);

  const onMove = useCallback((evt: any) => {
    setZoom(evt.viewState.zoom);
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
      onMove={onMove}
      interactiveLayerIds={showCities ? ['cities', 'usa-cities'] : ['br-states', 'usa-cities']}
    >
      <GeocoderControl
        position="top-left"
        minLength={2}
        placeholder="Buscar localização..."
      />
      <YouAreHere />

      {/* Estados do Brasil (zoom baixo) */}
      {!showCities && (
        <Source
          id="br-states"
          type="geojson"
          data="https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson"
        >
          <Layer {...brStatesLayer} />
          <Layer {...highlightBRStateLayer} filter={filterBR} />
        </Source>
      )}

      {/* Cidades do Brasil (zoom alto) */}
      {showCities && (
        <Source
          id="cities"
          type="geojson"
          data="https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-100-mun.json"
        >
          <Layer {...citiesLayer} />
          <Layer {...highlightCityLayer} filter={filterBR} />
        </Source>
      )}

      {/* Cidades dos EUA */}
      <Source
        id="usa-cities"
        type="geojson"
        data="https://raw.githubusercontent.com/visgl/deck.gl-data/refs/heads/master/examples/arc/counties.json"
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