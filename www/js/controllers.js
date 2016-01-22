angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state,Paths,PathStatus, Positioner,CentralCaller) {
		console.log("dash")
    

    var signal = function(){
      if (PathStatus.get($scope.path.status) == "En cours")
        CentralCaller.launchSignal($scope.path.id);
      else
        CentralCaller.stopSignal();
    }


    Paths.getCurrent(
        function(found){
          $scope.path = found;
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
          signal();
          $scope.goToMap = function(){
            $state.go("map");
          };
          $scope.goOut = function(){
            CentralCaller.stopSignal();
            $state.go("welcome");
          };
          $scope.updateState = function(newState){
              Paths.setCurrentState(newState, 
                function(pathFound){
                  $scope.path = pathFound;                   
                  $scope.pathStatus = PathStatus.get($scope.path.status);
                  $scope.pathStatusColor = PathStatus.getC($scope.path.status);
                  signal();
                },
                function(err){
                  console.log(err);
                });
          }
        },
        function(){ // impossible de trouver le trajet
          $state.go("welcome");
        }
    ); 
})



.controller('WelcomeCtrl', function($scope,$state, Paths){
  Paths.clearCurrent();
  $scope.now = new Date();
  $scope.path = {};
  $scope.errorStr = "";
   $scope.findPath = function(){
    Paths.get($scope.path.id, 
      function(pathFound){
        $scope.errorStr = "";
        if (pathFound) {
          Paths.setCurrent(pathFound.id);
          $state.go("dash");
        }
      },
      function(err){
        $scope.errorStr = "Aucun trajet correspondant";
        console.log("pas de trajets")
      }
    );


  }
})



.controller('MapCtrl', function($scope,$state, Paths, Positioner){  
    var directionsDisplay;
    var map;

    var initialize = function (latitude,longitude,cb) {
      directionsDisplay = new google.maps.DirectionsRenderer();
      var point = new google.maps.LatLng(latitude, longitude);
      var mapOptions = {
        zoom:7,
        center: point
      };
      map = new google.maps.Map(document.getElementById("map"), mapOptions);
      directionsDisplay.setMap(map);
      cb();
    };


    Paths.getCurrent(function(found){
      Positioner.getCurrentPosition(
        function(position){
          initialize(
            position.coords.latitude,
            position.coords.longitude,
            function(){
              Positioner.reverseGeoCode(
                parseFloat(found.end_latitude),
                parseFloat(found.end_longitude),
                function(results)  {
                  Positioner.calcRoute(
                    {lat: position.coords.latitude, lng: position.coords.longitude},
                    results[1].formatted_address,
                    function(routingResult){
                      directionsDisplay.setDirections(routingResult);
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
    },
    function(err){
      console.log(err);
    });

    


    



    $scope.goDash = function(){
      $state.go("dash");
    };
})



/*
   
  */