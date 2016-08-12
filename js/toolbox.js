/**
 * Created by dufendkr on 10/29/2015.
 */

function KrdToolbox() {
  "use strict";

  // Extend an object with values from another object
  this.extend = function(obj, extension) {
    for (var key in extension) {
      obj[key] = extension[key];
    }
  };

  this.toggle = function (item, list) {
    if (typeof list.indexOf !== "function") return;

    var idx = list.indexOf(item);
    if (idx > -1) list.splice(idx, 1);
    else list.push(item);
  };

  this.setSelected = function (item, list, value) {
    if (typeof list.indexOf !== "function") return;

    var idx = list.indexOf(item);

    if (idx > -1) {
      if (!value) list.splice(idx, 1); // exists & shouldn't, remove it
    }
    else if (value) list.push(item); // doesn't exist & should. Add it.
  };

  this.exists = function (item, list) {
    if (typeof list.indexOf !== "function") return;

    return list.indexOf(item) > -1;
  };

  /**
   * Returns true if an object is found in an array
   * http://stackoverflow.com/questions/1181575/determine-whether-an-array-contains-a-value
   * @param needle
   * @returns {boolean}
   */
  this.contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
      indexOf = Array.prototype.indexOf;
    } else {
      indexOf = function(needle) {
        var i = -1, index = -1;

        for(i = 0; i < this.length; i++) {
          var item = this[i];

          if((findNaN && item !== item) || item === needle) {
            index = i;
            break;
          }
        }

        return index;
      };
    }

    return indexOf.call(this, needle) > -1;
  };

  this.getIndexByProperty = function(id, list, propertyName) {
    if (typeof (propertyName) == "undefined" ) {
      propertyName = "id";
    }

    for (var i = 0; i < list.length; i++) {
      if (hasOwnProperty(list[i], propertyName) && list[i][propertyName] == id) {
        return i;
      }
    }

    return -1;
  };

  this.makeId = function(possible) {
    var text = "";
    if (typeof (possible) == "undefined") {
      possible = "ABCDEF0123456789";
    }

    for (var i = 0; i < 12; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  };

  this.addObjectToList = function(list, object) {
    list.push(object);
  };

  this.get = function(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
  };

  // http://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
  this.isInt = function (value) {
    var x;
    if (isNaN(value)) {
      return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
  };

  this.getAsDate = function(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    }
    return date;
  };

  /**
   * Frameshift adjusts a date to be relative to the current date according to the REFERENCE_DATE. Does NOT adjust time.
   */
  this.frameShiftDate = function(date, reference) {
    // var REFERENCE_DATE = new Date(2015,9,23,10,6,32,450); // reference date

    reference = reference || new Date();

    var result = new Date(this.getAsDate(date));

    var frameShift = this.midnightsBetween(reference, new Date());

    return (result.setDate(result.getDate() + frameShift));
  };

  this.roundDate = function(date) {
    return new Date(date - date.getHours()*60*60*1000 - date.getMinutes()*60*1000 - date.getSeconds()*1000 - date.getMilliseconds());
  };

  function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
  }

  this.midnightsBetween = function( startDate, endDate) {
    return(this.daysBetween(this.roundDate(this.getAsDate(startDate)), this.roundDate(this.getAsDate(endDate))));
  };

  this.daysBetween = function(startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
  }


}
