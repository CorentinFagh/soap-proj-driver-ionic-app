angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope,$cordovaGeolocation, Paths, Drivers, Trucks) {
		console.log("dash")

 		Paths.setCurrent(Paths.get(0)); // pour dev !

		$scope.path = Paths.getCurrent();
		$scope.driver =  Drivers.get($scope.path.driver_id);
		$scope.truck =  Trucks.get($scope.path.truck_id);

		$scope.remainingTime = "";
		console.log("path", $scope.path )
		console.log("driver", $scope.driver )
		console.log("truck", $scope.truck )

    console.log("geoloc")

    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var map;

    var geocoder = new google.maps.Geocoder;
    var destination = null;

    $scope.position = "";

    function initialize(latitude,longitude,cb) {
      console.log("initialize")
      directionsDisplay = new google.maps.DirectionsRenderer();
      var point = new google.maps.LatLng(latitude, longitude);
      var mapOptions = {
        zoom:7,
        center: point
      }
      map = new google.maps.Map(document.getElementById("map"), mapOptions);
      directionsDisplay.setMap(map);
      cb();
    }

    function calcRoute(org,dest,cb) {
      console.log("calcRoute")
      var request = {
        origin:org,
        destination:dest,
        travelMode: google.maps.TravelMode.DRIVING
      };
      directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(result);
          cb(result)
        }
      });
    }

    function reverseGeoCode(latitude,longitude,cb) {
        console.log("reverseGeoCode")

        var latlng = {lat: parseFloat($scope.path.end_latitude), lng: parseFloat($scope.path.end_longitude)};
        geocoder.geocode({'location': latlng}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
              destination = results[1].formatted_address;
              console.log(results[1])
              cb(results);
            } else {
              window.alert('No results found');
            }
          } else {
            window.alert('Geocoder failed due to: ' + status);
          }
        });
    }

    function getCurrentPosition(cb){
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
      console.log("let's start")

    getCurrentPosition(function(position){
      initialize(position.coords.latitude,position.coords.longitude,function(){
          reverseGeoCode(parseFloat($scope.path.end_latitude), parseFloat($scope.path.end_longitude),function(results)  {
            calcRoute(
              {lat: position.coords.latitude, lng: position.coords.longitude},
              results[1].formatted_address,
              function(routingResult){
                $scope.remainingTime = routingResult.routes[0].legs[0].duration.text;
                console.log("theend");
              }
              );
          });
      });
      reverseGeoCode(position.coords.latitude,position.coords.longitude, function(resultsCurrent){
          $scope.position = resultsCurrent[1].formatted_address;
      })
    });
  
})



.controller('WelcomeCtrl', function($scope,$state, Paths){
  $scope.now = new Date();
  $scope.path = {};
   $scope.findPath = function(){
    console.log("debut findpath " ,$scope.path.id);
    var pathFound = Paths.get($scope.path.id);
    if (pathFound) {

      console.log("trajets")
      //localstorage.path = pathFound;
      ;
      console.log("state params val " , pathFound );
      $state.go("dash");
    }
    else
      console.log("pas de trajets")


  }
})


