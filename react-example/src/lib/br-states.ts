import type { FillLayer } from '@vis.gl/react-maplibre';

// Estados do Brasil - camada base
export const brStatesLayer: Omit<FillLayer, 'source'> = {
  id: 'br-states',
  type: 'fill',
  paint: {
    'fill-outline-color': 'rgba(0,0,0,0.3)',
    'fill-color': 'rgba(0,0,0,0.1)'
  }
};

// Estados do Brasil destacados
export const highlightBRStateLayer: Omit<FillLayer, 'source'> = {
  id: 'br-states-highlighted',
  type: 'fill',
  paint: {
    'fill-outline-color': '#484896',
    'fill-color': '#6e599f',
    'fill-opacity': 0.75
  }
};
