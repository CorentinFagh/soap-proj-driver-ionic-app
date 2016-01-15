angular.module('starter.services', [])
.factory('Paths', function (){
  var paths = [
	  {
		id : 0,
		driver_id: 0,
		truck_id : 0,
		start_latitude :44.896582,
		start_longitude : -0.970305,
		end_latitude : 44.855111,
		end_longitude : -0.131080,		
		status :0,
		start_date : 1310669017,
		end_date : 	 1310697856
	  }
  ];

  var current = {};

return {
  get:function(pathId){
	console.log("Path.get - " + pathId)
	for (var i = 0; i < paths.length; i++) {
		if (paths[i].id === parseInt(pathId)) {
		  return paths[i];
		}
	  }
	  return null;
  },
  setCurrent : function(path) {
	current = path;
  },
  getCurrent : function() {
	return current;
  }
}

})
.factory('Drivers', function (){
  var drivers = [
	  {
		id : 0,
		name :"bob",
		phone : "0606060606"
	  }
  ];

return {
  get:function(driverId){
	for (var i = 0; i < drivers.length; i++) {
		if (drivers[i].id === parseInt(driverId)) {
		  return drivers[i];
		}
	  }
	  return null;
  }
}

})
.factory('Trucks', function (){
  var trucks = [
	  {
		id : 0,
		immatriculation : "df-56-gt"
	  }
  ];

return {
  get:function(truckId){
	for (var i = 0; i < trucks.length; i++) {
		if (trucks[i].id === parseInt(truckId)) {
		  return trucks[i];
		}
	  }
	  return null;
  }
}

})
.factory('PathStatus', function(){
	var status = [
		"En attente du chauffeur",
		"En route",
		"En pause",
		"Arrivé",
		"En panne"
	];

	return {
	  get:function(statusId){
		var res = status[statusId];
		if (res) return res;
		return null;
	  }
	}
})
;
