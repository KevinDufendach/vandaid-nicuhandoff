(function () {
  "use strict";

  var app = angular.module('VA-minimal', ['ngMaterial']);

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
      'contrastDefaultColor': 'light'
    });

    $mdThemingProvider.theme('default')
      .accentPalette('vanderbiltBlueAccent');

    $mdThemingProvider.theme('default')
      .primaryPalette('vanderbiltPrimary');
  });

})();

