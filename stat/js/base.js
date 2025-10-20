const placeData = [
  {
    id: "naya",
    name: "Naya Restaurant",
    coords: [32.8555349, 39.8864093],
    shortDescription: "The pearl of Atakule, the symbol of Ankara",
    longDescription:
      "Naya Restaurant is one of my favorite places to eat. The atmosphere is warm and elegant, and the staff are always friendly and helpful. The dishes are delicious, especially the main courses, which are full of flavor. Prices are fair for the quality you get. I always enjoy spending time there.",
    image: "../stat/img/naya.png",
  },
  {
    id: "liman",
    name: "Liman Restaurant",
    coords: [27.2530574, 37.8608303],
    shortDescription: "The rising star of the Aegean, the charm of Kuşadası",
    longDescription:
      "Right on the Aegean coast—literally right on the coast, almost in the sea!—it offers an amazing evening experience with your beloved friends and family, away from the summer hustle and bustle of the entire Kuşadası, among the sound of the waves. One of the most beloved features of this restaurant is that you can bring the fish you caught during the day and have the experts cook it for you...",
    image: "../stat/img/liman.jpg",
  },
  {
    id: "visorante",
    name: "Visorante Kitchen & Bar",
    coords: [29.0262584, 41.0493628],
    shortDescription: "Flavors meet the view of Ortaköy",
    longDescription:
      "Visorante is one of my favorite restaurants mainly because of its breathtaking view. I love enjoying a delicious meal while gazing over the city lights from the panoramic windows. The calm atmosphere and classy design make every visit feel special. It’s a perfect spot to unwind and appreciate both the scenery and the food.",
    image: "../stat/img/visorante.jpeg",
  },
];
window.map = new ol.Map({
  target: "map",
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat(placeData[0].coords),
    zoom: 6,
  }),
});
const placeLookup = new Map(placeData.map((place) => [place.id, place]));
const placeList = document.getElementById("placeList");
const cardRegistry = new Map();
let activePlaceId = null;
function createPlaceCard(place) {
  const card = document.createElement("article");
  card.className = "place-card";
  card.dataset.placeId = place.id;
  const toggle = document.createElement("button");
  toggle.className = "place-card__toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = `
    <span class="place-card__title">${place.name}</span>
    <span class="place-card__summary">${place.shortDescription}</span>
  `;
  const content = document.createElement("div");
  content.className = "place-card__content";
  content.setAttribute("aria-hidden", "true");
  const text = document.createElement("p");
  text.textContent = place.longDescription;
  const figure = document.createElement("figure");
  figure.className = "place-card__figure";
  const image = document.createElement("img");
  image.src = place.image;
  image.alt = `${place.name} için varsayılan görsel`;
  figure.appendChild(image);
  content.append(text, figure);
  card.append(toggle, content);
  toggle.addEventListener("click", () => {
    const shouldOpen = !card.classList.contains("is-open");
    if (shouldOpen) {
      activePlaceId = card.dataset.placeId;
    } else if (activePlaceId === card.dataset.placeId) {
      activePlaceId = null;
    }
    setCardOpen(card, shouldOpen);
  });
  image.addEventListener("load", () => {
    if (card.classList.contains("is-open")) {
      adjustContentHeight(content);
    }
  });
  return card;
}
function adjustContentHeight(contentEl) {
  contentEl.style.maxHeight = contentEl.scrollHeight + "px";
}
function setCardOpen(cardEl, shouldOpen) {
  const content = cardEl.querySelector(".place-card__content");
  const toggle = cardEl.querySelector(".place-card__toggle");
  const open = Boolean(shouldOpen);
  if (open) {
    cardEl.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    content.setAttribute("aria-hidden", "false");
    adjustContentHeight(content);
  } else {
    cardEl.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    content.setAttribute("aria-hidden", "true");
    content.style.maxHeight = "0px";
  }
}
if (placeList) {
  placeData.forEach((place) => {
    const card = createPlaceCard(place);
    placeList.appendChild(card);
    cardRegistry.set(place.id, card);
  });
}
const features = placeData.map((place) => {
  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat(place.coords)),
  });
  feature.set("placeId", place.id);
  return feature;
});
const styleCache = new Map();
function getMarkerStyle(place) {
  if (!styleCache.has(place.id)) {
    styleCache.set(
      place.id,
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 9,
          fill: new ol.style.Fill({ color: "#f564a9" }),
          stroke: new ol.style.Stroke({ color: "#ffffff", width: 2 }),
        }),
        text: new ol.style.Text({
          text: place.name,
          font: '600 14px "Arial", sans-serif',
          fill: new ol.style.Fill({ color: "#111" }),
          stroke: new ol.style.Stroke({ color: "#fff", width: 3 }),
          offsetY: -18,
        }),
      })
    );
  }
  return styleCache.get(place.id);
}
const vectorSource = new ol.source.Vector({
  features,
});
const vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: (feature) => {
    const placeId = feature.get("placeId");
    const place = placeLookup.get(placeId);
    return place ? getMarkerStyle(place) : null;
  },
});
window.map.addLayer(vectorLayer);
const mapExtent = ol.extent.createEmpty();
features.forEach((feature) => {
  ol.extent.extend(mapExtent, feature.getGeometry().getExtent());
});
if (!ol.extent.isEmpty(mapExtent)) {
  window.map.getView().fit(mapExtent, {
    padding: [80, 80, 80, 80],
    maxZoom: 9,
    duration: 600,
  });
}
window.map.on("singleclick", (event) => {
  let clickedPlaceId = null;
  window.map.forEachFeatureAtPixel(event.pixel, (feature) => {
    clickedPlaceId = feature.get("placeId");
    return true;
  });
  if (!clickedPlaceId) {
    if (activePlaceId) {
      closeAllCards();
      activePlaceId = null;
    }
    return;
  }
  if (activePlaceId === clickedPlaceId) {
    const activeCard = cardRegistry.get(clickedPlaceId);
    if (activeCard) {
      setCardOpen(activeCard, false);
    }
    activePlaceId = null;
    return;
  }
  closeAllCards();
  const card = cardRegistry.get(clickedPlaceId);
  if (card) {
    setCardOpen(card, true);
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    activePlaceId = clickedPlaceId;
  }
});
function closeAllCards() {
  cardRegistry.forEach((card) => {
    setCardOpen(card, false);
  });
  activePlaceId = null;
}
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAllCards();
  }
});
window.addEventListener("resize", () => {
  cardRegistry.forEach((card) => {
    if (card.classList.contains("is-open")) {
      adjustContentHeight(card.querySelector(".place-card__content"));
    }
  });
});
setTimeout(() => {
  if (window.map && typeof window.map.updateSize === "function") {
    window.map.updateSize();
  }
}, 200);
