angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state,Paths,PathStatus, Positioner,CentralCaller,Clock) {
		console.log("dash")
    

    $scope.now = new Date();
    Clock.launch(function(datedate){
      console.log("clock cb");
      $scope.now = datedate;
      $scope.$apply();
    });
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
          $scope.travelTimeEstim = "";
          $scope.travelTime = "";
          if ($scope.path.status == 5) {
              var start = $scope.path.start_date;
              var end = $scope.path.end_date;
              var inMinutes = Math.round((end-start)/1000/60);
              var hours = Math.trunc(inMinutes / 60);
              var minutes = inMinutes%60;
              $scope.travelTime = hours + ":" + minutes;
          };

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
                    $scope.travelTimeEstim = routingResult.routes[0].legs[0].duration.text;
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
            Paths.clearCurrent();
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



.controller('WelcomeCtrl', function($scope,$state, Paths, Clock){
  Paths.clearCurrent();
  $scope.now = new Date();
  Clock.launch(function(datedate){
    console.log("clock cb");
    $scope.now = datedate;
    $scope.$apply();
  });

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



.controller('MapCtrl', function($scope,$state, Paths, Positioner,Clock){  
    var directionsDisplay;
    var map;

    $scope.now = new Date();
    Clock.launch(function(datedate){
      console.log("clock cb");
      $scope.now = datedate;
      $scope.$apply();
    });

    var initialize = function (startLatitude,startLongitude,path) {
      directionsDisplay = new google.maps.DirectionsRenderer();
      var point = new google.maps.LatLng(startLatitude, startLongitude);
      var mapOptions = {
        zoom:7,
        center: point
      };
      map = new google.maps.Map(document.getElementById("map"), mapOptions);
      directionsDisplay.setMap(map);
      Positioner.reverseGeoCode(
              parseFloat(path.end_latitude),
              parseFloat(path.end_longitude),
              function(results)  {
                Positioner.calcRoute(
                  {lat: parseFloat(startLatitude), lng: parseFloat(startLongitude)},
                  results[1].formatted_address,
                  function(routingResult){
                    directionsDisplay.setDirections(routingResult);
                  }
                );
              }
            );
    };

    Paths.getCurrent(function(found){

      if (found.status == 5) { // si le trajet est terminé on affiche l'ensemble du trajet
        initialize(
            found.start_latitude,
            found.start_longitude,
            found
          );
      }
      else{
        Positioner.getCurrentPosition(
          function(position){
            initialize(
              position.coords.latitude,
              position.coords.longitude,
              found
            );
          }
        );
      }
    },
    function(err){
      console.log(err);
    });
    $scope.goDash = function(){
      $state.go("dash");
    };
})
