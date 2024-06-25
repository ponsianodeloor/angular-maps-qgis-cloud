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
    params: {
      'LAYERS': 'marcelino_mariduena,zonas', 'TILED': true
    },
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
            //console.log(html);
            //this.featureInfo = doc.body.innerHTML;

            const parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');

            console.log(doc.body.innerHTML);

            const tables = doc.querySelectorAll('table');

            let marcelinoData: any = {};
            let zonasData: any = {};

            for (let i = 0; i < tables.length; i++) {
              const table = tables[i];
              const layerRow = table.querySelector('tr');
              if (layerRow) {
                const layerName = layerRow.querySelector('td')?.textContent?.trim();
                if (layerName === 'marcelino_mariduena') {
                  const dataTable = tables[i + 1]; // The next table contains the data
                  marcelinoData = this.extractTableData(dataTable, ['id', 'area', 'nombre', 'codigo']);
                  i++; // Skip the next table as it has been processed
                } else if (layerName === 'zonas') {
                  const dataTable = tables[i + 1]; // The next table contains the data
                  zonasData = this.extractTableData(dataTable, ['id', 'zona', 'cod_cat']);
                  i++; // Skip the next table as it has been processed
                }
              }
            }

            console.log('marcelino_mariduena Data:', marcelinoData);
            console.log('zonas Data:', zonasData);

          });
      }
    });
  }

  extractTableData(table: HTMLTableElement, fields: string[]): any {
    const data: any = {};
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
      const cells = row.querySelectorAll('th, td');
      if (cells.length === 2) {
        const key = cells[0].textContent?.trim();
        const value = cells[1].textContent?.trim();
        if (key && fields.includes(key)) {
          data[key] = value;
        }
      }
    });

    return data;
  }



}
