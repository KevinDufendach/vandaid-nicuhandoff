/**
 * Created by Kevin Dufendach, 3/3/2016
 */

(function () {
  "use strict";

  var sidebox = angular.module('va-topbar', ['ngResource', 'ngAnimate', 'krdExpandable']);

  sidebox.directive('topBar', function () {
    return {
      restrict: 'E',
      templateUrl: 'top_identity_bar_standard_menu.html'
    };

  });

})();
