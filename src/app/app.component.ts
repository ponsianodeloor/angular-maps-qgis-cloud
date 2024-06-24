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
  featureInfo: any;

  ngOnInit() {
    this.map = new ol.Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM() // This adds the OpenStreetMap layer
        }),
        new TileLayer({
          source: new TileWMS({
            url: 'https://qgiscloud.com/ponsianodeloor/marcelino_mariduena/wms',
            params: {'LAYERS': 'marcelino_mariduena', 'TILED': true},
            serverType: 'qgis',
            crossOrigin: 'anonymous',
          })
        })
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: fromLonLat([-79.4037, -2.2995]), // Replace with your map's center coordinates
        zoom: 10 // Adjust zoom level as needed
      })
    });

    this.map.on('click', this.onMapClick.bind(this));
  }

  // add a method to handle the map's click event
  onMapClick(event: any) {
    if (this.map && event) {
      let viewResolution = this.map.getView().getResolution();
      if (viewResolution === undefined) {
        viewResolution = 1; // Set a default value or handle the error
      }
      const coordinate = event.coordinate;
      this.map.getLayers().getArray().forEach((layer) => {
        if (layer instanceof TileLayer) {
          const wmsSource = layer.getSource();
          if (wmsSource instanceof TileWMS) {
            const url = wmsSource.getFeatureInfoUrl(
              coordinate,
              viewResolution,
              'EPSG:3857',
              {'INFO_FORMAT': 'application/json'}
            );
            if (url) {
              fetch(url)
                .then(response => response.json())
                .then(data => {
                  this.featureInfo = data;
                });
            }
          }
        }
      });
    } else {
      console.log('Map or event is undefined');
    }
  }



}
