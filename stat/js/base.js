window.map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([32.85, 39.92]), 
    zoom: 6,
  }),
});

const marker = new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.fromLonLat([32.85, 39.92])),
});

const vectorSource = new ol.source.Vector({
  features: [marker],
});

const markerStyle = new ol.style.Style({
  text: new ol.style.Text({
    text: 'Ankara',
    font: 'bold 16px Arial, sans-serif',
    fill: new ol.style.Fill({ color: '#111' }),
    stroke: new ol.style.Stroke({ color: '#fff', width: 4 }),
    offsetY: -18,
  }),
});

const vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: markerStyle,
});

window.map.addLayer(vectorLayer);

setTimeout(() => {
  if (window.map && typeof window.map.updateSize === 'function') {
    window.map.updateSize();
  }
}, 200);
