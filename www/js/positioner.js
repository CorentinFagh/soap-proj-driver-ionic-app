angular.module('starter.positioner', [])
.factory('Positioner', function ($cordovaGeolocation){
  
    var directionsService = new google.maps.DirectionsService();
    var geocoder = new google.maps.Geocoder;

	return {  	
	    calcRoute : function (org,dest,cb) {
			console.log("calcRoute")
			var request = {
				origin:org,
				destination:dest,
				travelMode: google.maps.TravelMode.DRIVING
			};

			directionsService.route(request, function(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					cb(result)
				}else{
					console.log("calcRoute ERROR", result);
				}
			});
	    },
	    reverseGeoCode : function (latitude,longitude,cb) {
			console.log("reverseGeoCode")

			var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
			geocoder.geocode({'location': latlng}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					if (results[1]) {
						destination = results[1].formatted_address;
						console.log(results[1])
						cb(results);
					}
					else {
						window.alert('No results found');
					}
				} 
				else {
					window.alert('Geocoder failed due to: ' + status);
				}
			});
	    },
	    getCurrentPosition : function (cb){
			console.log("getCurrentPosition")

			var posOptions = {timeout: 60000, enableHighAccuracy: false};
			$cordovaGeolocation
			.getCurrentPosition(posOptions)
			.then(function (position) {
				console.log("currentpos", position)
				cb(position);
			}, function(err) {
				console.log(err) // error
			});
		}
	}
})
.factory('CentralCaller', function (Positioner){
  	
	return {  
		launchSignal : function(){
			setInterval(function(){ 
				Positioner.getCurrentPosition(function(position){
					console.log("Ma position", position);
				})
			}, 10000);

		}
	}
});
  

    

    

    