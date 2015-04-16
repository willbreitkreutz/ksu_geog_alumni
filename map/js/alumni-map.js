
var map = L.mapbox.map('map', 'will-breitkreutz.map-t6q8mkzo', {
		maxZoom:14
	})
  	.setView([37.8, -96], 4);

map.on('click',function(e){
	$('#info').fadeOut(200);
    $('#info').empty();
});


var markers = new L.MarkerClusterGroup();
var lat, lng;

var marker_array = [];
placeMarkers(alumniData);

function placeMarkers(alumni, filter){
	for (var i = 0; i < alumni.data.length; i++) {
		var alum = alumni.data[i];
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
	    id:alum.id,
		name:alum.name,
		employer:alum.employer,
		address:alum.address,
		card:alum.card,
		pic:alum.pic,
		twitter:alum.twitter
	});
	marker.on('click', markerClick);
	markers.addLayer(marker);
}

function getLocationFromGoogle(alum, callback){
    $.ajax({
    	url:'http://maps.googleapis.com/maps/api/geocode/json',
    	data:{
    		address:alum.address,
    		sensor:false
    	}
    }).done(function(data){
    	callback(data, alum);
    });  
}

function createMarkers(data, alum){
	var geom = data.results[0].geometry.location;
	
	for(var i=0;i<alumniData.data.length;i++){
	    if(alumniData.data[i].id===alum.id){
	        alumniData.data[i].lat = geom.lat;
	        alumniData.data[i].lng = geom.lng;
	    }
	}
	
	var marker = L.marker(new L.LatLng(geom.lat, geom.lng), {
	    id:alum.id,
		name:alum.name,
		employer:alum.employer,
		address:alum.address,
		card:alum.card,
		pic:alum.pic,
		twitter:alum.twitter
	});
	marker.on('click', markerClick);
	markers.addLayer(marker);
}

$('#search').keyup(search);
    
function search() {
	$('#info').fadeOut(200);
    var searchString = $('#search').val().toLowerCase();
    markers.clearLayers();
    placeMarkers(alumniData,searchString);
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
	    
	    // if(feature.twitter){
	    	// info = info + '<p class="twitter-handle"><a href="https://twitter.com/'+feature.twitter+'" class="twitter-follow-button" data-show-count="false">Follow me on twitter</a></p>'+
						  // '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?"http":"https";if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document, "script", "twitter-wjs");</script>';
	    // }
	    
	    if(feature.twitter){
	        info = info + '<iframe src="//platform.twitter.com/widgets/follow_button.html?screen_name='+feature.twitter+'" scrolling="no" frameborder="0" width="100%" height="21" allowtransparency="true" style="border:none;margin-top:4px;" data-show-count="false"></iframe>';
	    }
	    
	    if(feature.card){
	    	info = info + '<img class="bus-card" src="' + feature.card + '" />';
	    }
	    
		
	    $('#info').append(info);	
	});
};

map.addLayer(markers);
