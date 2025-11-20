import type { FillLayer } from '@vis.gl/react-maplibre';

// Cidades do Brasil - camada base
export const citiesLayer: Omit<FillLayer, 'source'> = {
  id: 'cities',
  type: 'fill',
  paint: {
    'fill-outline-color': 'rgba(0,0,0,0.1)',
    'fill-color': 'rgba(0,0,0,0.05)'
  }
};

// Cidades destacadas ao passar o mouse
export const highlightCityLayer: Omit<FillLayer, 'source'> = {
  id: 'cities-highlighted',
  type: 'fill',
  paint: {
    'fill-outline-color': '#009c3b',
    'fill-color': '#009c3b',
    'fill-opacity': 0.3
  }
};

// Cidades dos EUA - camada base
export const usaCitiesLayer: Omit<FillLayer, 'source'> = {
  id: 'usa-cities',
  type: 'fill',
  paint: {
    'fill-outline-color': 'rgba(0,0,0,0.1)',
    'fill-color': 'rgba(0,0,0,0.05)'
  }
};

// Cidades dos EUA destacadas ao passar o mouse
export const highlightUSACityLayer: Omit<FillLayer, 'source'> = {
  id: 'usa-cities-highlighted',
  type: 'fill',
  paint: {
    'fill-outline-color': '#484896',
    'fill-color': '#6e599f',
    'fill-opacity': 0.3
  }
};
