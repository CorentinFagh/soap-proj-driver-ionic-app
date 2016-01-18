angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state,Paths,PathStatus, Positioner,CentralCaller) {
		console.log("dash")
    $scope.path = Paths.getCurrent();
    $scope.pathStatus = PathStatus.get($scope.path.status);
    $scope.pathStatusColor = PathStatus.getC($scope.path.status);
    $scope.departureAddress = "";
    $scope.arrivalAddress = "";
    $scope.travelTime = "";

    $scope.position = "";

    //Récupération de l'adresse de départ
    Positioner.reverseGeoCode(
      parseFloat($scope.path.start_latitude),
      parseFloat($scope.path.start_longitude),
      function(results)  {
        var departure = results[1].formatted_address;
        $scope.departureAddress = departure;
        $scope.$apply() 
      }
    );
    // récupération de l'adresse d'arrivée
    Positioner.reverseGeoCode(
      parseFloat($scope.path.end_latitude),
      parseFloat($scope.path.end_longitude),
      function(results)  {
        var arrival = results[1].formatted_address;
        $scope.arrivalAddress = arrival;
        $scope.$apply();

        // Récupération du temps de trajet
        Positioner.getCurrentPosition(function(position){
          Positioner.calcRoute(
            {lat: position.coords.latitude, lng: position.coords.longitude},
            arrival,
            function(routingResult){
              $scope.travelTime = routingResult.routes[0].legs[0].duration.text;
              $scope.$apply();
            }
          );
        });
        
      }
    );

    $scope.goToMap = function(){
      $state.go("map");
    };
    $scope.updateState = function(newState){
      console.log(newState);
      Paths.setCurrentState(newState);
      $scope.path = Paths.getCurrent();
      $scope.pathStatus = PathStatus.get($scope.path.status);
      $scope.pathStatusColor = PathStatus.getC($scope.path.status);
    };


    //CentralCaller.launchSignal();
})



.controller('WelcomeCtrl', function($scope,$state, Paths){
  window.localStorage['current-path'] = "";
  $scope.now = new Date();
  $scope.path = {};
   $scope.findPath = function(){
    console.log("debut findpath " ,$scope.path.id);
    var pathFound = Paths.get($scope.path.id);
    if (pathFound) {
      console.log("found : " , pathFound );
      Paths.setCurrent(pathFound);
      $state.go("dash");
    }
    else
      console.log("pas de trajets")
  }
})



.controller('MapCtrl', function($scope,$state, Paths, Positioner,CentralCaller){  
    $scope.path = JSON.parse(window.localStorage['current-path'] || '{}');

    var directionsDisplay;
    var map;

    var initialize = function (latitude,longitude,cb) {
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


    Positioner.getCurrentPosition(
      function(position){
        initialize(
          position.coords.latitude,
          position.coords.longitude,
          function(){
            Positioner.reverseGeoCode(
              parseFloat($scope.path.end_latitude),
              parseFloat($scope.path.end_longitude),
              function(results)  {
                Positioner.calcRoute(
                  {lat: position.coords.latitude, lng: position.coords.longitude},
                  results[1].formatted_address,
                  function(routingResult){
                    directionsDisplay.setDirections(routingResult);
                    console.log("theend");
                  }
                );
              }
            );
          }
        );
        Positioner.reverseGeoCode(position.coords.latitude,position.coords.longitude, function(resultsCurrent){
            $scope.position = resultsCurrent[1].formatted_address;
        })
      }
    );



    //CentralCaller.launchSignal();

})



/*
   
  */