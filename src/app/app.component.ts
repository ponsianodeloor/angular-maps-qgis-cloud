import {Component, OnInit} from '@angular/core';
import {fromLonLat} from 'ol/proj';
import * as ol from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';
import View from 'ol/View';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'maps-qgis-cloud';
  //map: ol.Map | undefined;
  featureInfo: any;

  wmsSource = new TileWMS({
    url: 'https://qgiscloud.com/ponsianodeloor/marcelino_mariduena/wms',
    params: {'LAYERS': 'marcelino_mariduena', 'TILED': true},
    serverType: 'qgis',
    crossOrigin: 'anonymous',
  });

  wmsLayer = new TileLayer({
    source: this.wmsSource
  });

  view = new View({
    projection: 'EPSG:3857',
    center: fromLonLat([-79.4037, -2.2995]), // Replace with your map's center coordinates
    zoom: 10 // Adjust zoom level as needed
  });

  map: ol.Map = new ol.Map({});

  ngOnInit() {
    this.map = new ol.Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM() // This adds the OpenStreetMap layer
        }),
        this.wmsLayer
      ],
      view: this.view
    });

    this.map.on('click', this.onMapClick.bind(this));
  }

  // add a method to handle the map's click event
  onMapClick():void {
    this.map?.on('singleclick', (evt:ol.MapBrowserEvent<any>) => {
      const viewResolution = /** @type {number} */ (this.view.getResolution());
      let url;
      if (typeof viewResolution === "number") {
        url = this.wmsSource.getFeatureInfoUrl(
          evt.coordinate,
          viewResolution,
          'EPSG:3857',
          {'INFO_FORMAT': 'text/html'},
        );
      }
      if (url) {
        fetch(url)
          .then((response) => response.text())
          .then((html) => {
            console.log(html);
            this.featureInfo = html;
          });
      }
    });

  }

}
