/**
 * Created by dufendkr on 11/2/2015.
 */
(function () {
  "use strict";

  var app = angular.module('patient-canvas', ['ngResource', 'ngSanitize']);

  app.controller('ptCtrl', function($scope) {
    this.totalIVFluids = 0;
    if ($scope.patient.hasOwnProperty("ivfluids")) {
      for (var i = 0; i < $scope.patient.ivfluids.length; i++) {
        var fluid = $scope.patient.ivfluids[i];
        this.totalIVFluids += fluid.rate * 24;
      }
    }

    this.totalEnteralFluids = 0;
    if (hasOwnProperty($scope.patient, "enteral_fluids")) {
      for (var i = 0; i < $scope.patient.enteral_fluids.length; i++) {
        var enteral = $scope.patient.enteral_fluids[i];
        this.totalEnteralFluids += enteral.volume * (24 / enteral.frequency)
      }
    }

    this.totalFluids = function() {
      return (this.totalIVFluids + this.totalEnteralFluids);
    }
  });

  app.directive('ptCanvas', function () {
    return {
      restrict: 'E',
      require: '^componentCanvas',
      scope: true,
      link: function (scope, element, attrs, canvasCtrl) {
        scope.pid = "unknown";
        if (attrs.hasOwnProperty('pid')) {
          scope.pid = attrs.pid;
        }
      },

      controller: function($scope) {
        $scope.hasItem = function(items) {
          for (var i = 0; i < items.length; i++) {
            if (hasOwnProperty(items[i], 'selected') && items[i].selected) {
              return true;
            }
          }

          return false;
        };
      },

      templateUrl: 'pt-canvas.html'
    };
  });

  app.directive('component', function( $compile ) {
    return {
      restrict: 'E',
      scope: true,
      link: function($scope, $element, $attr, ctrl) {

        var itemId = "unknown";
        if ($attr.hasOwnProperty('itemId')) {
          itemId = $attr.itemId;
        } else {
          return;
        }

        $scope.itemId = itemId;

        $scope.item = $scope.itemManager.getItemList()[itemId];

        if (typeof $scope.item == "undefined") return;

        $scope.getContentUrl = function() {
          return ("components/"+$scope.item.component);
        };

        // request labs from the labManager, return them asynchronously
        for (var i = 0; i < $scope.item.labs.length; i++) {
          var loinc = $scope.item.labs[i];

          $scope.labManager.addRequest($scope.labManager.createRequestTemplate(
            {
              pid: $scope.pid,
              loinc: loinc,
              onSuccess: function (lab) {
                ctrl.addLab(lab);
                ctrl.hasData = true;
              },

              onFailure: function () {
              }
            }
          ));
        }

      },
      controller: function () {
        this.data = {};
        this.hasData = false;

        var thisCtrl = this;

        this.addLab = function ( lab ) {
          this.data[lab.loinc] = lab;
        };

        this.hasAllLabs = function (labList) {
          for (var i = 0; i < labList.length; i++) {
            if (!hasOwnProperty(this.data, labList[i])) {
              return false;
            }
          }
          return true;
        };

        this.hasAny = function (labList) {
          for (var i = 0; i < labList.length; i++) {
            if (hasOwnProperty(this.data, labList[i])) {
              return true;
            }
          }
          return false;
        };

        this.getLab = function ( loinc ) {
          if (thisCtrl.data.hasOwnProperty(loinc)) {
            return thisCtrl.data[loinc];
          }
          return null;
        };

        this.getLabTime = function() {
          if (!this.hasData) {
            return 'none';
          }

          var returnTime = '';
        };

      },
      templateUrl: 'library/component.html',
      controllerAs: 'componentCtrl'
    }
  });

  app.directive('lab', function () {
    return {
      restrict: 'E',
      scope: true,
      link: function (scope, element, attrs) {
        scope.loinc = attrs.loinc;

        scope.labManager.addRequest(scope.labManager.createRequestTemplate(
          {
            pid: scope.pid,
            loinc: scope.loinc,
            onSuccess: function( lab ) {
              scope.lab = lab;
            },

            onFailure: function() {
            }
          }
        ));
      },
      template: "<span ng-class=\"{'out-of-range': fm.values.bold_out_of_range_labs == '1' && !lab.isInRefRange, 'italicize-labs': fm.values.ital_new_labs == '1' && lab.effectiveElapsed < fm.values.new_labs*60}\">{{lab.value.toString()}}</span>"
    };
  });

  app.directive('floatingLabel', function () {
    return {
      restrict: 'E',
      scope: true,
      transclude: true,
      templateUrl: '../library/floating-label.html'
    };
  });

  app.directive('contenteditable', ['$sce', function($sce) {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, element, attrs, ngModel) {
        if (!ngModel) return; // do nothing if no ng-model

        // Specify how UI should be updated
        ngModel.$render = function() {
          element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
        };

        // Listen for change events to enable binding
        element.on('blur keyup change', function() {
          scope.$evalAsync(read);
        });
        read(); // initialize

        // Write data to the model
        function read() {
          var html = element.html();
          // When we clear the content editable the browser leaves a <br> behind
          // If strip-br attribute is provided then we strip this out
          if ( attrs.stripBr && html == '<br>' ) {
            html = '';
          }
          ngModel.$setViewValue(html);
        }
      }
    };
  }]);


})();
