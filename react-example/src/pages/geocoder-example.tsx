import { Map } from '@vis.gl/react-maplibre';
import GeocoderControl from '../components/geocoder-control';

export default function GeocoderExample() {
  return (
    <Map
      initialViewState={{
        longitude: -79.4512,
        latitude: 43.6568,
        zoom: 13
      }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
    >
      <GeocoderControl
        position="top-left"
        minLength={2}
        placeholder="Buscar localização..."
      />
    </Map>
  );
}
