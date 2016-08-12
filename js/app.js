var tb = new KrdToolbox();

(function () {
  "use strict";

  var USE_COOKIES = false;
  var DEBUG_LEVEL = 2;
  var REDCAP = "REDCAP";
  var LOCAL = "LOCAL";

  var app = angular.module('Vand-AID', ['library-canvas',
    'library-properties', 'va-sidebox', 'ngResource', 'ngAnimate',
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
   * Cookie functions from http://www.w3schools.com/js/js_cookies.asp
   * @param cname
   * @param cvalue
   * @param exdays
   */
  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  }

  /**
   * Cookie functions from http://www.w3schools.com/js/js_cookies.asp
   * @param cname key of the cookie
   * @returns {*} string representation of a cookie value
   */
  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1);
      if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
  }

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

    /**
     * Checks for a GET request and loads the embedded username and key.
     * If not found, creates a "default" user
     * @returns {User}
     */
    var getUser = function () {
      /**
       * Check for GET requests with embedded username and key
       */

      var user = new User();
      user.id = tb.get("id") || "default";
      user.key = tb.get("key") || "undefined";
      user.name = user.id;
      user.consented = !!+tb.get("consent") || false;

      if (user.id != "default" && user.key != "undefined") {
        user.logged_in = true;
        user.source = "POST";
      } else {
        user.logged_in = false;
        user.source = "GENERATED";
        user.consented = true;
      }

      return user;
    };

    $scope.toggleToolbox = function (val) {
      if (typeof val === 'undefined') {
        val = $scope.tabData.hide;
      }

      $scope.tabData.hide = !val;
    };

    $scope.toggleSidenav = function (menuId) {
      $mdSidenav(menuId).toggle();
    };

    $scope.resetFields = function () {
      loadFields();
    };

    /**
     * Submits data to REDCap
     */
    $scope.submitData = function () {
      var data = $scope.fm.getREDCapFields($scope.user.id);
      // $scope.test_data = data;

      var pendingOps = 2;

      var redcapRequest = $http({
        method: "post",
        url: "/php/saveToREDCap.php",
        data: {
          user: $scope.user,
          fields: data
        }
      });

      redcapRequest.success(function (returnData) {
        showSimpleToast("Data Submitted");
        console.log("Submitted to REDCap: " + returnData);

        $scope.test_data = returnData;
        $scope.dataSubmitted = true;

        pendingOps--;
        advanceWhenReady();
      });

      var jsonRequest = $http({
        method: "post",
        url: "/php/saveToJson.php",
        data: {
          user: $scope.user,
          fields: data
        }
      });

      jsonRequest.success(function (returnData) {
        console.log("Save to JSON: " + returnData);
        // showSimpleToast("Data Saved");
        pendingOps--;
        advanceWhenReady();
      });

      function advanceWhenReady() {
        if (pendingOps == 0) {
          var url = "/system-usability-scale.html?id=" + $scope.user.id + "&key=" + $scope.user.key + "&consent=" + ($scope.user.consented ? "1" : "0") ;

          window.location.href = url;
        }
      }
    };

    /**
     * Saves as a JSON file
     */
    $scope.saveData = function () {
      var data = $scope.fm.getREDCapFields($scope.user.id);

      var request = $http({
        method: "post",
        url: "/php/saveToJson.php",
        data: {
          user: $scope.user,
          fields: data
        }
      });

      request.success(function (data) {
        console.log("Save to JSON: " + data);
        // showSimpleToast("Data Saved");
      });
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

    function DialogController($scope, $mdDialog) {
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.answer = function (answer) {
        $mdDialog.hide(answer);
      };
    }

    $scope.showIRBDialog = function (ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

      $mdDialog.show({
          controller: DialogController,
          templateUrl: '/library/consent-dialog.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          fullscreen: useFullScreen
        })
        .then(function (answer) {
          if (answer == "accept") {
            $scope.irbConsent = true;
          } else {
            window.location.href = "/consent_declined.html";

            $scope.irbConsent = false;
          }

        }, function () {
          $scope.irbConsent = false;
        });


      $scope.$watch(function () {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function (wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });


    };

    $scope.showInstructions = function (ev) {
      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;

      $mdDialog.show({
        controller: DialogController,
        templateUrl: '/library/instructions.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: useFullScreen
      });

      $scope.$watch(function () {
        return $mdMedia('xs') || $mdMedia('sm');
      }, function (wantsFullScreen) {
        $scope.customFullscreen = (wantsFullScreen === true);
      });

    };

    var originatorEv;
    this.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
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


    $scope.apiData = "";

    $scope.showToolbox = true;
    $scope.showSettings = false;

    $scope.tabData = {
      selectedIndex: 0
    };



    $scope.user = getUser();
    console.log("Username: " + $scope.user.id);

    if (!$scope.user.consented) {
      window.location.href = "consent_declined.html";
    }

    if ($scope.user.logged_in) {
      loadFields($scope.user);
    } else {
      loadFields();
    }
    if (USE_COOKIES) setCookie("username", $scope.user.id, 365);
    loadItems();

    $scope.username = $scope.user.id;

    $scope.dataSubmitted = false;

    window.setTimeout(
      function() {
        $scope.saveData();
      },
      30000
    );

    $scope.needsSaveTip = false;

    // Set alert so user doesn't navigate away from page
    window.onbeforeunload = function () {
      if (!$scope.dataSubmitted && $scope.user.consented) {
        $scope.needsSaveTip = true;
        return "You have not submitted your design";
      }
    };

    // Register Ctrl+S
    // http://stackoverflow.com/questions/11362106/how-do-i-capture-a-ctrl-s-without-jquery-or-any-other-library
    var isCtrl = false;
    document.onkeyup = function (e) {
      if (e.keyCode == 17) { // capture ctrl key-up
        isCtrl = false;
      }
    };

    document.onkeydown = function (e) {
      if (e.keyCode == 17) { // be sure ctrl is down
        isCtrl = true;
      }
      if (isCtrl && e.keyCode == 83) {
        $scope.saveData();
        return false;
      }
    };


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

