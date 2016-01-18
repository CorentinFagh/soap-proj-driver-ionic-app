angular.module('starter.services', [])
.factory('Paths', function (){
  var paths = [{
    "id": "1",
    "start_latitude": "44.896582",
    "start_longitude": "-0.970305",
    "end_latitude": "44.855111",
    "end_longitude": "-0.131080",
    "status": "2",
    "start_date": "2015-12-12 00:00:00",
    "end_date": "0000-00-00 00:00:00",
    "driver": {
        "id": "1",
        "name": "Eliott",
        "phone": "06 28 11 11 11"
    },
    "truck": {
        "id": "1",
        "immatriculation": "AZERTYY"
    }
}]; 

  var currentKey = "curent-path";

return {
  get:function(pathId){
	console.log("Path.get - " + pathId)
	for (var i = 0; i < paths.length; i++) {
		if (parseInt(paths[i].id) === parseInt(pathId)) {
			var res = paths[i];
			res.start_date = new Date(res.start_date);
			res.status = parseInt(res.status);
		  	return res;
		}
	  }
	  return null;
  },
  setCurrent : function(path) {
      window.localStorage[currentKey] = JSON.stringify(path);
  },
  getCurrent : function() {
    return JSON.parse(window.localStorage[currentKey] || '{}');
  },
  setCurrentState : function(newStatus){
  	var path = JSON.parse(window.localStorage[currentKey]);

  	path.status = newStatus;

    window.localStorage[currentKey] = JSON.stringify(path);
  }
}

})
.factory('PathStatus', function(){
	var status = [
		"En attente de départ",
		"En cours",
		"Pause",
		"En panne",
		"En réparation",
		"Trajet terminé"
	];
	var statusColor = [
		"calm",
		"balanced",
		"royal",
		"assertive",
		"energized",
		"positive"
	];
	return {
	  get:function(statusId){
		var res = status[statusId];
		if (res) return res;
		return null;
	  },
	  getC:function(statusId){
		var res = statusColor[statusId];
		if (res) return res;
		return null;
	  }
	}
})
;
