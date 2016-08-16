var tb = new KrdToolbox();

(function () {
  "use strict";

  var USE_COOKIES = false;
  var DEBUG_LEVEL = 2;
  var REDCAP = "REDCAP";
  var LOCAL = "LOCAL";

  var app = angular.module('Vand-AID', ['library-canvas', 'va-sidebox', 'ngResource', 'ngAnimate',
    'ngMaterial', 'ngSanitize', 'menuBar', 'va-topbar']);

  app.config(function ($mdThemingProvider) { // from http://mcg.mbitson.com/#/
    $mdThemingProvider.definePalette('vanderbiltPrimary', {
      "50": "#f6f2e9",
      "100": "#e0d3b2",
      "200": "#d0bd8a",
      "300": "#bca057",
      "400": "#af9146",
      "500": "#997f3d",
      "600": "#836d34",
      "700": "#6d5b2c",
      "800": "#574923",
      "900": "#41361a",
      "A100": "#f6f2e9",
      "A200": "#e0d3b2",
      "A400": "#af9146",
      "A700": "#6d5b2c",
      'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                          // on this palette should be dark or light
      'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
        '200', '300', '400', 'A100'],
      'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });

    $mdThemingProvider.definePalette('vanderbiltBlueAccent', {
      "50": "#bedce5",
      "100": "#87bfcf",
      "200": "#5faabe",
      "300": "#3e8599",
      "400": "#357283",
      "500": "#2c5f6d",
      "600": "#234c57",
      "700": "#1a3941",
      "800": "#12262c",
      "900": "#091316",
      "A100": "#bedce5",
      "A200": "#87bfcf",
      "A400": "#357283",
      "A700": "#1a3941",
      'contrastDefaultColor': 'light',
    });

    $mdThemingProvider.theme('default')
      .accentPalette('vanderbiltBlueAccent');

    $mdThemingProvider.theme('default')
      .primaryPalette('vanderbiltPrimary');
  });

  /**
   * *****************************************************************
   * App controller
   * *****************************************************************
   */
  app.controller("VandAIDApp", function ($http, $scope, $mdSidenav, $mdToast, $mdDialog, $mdMedia) {
    var self = this;

    var loadFields = function (user) {
      var filename = "/resources/metadata_export.json";

      $http.get(filename).then(
        // on success
        function (data) {
          // setTimeout(function () {
            console.log("timeout finished, initializing data");

            $scope.fm.initialize(data.data);

            if (typeof(user) != "undefined") {
              loadDefaults(user.key);
            } else {
              loadDefaults();
            }

          // }, 2000);

        }
        ,
        // on failure
        function () {
          console.log("failed to load fields from ", filename);
        }
      );
    };

    /**
     * Loads defaults for fields from a JSON file
     * @param username
     */
    var loadDefaults = function (username) {
      // Load status of selected items
      var fields_filename;
      if (typeof(username) != "undefined") {
        fields_filename = "/data/" + username + ".data.json";
      } else {
        fields_filename = "/resources/defaults_record_export.json";
      }

      console.log("Attempting to load from " + fields_filename);
      $http.get(fields_filename).then(
        // on default record found and loaded
        function (data) {
          $scope.fm.loadFieldValues(data.data[0]);
          console.log("Loaded values from " + fields_filename);
        },
        // on failure
        function () {
          console.log("Unable to load values from " + fields_filename);
          if (typeof(username) != "undefined") {
            loadDefaults();
          }

        }
      );
    };

    /**
     * Loads items from a JSON resource
     * @param filename
     * @param $resource
     */
    var loadItems = function (filename) {
      var defaultFilename = "/resources/items.json";

      if (typeof(filename) == "undefined") {
        filename = defaultFilename;
      }

      filename = defaultFilename;

      $http.get(filename).then(
        function (data) {
          // setTimeout(function() {
            console.log("timeout finished, initializing items");
            $scope.itemManager.initialize(data.data.items);

          // }, 3000);

        }, function () {
          showSimpleToast("Unable to find " + filename);

          // escape if fail at getting default
          if (filename == defaultFilename) return;
          loadItems();
        });
    };

    /**
     * Basic constructor for a {User} object
     * @constructor
     */
    function User() {
      this.id = "";
      this.key = "";
      this.name = "";
      this.logged_in = false;
      this.source = "";
      this.consented = false;
    }

    $scope.toggleToolbox = function (val) {
      if (typeof val === 'undefined') {
        val = $scope.tabData.hide;
      }

      $scope.tabData.hide = !val;
    };

    $scope.toggleSidenav = function (menuId) {
      $mdSidenav(menuId).toggle();
    };

    /**
     * Displays a short, unobtrusive message on the screen
     * @param toastContent The content of the message
     */
    var showSimpleToast = function (toastContent) {
      $mdToast.show(
        $mdToast.simple()
          .content(toastContent)
          .position('top right')
          .hideDelay(3000)
      );
    };

    var originatorEv;
    this.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.addNewRecord = function (newKey) {
      console.log('attempting to add record: ' + newKey);

      // 'if' Checks to be sure not adding an element already in the array
      if ($scope.records.indexOf(newKey) == -1) $scope.records.push(newKey)
    };

    $scope.updateRecords = function (newKeysText) {
      $scope.records = [];

      var newKeysArray = newKeysText.split('\n');
      for (var i = 0; i < newKeysArray.length; i++) {
        $scope.addNewRecord(newKeysArray[i]);
      }
    };

    $scope.toggle = tb.toggle;
    $scope.exists = tb.exists;

    /** ***************************************************************
     *                    BEGIN VARIABLE DECLARATIONS
     * @type {Array}
     * ****************************************************************
     */

    $scope.isReady = false;

    $scope.fm = new FieldManager;
    $scope.itemManager = new ItemManager();

    var fmObserver = new Observer();
    fmObserver.update = function (newValue, oldValue) {
      if ($scope.fm.isReady && $scope.itemManager.isReady()) {
        $scope.isReady = true;
      }
    };
    $scope.fm.addObserver(fmObserver);

    var imObserver = new Observer();
    imObserver.update = function (newValue, oldValue) {
      $scope.isReady = $scope.fm.isReady && $scope.itemManager.isReady();
    };
    $scope.itemManager.addObserver(imObserver);

    $scope.vaOptions = {
      show_labels: false
    };

    $scope.records = [];

    $scope.apiData = "";

    $scope.showToolbox = true;
    $scope.showSettings = false;

    $scope.tabData = {
      selectedIndex: 0
    };

    $scope.selectedIndex = 0;

    $scope.updateSelected = function(newIndex) {
      $scope.user = new User();
      $scope.user.key = $scope.records[newIndex];

      loadFields($scope.user);
      loadItems();
    };

    $scope.$watch('selectedIndex', function(newValue, oldValue) {
      console.log("Updating selected index: " + $scope.selectedIndex);
      $scope.updateSelected($scope.selectedIndex);

    });
  });

  app.directive('elementList', function () {
    return {
      restrict: 'E',
      templateUrl: 'element-list.html'
    };
  });

  app.directive('username', function () {
    return {
      restrict: 'E',
      templateUrl: 'library/username.html',
      controller: function ($scope) {

      }
    }
  });

  app.directive('fieldPane', function() {
    return {
      restrict : 'E',
      templateUrl : 'field-pane.html',
      scope: true,
      link: function(scope, element, attrs) {
        scope.fieldAlign = attrs.fieldAlign || "vertical";
      },
      controller: function($scope) {
        $scope.$watch('isReady', function(newValue, oldValue) {
          // console.log('isReady: ' + newValue);

          if (newValue) {
            $scope.field = $scope.fm.fields[$scope.fieldId];
          }
        });

        $scope.field = $scope.fm.fields[$scope.fieldId];

        $scope.getWidgetType = function( fieldType ) {
          switch (fieldType) {
            case "radio":
            case "yesno":
            case "truefalse":
              return "fields/radio.html";
            case "checkbox":
              return "fields/checkbox.html";
            case "checklist":
              return "fields/checklist.html";
            case "text":
            case "notes":
            default:
              return "fields/text.html";
          }
        };
      },
      controllerAs: 'fieldCtrl'

    };

  });

})();

