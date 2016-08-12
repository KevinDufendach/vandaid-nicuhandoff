/**
 * Created by Kevin Dufendach, 3/3/2016
 */

(function () {
  "use strict";

  var sidebox = angular.module('va-sidebox', ['ngResource', 'ngAnimate', 'krdExpandable']);

  sidebox.directive('sidebox', function () {
    return {
      restrict: 'E',
      templateUrl: 'library/sidebox.html',
      scope: true,
      controller: function ($http, $scope) {
        var self = this;

        this.categorySM = new SelectionModel(true);


        this.activeItem = {};

        this.itemSettingsExpansionSM = new SelectionModel(true);

        $scope.$watch('isReady', function(newValue, oldValue) {
          if (newValue) {
            self.categorySM.insertAll($scope.itemManager.getCategoryIDs());
            self.categorySM.selectAll();

            self.itemSettingsExpansionSM.insertAll($scope.itemManager.getItemIDs());
            self.itemSettingsExpansionSM.selectAll();

          }

        });

        $scope.categoryClicked = function(categoryId) {
          self.categorySM.touch(categoryId);
        };

        $scope.itemSettingsClicked = function(itemId) {
          self.itemSettingsExpansionSM.touch(itemId);
        };

        this.configureItem = function(item) {
          $scope.itemManager.setActiveItem(item);
          self.currentStep = 1;
        }

      },

      controllerAs: "sideboxCtrl"

    };

  });

})();
