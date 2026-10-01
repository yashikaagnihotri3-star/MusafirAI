import { useRef } from "react";
import {
  GoogleMap,
  MarkerF,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Search } from "lucide-react";

const libraries = ["places"];

const defaultCenter = {
  lat: 28.6139,
  lng: 77.209,
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

function PlaceSearch({
  showMap = false,
  onPlaceSelected,
  className = "",
}) {
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    if (!autocompleteRef.current) {
      return;
    }

    const place = autocompleteRef.current.getPlace();

    if (!place || !place.geometry || !place.geometry.location) {
      return;
    }

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    const placeData = {
      name: place.name || "",
      address: place.formatted_address || "",
      location,
    };

    if (mapRef.current) {
      mapRef.current.panTo(location);
      mapRef.current.setZoom(15);
    }

    if (onPlaceSelected) {
      onPlaceSelected(placeData);
    }
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  if (loadError) {
    return (
      <div className={`place-search-error ${className}`}>
        Unable to load Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`place-search-loading ${className}`}>
        Loading Google Maps...
      </div>
    );
  }

  return (
    <div className={`place-search-component ${className}`}>

      <div className="place-search-input-wrapper">

        <Search size={19} />

        <Autocomplete
          onLoad={handleAutocompleteLoad}
          onPlaceChanged={handlePlaceChanged}
          options={{
            fields: [
              "name",
              "formatted_address",
              "geometry",
            ],
          }}
        >
          <input
            type="text"
            placeholder="Search a city, monument or place..."
          />
        </Autocomplete>

      </div>


      {showMap && (
        <div className="place-search-map">

          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={5}
            onLoad={handleMapLoad}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
              zoomControl: true,
            }}
          />

        </div>
      )}

    </div>
  );
}

export default PlaceSearch;