
L.mapbox.accessToken = 'pk.eyJ1Ijoid2lsbC1icmVpdGtyZXV0eiIsImEiOiItMTJGWEF3In0.HEvuRMMVxBVR5-oDYvudxw';

// Set up the map
var map = L.map('map')
  	.setView([37.8, -96], 4);

map.on('click',function(e){
	$('#info').fadeOut(200);
    $('#info').empty();
});

//Streetmap base layer
var streetmap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
}).addTo(map)

var markerClusters = new L.MarkerClusterGroup();
map.addLayer(markerClusters);
var markerData;

// Helper Functions
function placeMarkers(alumni, filter){
	for (var i = 0; i < alumni.length; i++) {
		var alum = alumni[i];
		if(filter){
			var n = filter.indexOf('=');
			if(n!==-1){
				var attr = filter.substring(0,n);
				filter = filter.substring(n+1,filter.length);
				switch(attr){
					case 'employeer':
						searchString = alum.employer;
						break;
					case 'address':
						searchString = alum.address;
						break;
					case 'name':
						searchString = alum.name;
						break;
				}
				searchString = searchString.toLowerCase();	
			}else{
				var searchString = alum.name + ' ' + alum.employer + ' ' + alum.address;
				searchString = searchString.toLowerCase();
			}
			if(searchString.indexOf(filter) !== -1){
				if(alum.lat&&alum.lng){
					addToMap(alum);
				}else{
					getLocationFromGoogle(alum,createMarkers);	
				}
			}
		}else{
			if(alum.lat&&alum.lng){
				addToMap(alum);
			}else{
				getLocationFromGoogle(alum,createMarkers);	
			}
		}
	}	
}

function addToMap(alum){
	var marker = L.marker(new L.LatLng(alum.lat, alum.lng), {
		name:alum.name,
		employer:alum.employer,
		card:'images/' + alum.name.toLowerCase().trim() + '.jpg',
		pic:'images/' + alum.name.toLowerCase().trim() + 'pic.jpg',
		twitter:alum.twitter
	});
	marker.on('click', markerClick);
	markerClusters.addLayer(marker);
}

function getLocationFromGoogle(alum, callback){
    $.ajax({
    	url:'http://maps.googleapis.com/maps/api/geocode/json',
    	data:{
    		address:alum.address + ' ' + alum.city + ' ' + alum.state + ' ' + alum.zip,
    		sensor:false
    	}
    }).done(function(data){
    	callback(data, alum);
    });  
}

function createMarkers(data, alum){
	var geom = data.results[0].geometry.location;

	var fileName = alum.name.toLowerCase().replace(' ','');
	
	var marker = L.marker(new L.LatLng(geom.lat, geom.lng), {
		name:alum.name,
		employer:alum.employer,
		address:alum.address,
		card:'images/' + fileName + '.jpg',
		pic:'images/' + fileName + 'pic.jpg',
		twitter:alum.twitter
	});
	marker.on('click', markerClick);
	markerClusters.addLayer(marker);
}

$('#search').keyup(search);
    
function search() {
	$('#info').fadeOut(200);
    var searchString = $('#search').val().toLowerCase();
    markerClusters.clearLayers();
    placeMarkers(markerData,searchString);
}

function markerClick(e) {
    $('#info').empty();
				    
	var feature = e.target.options;
	
	$('#info').fadeIn(400,function(){
		
	    var info = '';
	    
	    if(feature.pic){
	    	info = info + '<img class="head-shot" src="' + feature.pic + '" />';
	    }
	    
	    if(feature.name){
	    	info = info + '<p class="alumni-name">' + feature.name + '</p>';
	    }
	    
	    if(feature.employer){
	    	info = info + '<p>' + feature.employer + '</p>';
	    }
	    
	    if(feature.twitter){
	        info = info + '<iframe src="//platform.twitter.com/widgets/follow_button.html?screen_name='+feature.twitter+'" scrolling="no" frameborder="0" width="100%" height="21" allowtransparency="true" style="border:none;margin-top:4px;" data-show-count="false"></iframe>';
	    }
	    
	    if(feature.card){
	    	info = info + '<img class="bus-card" src="' + feature.card + '" />';
	    }
	    
	    $('#info').append(info);	
	});
};

// Set up the data source
var spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1OA829VRAVMviligJrVHs3A8F5EsFpn05z44wjq2-5MQ/pubhtml';

Tabletop.init( { 
	key: spreadsheetUrl,
    callback: function(data,tabletop){
    	markerData = data;
    	placeMarkers(markerData);
    },
    simpleSheet: true 
});