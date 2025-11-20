import { Map, Source, Layer, Popup, useMap } from '@vis.gl/react-maplibre';
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { ExpressionSpecification, MapLayerMouseEvent } from 'maplibre-gl';
import GeocoderControl from './components/geocoder-control';
import YouAreHere from './components/you-are-here';
import ThemeSelector, { type MapTheme } from './components/theme-selector';
import SearchHistory from './components/search-history';
import { citiesLayer, highlightCityLayer, usaCitiesLayer, highlightUSACityLayer } from './lib/map-styles';
import { brStatesLayer, highlightBRStateLayer } from './lib/br-states';
import { usStatesLayer, highlightUSStateLayer } from './lib/us-states';

export default function App() {
  const [hoverInfoBR, setHoverInfoBR] = useState<{
    longitude: number;
    latitude: number;
    cityName: string;
    pureName?: string; // Nome sem estado, para usar no filtro
  } | null>(null);

  const [hoverInfoUS, setHoverInfoUS] = useState<{
    longitude: number;
    latitude: number;
    cityName: string;
  } | null>(null);

  const [zoom, setZoom] = useState(2.5);
  const [theme, setTheme] = useState<MapTheme>('dark');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);


  const selectedCity = (hoverInfoBR && hoverInfoBR.cityName) || '';
  const selectedCityPure = (hoverInfoBR && hoverInfoBR.pureName) || selectedCity;

  // Filtro para cidades do Brasil (usa 'name')
  const filterBRCities: ExpressionSpecification = useMemo(
    () => ['in', selectedCityPure || 'N/A', ['get', 'name']],
    [selectedCityPure]
  );

  // Filtro para estados do Brasil (usa 'Estado')
  const filterBRStates: ExpressionSpecification = useMemo(
    () => ['in', selectedCity || 'N/A', ['get', 'Estado']],
    [selectedCity]
  );

  const selectedUSACity = (hoverInfoUS && hoverInfoUS.cityName) || '';

  // Filtro para condados dos EUA (usa 'name')
  const filterUSCounties: ExpressionSpecification = useMemo(
    () => ['in', selectedUSACity || 'N/A', ['get', 'name']],
    [selectedUSACity]
  );

  // Filtro para estados dos EUA (usa 'name')
  const filterUSStates: ExpressionSpecification = useMemo(
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

    // Verifica se é estado do Brasil (zoom baixo)
    if (layerId === 'br-states') {
      const stateName = feature.properties.Estado || feature.properties.SIGLA || '';

      setHoverInfoBR({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        cityName: stateName
      });
      setHoverInfoUS(null);
    }
    // Verifica se é cidade do Brasil (zoom alto)
    else if (layerId === 'cities') {
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
      const pureCityName = feature.properties.name;
      const cityName = pureCityName + (stateName ? `, ${stateName}` : '');

      setHoverInfoBR({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        cityName: cityName,
        pureName: pureCityName
      });
      setHoverInfoUS(null);
    }
    // Verifica se é estado dos EUA (zoom baixo)
    else if (layerId === 'us-states') {
      const stateName = feature.properties.name || '';

      setHoverInfoUS({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        cityName: stateName
      });
      setHoverInfoBR(null);
    }
    // Verifica se é condado dos EUA (zoom alto)
    else if (layerId === 'usa-cities') {
      setHoverInfoUS({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        cityName: feature.properties.name
      });
      setHoverInfoBR(null);
    }
  }, []);

  const onMove = useCallback((evt: { viewState: { zoom: number } }) => {
    setZoom(evt.viewState.zoom);
  }, []);

  const getThemeUrl = (theme: MapTheme) => `https://tiles.openfreemap.org/styles/${theme}`;

  // Carregar histórico do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Adicionar ao histórico quando houver resultado de busca
  const handleGeocoderResult = useCallback((evt: any) => {
    const result = evt.result;
    if (result && result.place_name) {
      setSearchHistory((prev) => {
        const newHistory = [result.place_name, ...prev.filter(item => item !== result.place_name)].slice(0, 5);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, []);

  // Selecionar do histórico
  const handleHistorySelect = useCallback((location: string) => {
    // Trigger search programmatically
    const geocoderInput = document.querySelector('.maplibregl-ctrl-geocoder input') as HTMLInputElement;
    if (geocoderInput) {
      geocoderInput.value = location;
      geocoderInput.dispatchEvent(new Event('input', { bubbles: true }));
      // Trigger enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      geocoderInput.dispatchEvent(enterEvent);
    }
  }, []);

  return (
    <Map
      initialViewState={{
        longitude: -60,
        latitude: 10,
        zoom: 2.5
      }}
      mapStyle={getThemeUrl(theme)}
      onMouseMove={onHover}
      onMove={onMove}
      interactiveLayerIds={showCities ? ['cities', 'usa-cities'] : ['br-states', 'us-states']}
    >
      <GeocoderControl
        position="top-left"
        minLength={2}
        placeholder="Buscar localização..."
        showResultsWhileTyping={true}
        onResult={handleGeocoderResult}
      />
      <SearchHistory
        history={searchHistory}
        onSelect={handleHistorySelect}
        position="top-left"
      />
      <ThemeSelector theme={theme} onThemeChange={setTheme} position="top-right" />
      <YouAreHere />

      {/* Estados do Brasil (zoom baixo) */}
      {!showCities && (
        <Source
          id="br-states"
          type="geojson"
          data="https://raw.githubusercontent.com/giuliano-macedo/geodata-br-states/main/geojson/br_states.json"
        >
          <Layer {...brStatesLayer} />
          <Layer {...highlightBRStateLayer} filter={filterBRStates} />
        </Source>
      )}

      {/* Cidades do Brasil (zoom alto) */}
      {showCities && (
        <Source
          id="cities"
          type="geojson"
          data="https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-100-mun.json"
          generateId={true}
        >
          <Layer {...citiesLayer} minzoom={6} maxzoom={24} />
          <Layer {...highlightCityLayer} filter={filterBRCities} minzoom={6} maxzoom={24} />
        </Source>
      )}

      {/* Estados dos EUA (zoom baixo) */}
      {!showCities && (
        <Source
          id="us-states"
          type="geojson"
          data="https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
        >
          <Layer {...usStatesLayer} />
          <Layer {...highlightUSStateLayer} filter={filterUSStates} />
        </Source>
      )}

      {/* Condados dos EUA (zoom alto) */}
      {showCities && (
        <Source
          id="usa-cities"
          type="geojson"
          data="https://raw.githubusercontent.com/visgl/deck.gl-data/refs/heads/master/examples/arc/counties.json"
          generateId={true}
        >
          <Layer {...usaCitiesLayer} minzoom={6} maxzoom={24} />
          <Layer {...highlightUSACityLayer} filter={filterUSCounties} minzoom={6} maxzoom={24} />
        </Source>
      )}

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