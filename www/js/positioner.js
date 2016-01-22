angular.module('starter.positioner', [])
.factory('Positioner', function ($cordovaGeolocation){
  
    var directionsService = new google.maps.DirectionsService();
    var geocoder = new google.maps.Geocoder;

	return {  	
	    calcRoute : function (org,dest,cb) {
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
			var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
			geocoder.geocode({'location': latlng}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					if (results[1]) {
						destination = results[1].formatted_address;
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
			var posOptions = {timeout: 60000, enableHighAccuracy: false};
			$cordovaGeolocation
			.getCurrentPosition(posOptions)
			.then(function (position) {
				cb(position);
			}, function(err) {
				console.log(err) // error
			});
		}
	}
})
.factory('CentralCaller', function (Positioner,ApiService){
	var intervalTask = null;
	var verbose = false;
	return {
		launchSignal : function(pathId){
			var signalSendingInterval = 30 * 1000; // 10 secondes
			if (!intervalTask)
				intervalTask = setInterval(function(){
					Positioner.getCurrentPosition(function(position){
						ApiService.postPosition(pathId,position,
							function(){
								if (verbose)console.log("Position envoyée");
							},
							function(){
								console.log("ERREUR - Position non envoyée")
							})
					})
				}, signalSendingInterval);

		},
		stopSignal : function(){
			if (intervalTask){
				if (verbose)console.log("signal stopped");
				clearInterval(intervalTask);
				intervalTask = null;
			}
		}
	}
});
  

    

    

    