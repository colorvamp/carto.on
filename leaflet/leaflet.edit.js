	addEventListener('leaflet-map-create',function(e){
		var vertex = L.divIcon({iconSize:[8,8],className:'icon-vertex'});

		L.Control.Edit = L.Control.extend({
			_layer: false,
			_map: false,
			options: {
				position: 'topleft',
				editText: '',
				editTitle: 'Edit points',
			},

			onAdd: function (map) {
				var zoomName = 'leaflet-control-zoom',
				    container = L.DomUtil.create('div', zoomName + ' leaflet-bar'),
				    options = this.options;

				this._editButton = this._createButton(options.editText, options.editTitle,'fa fa-pencil',container, this._edit);
				this._map = map;

				return container;
			},

			onRemove: function (map) {
		
			},

			disable: function () {
				this._disabled = true;
				return this;
			},

			enable: function () {
				this._disabled = false;
				return this;
			},

			_edit: function (e) {
				if( this._disabled ){return false;}
				if( this._active ){
					this._map.removeLayer(this._layer);
					this._active = false;
					this._layer  = false;

					var event = new CustomEvent('leaflet-map-edit-finish',{'detail':{'map':this._map},'bubbles':true,'cancelable':true});
					this._map._container.dispatchEvent(event);

					return false;
				}

				this._active = true;
				if( !this._layer ){this._layer = L.layerGroup().addTo(this._map);}

				this._map.eachLayer(function(layer){
					if( layer instanceof L.Rectangle ){
						console.log('im an instance of L rectangle');
					}

					if( layer instanceof L.Polyline ){
						console.log('im an instance of L polyline');
						//console.log(layer);
					}

					if( layer instanceof L.Marker ){
						console.log('im an instance of L marker');
					}

					if( layer instanceof L.Polygon ){
						var latlngs = layer.getLatLngs();
						var geojson = layer.toGeoJSON();
						for( var i = 0; i < latlngs.length; i++ ){
							for( var j = 0; j < latlngs[i].length; j++ ){
								for( var k = 0; k < latlngs[i][j].length; k++ ){
									var marker = L.marker([latlngs[i][j][k].lat,latlngs[i][j][k].lng],{icon:vertex,draggable:true}).addTo(this._map);
									marker.on('drag',function(e){
										var marker = e.target;
										var position = marker.getLatLng();

										this.latlngs[this.i][this.j][this.k].lat = position.lat;
										this.latlngs[this.i][this.j][this.k].lng = position.lng;
								
										this.layer.setLatLngs(this.latlngs);
									}.bind({'layer':layer,'latlngs':latlngs,'geojson':geojson,'i':i,'j':j,'k':k}));

									this._layer.addLayer(marker);
								}
							}
						}
					}

					//if( layer.feature.geometry.type != 'MultiPolygon' ){return;}
				}.bind(this));
			},

			_createButton: function (html, title, className, container, fn) {
				var link = L.DomUtil.create('a', className, container);
				link.innerHTML = html;
				link.href = '#';
				link.title = title;

				L.DomEvent
				    .on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', fn, this)
				    .on(link, 'click', this._refocusOnMap, this);

				return link;
			}
		});

		e.detail.map.addControl(new L.Control.Edit());
	});
