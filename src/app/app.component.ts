import {Component, OnInit} from '@angular/core';
import * as ol from 'ol';
import {fromLonLat} from 'ol/proj';
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
  map: ol.Map | undefined;

  ngOnInit() {
    this.map = new ol.Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM() // This adds the OpenStreetMap layer
        }),
        new TileLayer({
          source: new TileWMS({
            url: 'https://qgiscloud.com/ponsianodeloor/marcelino_mariduena',
            params: {'LAYERS': 'marcelino_mariduena', 'TILED': true},
            serverType: 'qgis',
            crossOrigin: 'anonymous'
          })
        })
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: fromLonLat([-79.4037, -2.2995]), // Replace with your map's center coordinates
        zoom: 10 // Adjust zoom level as needed
      })
    });
  }
}
