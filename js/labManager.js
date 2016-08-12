/**
 * Created by dufendkr on 10/11/2015.
 */




function LabManager($scope) {
  "use strict";
// http://addyosmani.com/resources/essentialjsdesignpatterns/book/#observerpatternjavascript

  /**
   * Distributor
   * Keeps a list of requests and distributes matching observations to requests as appropriate, removing
   * the completed request
   * */
  function DistributionList() {
    this.distRequests = new ObserverList();
  }

  DistributionList.prototype.addRequest = function (request) {
    var dl = this;
    //alert("attempting to add a lab");
    //this.distRequests.add( request );
    //alert(this.distRequests.count());
    this.distRequests.add(request);
    // after adding a request, queue a getLabs request for a later time (potentially after more requests are added)
    setTimeout(function () {
      if (dl.hasRequest) {
        self.getLabs();
        $scope.$apply();
      }
    }, 0);
  };

  DistributionList.prototype.createRequestTemplate = function (options) {
    return new LabRequest(options);
  };

  DistributionList.prototype.removeRequest = function (request) {
    this.distRequests.removeAt(this.distRequests.indexOf(request, 0));
  };

  DistributionList.prototype.notify = function (obs) {
    var codes = [];
    var code = null;
    var pid = null;

    if (checkNested(obs, 'code', 'coding') && checkNested(obs, 'subject', 'reference')) {
      codes = obs.code.coding;
      pid = obs.subject.reference;
    } else {
      return;
    }

    var requestCount = this.distRequests.count();

    for (var i = 0; i < requestCount; i++) {
      for (var j = 0; j < codes.length; j++) {
        if (codes[j].hasOwnProperty("code")) {
          code = codes[j].code;
        } else {
          continue;
        }

        var req = this.distRequests.get(i);
        if (pid === req.pid && code === req.loinc) {
          var lab = self.createLab(obs);

          if (!hasOwnProperty(self.labList, pid)) {
            self.labList[pid] = {};
          }
          self.labList[pid][code] = lab;

          req.onSuccess(lab);

          // remove the completed request
          this.distRequests.removeAt(i);

          // need to decrement i and requestCount since removed one
          i--;
          requestCount--;
        }
      }
    }
  };

  DistributionList.prototype.updateComplete = function () {
    var requestCount = this.distRequests.count();

    for (var i = 0; i < requestCount; i++) {
      this.distRequests.get(i).onFailure();
    }

    this.distRequests.clear();
  };

  DistributionList.prototype.hasRequest = function () {
    return (this.distRequests.count() > 0);
  };


  /**
   * A template observerList
   * @constructor
   */
  function ObserverList() {
    this.observerList = [];
  }

  ObserverList.prototype.add = function (obj) {
    return this.observerList.push(obj);
  };

  ObserverList.prototype.count = function () {
    return this.observerList.length;
  };

  ObserverList.prototype.get = function (index) {
    if (index > -1 && index < this.observerList.length) {
      return this.observerList[index];
    }
  };

  ObserverList.prototype.indexOf = function (obj, startIndex) {
    var i = startIndex;

    while (i < this.observerList.length) {
      if (this.observerList[i] === obj) {
        return i;
      }
      i++;
    }

    return -1;
  };

  ObserverList.prototype.removeAt = function (index) {
    this.observerList.splice(index, 1);
  };

  /**
   * A template LabRequest (an observer)
   * @param options
   * @constructor
   */
  function LabRequest(options) {
    this.pid = options.pid || "";
    this.loinc = options.loinc || "";
    this.onSuccess = options.onSuccess || function (lab) {
      };
    this.onFailure = options.onFailure || function () {
      };
  }


  /**
   *  A function to check a reference range
   */
  var isInRefRange = function (obs) {
    if (obs.hasOwnProperty('referenceRange')) {
      var val = obs.valueQuantity.value;
      var ref = obs.referenceRange[0];

      // check the ref low and high if exist, and if in such a range return value
      return (
        // check that ref either does not contain a "low" or that the value is greater than it
        // same for "high"
        ((!hasOwnProperty(ref, "low") || (val >= ref.low.value)) &&
        (!hasOwnProperty(ref, "high") || (val <= ref.high.value)))
      );
    }

    return true;
  };

  /** http://stackoverflow.com/questions/2631001/javascript-test-for-existence-of-nested-object-key */
  function checkNested(obj /*, level1, level2, ... levelN*/) {
    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < args.length; i++) {
      if (!obj || !obj.hasOwnProperty(args[i])) {
        return false;
      }
      obj = obj[args[i]];
    }
    return true;
  }

  // end stackoverflow solution

  /**
   * Begins the LabManager
   * @type {LabManager}
   */

  var self = this;
  this.labList = {};
  this.observationList = [];
  this.distributionList = {};
  tb.extend(this.distributionList, new DistributionList());

  this.createRequestTemplate = function (options) {
    return (self.distributionList.createRequestTemplate(options));
  };
  this.addRequest = function (req) {
    // if the labList already contains this value, return it.
    if (checkNested(this.labList, req.pid, req.loinc)) {
      req.onSuccess(this.labList[req.pid][req.loinc]);
    } else {
      // otherwise, submit a new request
      self.distributionList.addRequest(req);
    }
  };

  this.initialize = function ($http, $scope) {
    $http.get('/scenarios/observations.json').success(function (data) {
      self.observationList = data;

      //$scope.$apply();
    });
  };

  /** A lab factory for returning the contents of a lab observation */
    // define skeleton
  this.createLab = function (obs) {
    //alert('Attempting to create lab');

    return {
      exists: true,
      loinc: obs.code.coding[0].code,
      pid: obs.subject.reference,
      value: obs.valueQuantity.value,
      units: obs.valueQuantity.units,
      display: obs.code.coding[0].display,
      effectiveElapsed: $scope.timeElapsed(new Date(obs.effectiveDateTime), "m"),
      issuedElapsed: $scope.timeElapsed(new Date(obs.issued), "m"),
      isInRefRange: isInRefRange(obs)
    };
  };

  /**
   * A means of getting lab values
   * */
  this.getLabs = function () {
    for (var i = 0; i < self.observationList.length; i++) {

      self.distributionList.notify(self.observationList[i]);

    }
  };

  return {
    initialize: this.initialize,
    //getLab: this.getLab,
    createRequestTemplate: this.createRequestTemplate,
    addRequest: this.addRequest
    //getObserver: this.getObserver,
    //addRequest: this.subj.addObserver
  };
}

