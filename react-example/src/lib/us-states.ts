import type { FillLayer } from '@vis.gl/react-maplibre';

// Estados dos EUA - camada base
export const usStatesLayer: Omit<FillLayer, 'source'> = {
  id: 'us-states',
  type: 'fill',
  paint: {
    'fill-outline-color': 'rgba(0,0,0,0.3)',
    'fill-color': 'rgba(0,0,0,0.1)'
  }
};

// Estados dos EUA destacados
export const highlightUSStateLayer: Omit<FillLayer, 'source'> = {
  id: 'us-states-highlighted',
  type: 'fill',
  paint: {
    'fill-outline-color': '#484896',
    'fill-color': '#6e599f',
    'fill-opacity': 0.75
  }
};
