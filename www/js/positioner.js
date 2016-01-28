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
.factory('CentralCaller', function (Positioner,ApiService,StubCaller){
	var intervalTask = null;
	var verbose = false;
	var stubbed = true;
	return {
		launchSignal : function(pathId){

			if (stubbed) {
				console.log("STUBBED - LAUNCHSIGNAL");
				StubCaller.launchSignal(pathId);
			}
			else{	
				var signalSendingInterval = 30 * 1000; // 10 secondes
				if (!intervalTask)
					intervalTask = setInterval(function(){
						Positioner.getCurrentPosition(function(position){
							position.timestamp = position.timestamp/1000;
							ApiService.postPosition(pathId,position,
								function(){
									if (verbose)console.log("Position envoyée");
								},
								function(){
									console.log("ERREUR - Position non envoyée")
								})
						})
					}, signalSendingInterval);
			}


		},
		stopSignal : function(){
			if (stubbed) {
				StubCaller.stopSignal();
			}
			else if (intervalTask){
				if (verbose)console.log("signal stopped");
				clearInterval(intervalTask);
				intervalTask = null;
			}
		}
	}
})
.factory('StubCaller', function (Positioner,ApiService){
	var intervalTask = null;
	var verbose = false;

	var pointer = 0;
	var data = [
		[44.855299, -0.567546],
		[44.854888, -0.568500],
		[44.855945, -0.569948],
		[44.856683, -0.569229],
		[44.858136, -0.567126],
		[44.860193, -0.564112],
		[44.862788, -0.560556],
		[44.863282, -0.559794],
		[44.864210, -0.558571],
		[44.865328, -0.559934],
		[44.866963, -0.562391],
		[44.868438, -0.564590],
		[44.869655, -0.566435],
		[44.870377, -0.566220],
		[44.872856, -0.565372],
		[44.876125, -0.564181],
		[44.879371, -0.562926],
		[44.882904, -0.561390],
		[44.884911, -0.561519],
		[44.887454, -0.560017],
		[44.888929, -0.560425],
		[44.890531, -0.562372],
		[44.891876, -0.565129],
		[44.894579, -0.565525],
		[44.896648, -0.565799],
		[44.898024, -0.564715]
	]

	return {
		launchSignal : function(pathId){
			var signalSendingInterval = 30 * 1000; // 10 secondes

			if (!intervalTask)
				intervalTask = setInterval(function(){
					var position = {
						timestamp : Math.floor(Date.now() / 1000),
						coords : {
							latitude : data[pointer][0],
							longitude : data[pointer][1]
						}
					};

					ApiService.postPosition(pathId,position,
						function(){
							if (verbose)console.log("Position envoyée");
						},
						function(){
							console.log("ERREUR - Position non envoyée")
						})

					pointer++;
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
  

    

    

    