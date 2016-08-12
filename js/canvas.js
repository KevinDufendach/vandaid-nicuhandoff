(function () {
  "use strict";

  // var REFERENCE_DATE = new Date('2015-09-23T10:06:32'); // reference date
  var REFERENCE_DATE = new Date(2015,8,23,16,6,32,450); // reference date
  var ONE_DAY_MS = 86400000; // milliseconds in a day

  var app = angular.module('library-canvas', ['ngResource', 'patient-canvas']);

  /**
   * Converts a number (days) to a combination of weeks and days
   */
  app.filter('weeksAndDays', function () {
    return function (number) {
      if (isNaN(number) || number < 0) {
        return number;
      }

      var wholeWeeks = Math.floor(number / 7);
      var wholeDays = number % 7;

      return wholeWeeks + '<sup>' + wholeDays + '</sup>';
      // return wholeWeeks + '<sup>' + wholeDays + '</sup>&frasl;<sub>7</sub>';
    }
  });

  /**
   * Displays age (given as an integer of days) as a reasonable value, e.g. weeks or months
   */
  app.filter('ageFilter', function () {
    return function (number) {
      if (isNaN(number) || number < 0) {
        return number;
      } else {
        return number + "d";
      }
      // else {
      //   var wholeWeeks = Math.floor(number / 7);
      //   var wholeDays = number % 7;
      //
      //   return wholeWeeks + " " + wholeDays + "/7w";
      // }
    }
  });

  app.filter('frameshiftDate', function () {

    return function (date, reference) {
      reference = reference || new Date();

      return tb.frameShiftDate(date, reference);
    }
  });




  app.directive('componentCanvas', function () {
    return {
      restrict: 'E',
      templateUrl: 'component-canvas.html',
      //scope: true,
      controller: function ($http, $scope) {

        $scope.labManager = new LabManager($scope);
        $scope.labManager.initialize($http);

        this.hasLabValue = function (patient, labList) {
          for (var i = 0; i < labList.length; i++) {
            if (hasOwnProperty(patient.labs, labList[i])) {
              return true;
            }
          }

          return false;
        };

        $scope.timeElapsed = function (date, type) {
          if (typeof (type) == "undefined") {
            type = "ms";
          }

          switch (type) {
            case "d":
              return (($scope.scenarioDate - date) / 864e5);
            case "h":
              return (($scope.scenarioDate - date) / 36e5);
            case "m":
              return (($scope.scenarioDate - date) / 6e4);
            case "s":
              return (($scope.scenarioDate - date) / 1000);
            default:
              return ($scope.scenarioDate - date);
          }
        };

        $scope.isNewLab = function (elapsedMins) {
          return (elapsedMins * 60 < $scope.fm.values.new_labs);
        };

        $scope.calcDOL = function (date, reference) {

          reference = reference || new Date();

          return (tb.midnightsBetween(date, reference));
        };

        $scope.calcSum = function (mainArray, arrayParameter) {
          var total = 0;
          for (var subItem in mainArray) {
            total += subItem[arrayParameter];
          }

          return total;
        };


        $scope.patients = [];
        $scope.scenarioDate = REFERENCE_DATE;

        $http.get('scenarios/patients.json').success(function (data) {
          $scope.$watch('isReady', function(newValue, oldValue) {
            // console.log('isReady: ' + newValue);

            if (newValue) {
              $scope.patients = data;
            }
          });

        });
      },
      controllerAs: "canvasCtrl"

    };

  });

})();

function hasOwnProperty(obj, prop) {
  var proto = obj.__proto__ || obj.constructor.prototype;
  return (prop in obj) &&
    (!(prop in proto) || proto[prop] !== obj[prop]);
}


// Define the skeleton PatientManager
function PatientManager() {
  var self = this;

  this.patients = [];
  this.selectedPt = "";

  this.initialize = function ($http) {
    $http.get('scenarios/patients.json').success(function (data) {
      self.patients = data;

    });

    return this;
  };

  this.getLab = function (patientId, labId) {
    return patients[patientId].labs[labId]; // TODO: add default value resolution
  };

  this.getPatients = function () {
    return patients;
  };
}
