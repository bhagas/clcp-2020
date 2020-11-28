/**
 * Leaflet.draw assumes that you have already included the Leaflet library.
 */
L.drawVersion = '0.4.2';
/**
 * @class L.Draw
 * @aka Draw
 *
 *
 * To add the draw toolbar set the option drawControl: true in the map options.
 *
 * @example
 * ```js
 *      var map = L.map('map', {drawControl: true}).setView([51.505, -0.09], 13);
 *
 *      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
 *          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
 *      }).addTo(map);
 * ```
 *
 * ### Adding the edit toolbar
 * To use the edit toolbar you must initialise the Leaflet.draw control and manually add it to the map.
 *
 * ```js
 *      var map = L.map('map').setView([51.505, -0.09], 13);
 *
 *      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
 *          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
 *      }).addTo(map);
 *
 *      // FeatureGroup is to store editable layers
 *      var drawnItems = new L.FeatureGroup();
 *      map.addLayer(drawnItems);
 *
 *      var drawControl = new L.Control.Draw({
 *          edit: {
 *              featureGroup: drawnItems
 *          }
 *      });
 *      map.addControl(drawControl);
 * ```
 *
 * The key here is the featureGroup option. This tells the plugin which FeatureGroup contains the layers that
 * should be editable. The featureGroup can contain 0 or more features with geometry types Point, LineString, and Polygon.
 * Leaflet.draw does not work with multigeometry features such as MultiPoint, MultiLineString, MultiPolygon,
 * or GeometryCollection. If you need to add multigeometry features to the draw plugin, convert them to a
 * FeatureCollection of non-multigeometries (Points, LineStrings, or Polygons).
 */
L.Draw = {};

/**
 * @class L.drawLocal
 * @aka L.drawLocal
 *
 * The core toolbar class of the API — it is used to create the toolbar ui
 *
 * @example
 * ```js
 *      var modifiedDraw = L.drawLocal.extend({
 *          draw: {
 *              toolbar: {
 *                  buttons: {
 *                      polygon: 'Draw an awesome polygon'
 *                  }
 *              }
 *          }
 *      });
 * ```
 *
 * The default state for the control is the draw toolbar just below the zoom control.
 *  This will allow map users to draw vectors and markers.
 *  **Please note the edit toolbar is not enabled by default.**
 */
L.drawLocal = {
    draw: {
        toolbar: {
            // #TODO: this should be reorganized where actions are nested in actions
            // ex: actions.undo  or actions.cancel
            actions: {
                title: 'Batalkan Gambar',
                text: 'Batal'
            },
            finish: {
                title: 'Selesai menggambar',
                text: 'Selesai'
            },
            undo: {
                title: 'Hapus gambar terakhir',
                text: 'Hapus pergerakan terakhir'
            },
            buttons: {
                polyline: 'Draw a polyline',
                polygon: 'Menggambar polygon',
                rectangle: 'Draw a rectangle',
                circle: 'Draw a circle',
                marker: 'Draw a marker'
            }
        },
        handlers: {
            circle: {
                tooltip: {
                    start: 'Click and drag to draw circle.'
                },
                radius: 'Radius'
            },
            marker: {
                tooltip: {
                    start: 'Click map to place marker.'
                }
            },
            polygon: {
                tooltip: {
                    start: 'Klik untuk memulai menggambar.',
                    cont: 'Klik untuk melanjutkan gambar.',
                    end: 'Klik titik awal untuk menyelesaikan gambar.'
                }
            },
            polyline: {
                error: '<strong>Error:</strong> shape edges cannot cross!',
                tooltip: {
                    start: 'Click to start drawing line.',
                    cont: 'Click to continue drawing line.',
                    end: 'Click last point to finish line.'
                }
            },
            rectangle: {
                tooltip: {
                    start: 'Click and drag to draw rectangle.'
                }
            },
            simpleshape: {
                tooltip: {
                    end: 'Release mouse to finish drawing.'
                }
            }
        }
    },
    edit: {
        toolbar: {
            actions: {
                save: {
                    title: 'Simpan Perubahan.',
                    text: 'Simpan'
                },
                cancel: {
                    title: 'Batalkan Perubahan.',
                    text: 'Batal'
                }
            },
            buttons: {
                edit: 'Rubah layer.',
                editDisabled: 'Tidak ada layer yang di edit.',
                remove: 'Hapus layer.',
                removeDisabled: 'Tidak ada layer yang dihapus.'
            }
        },
        handlers: {
            edit: {
                tooltip: {
                    text: 'Drag, atau tandai untuk merubah fitur.',
                    subtext: 'Klik untuk membatalkan perubahan.'
                }
            },
            remove: {
                tooltip: {
                    text: 'Klik untuk menghapus layer'
                }
            }
        }
    }
};
