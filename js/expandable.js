/**
 * Reference:
 * vAccordion - AngularJS multi-level accordion component
 * @version v1.5.1
 * @link http://lukaszwatroba.github.io/v-accordion
 * @author Łukasz Wątroba <l@lukaszwatroba.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function (angular) {

  var app = angular.module('krdExpandable', ['ngMaterial', 'ngAnimate']);

  app.constant('myConfig', {
    expandAnimationDuration: 0.5
  });

  app.controller("MyCtrl", function ($scope, $mdToast, $animateCss) {
    $scope.myVar = true;

  });

  app.animation('.menu-expanded', [ '$animateCss', function ($animateCss) {
    return {
      addClass: function (element, className, done) {
        var paneContent = angular.element(element[0].querySelector('menu-content')),
          paneInner = angular.element(paneContent[0].querySelector('div'));

        var height = paneInner[0].offsetHeight;

        var expandAnimation = $animateCss(paneContent, {
          easing: 'ease',
          from: { maxHeight: '0px' },
          to: { maxHeight: height + 'px' },
          duration: 0.5
        });

        expandAnimation.start().done(function () {
          paneContent.css('max-height', 'none');
          done();
        });

        return function (isCancelled) {
          if (isCancelled) {
            paneContent.css('max-height', 'none');
          }
        };

      },
      removeClass: function (element, className, done) {
        var paneContent = angular.element(element[0].querySelector('menu-content')),
          paneInner = angular.element(paneContent[0].querySelector('div'));

        var height = paneInner[0].offsetHeight;

        var collapseAnimation = $animateCss(paneContent, {
          easing: 'ease',
          from: { maxHeight: height + 'px' },
          to: { maxHeight: '0px' },
          duration: 0.5
        });

        collapseAnimation.start().done(done);

        return function (isCancelled) {
          if (isCancelled) {
            paneContent.css('max-height', '0px');
          }
        };
      }
    };
  } ]);



})(angular);
