/**
 * Created by dufendkr on 3/13/2016.
 */

function SelectionModel(multipleAllowed) {
  "use strict";

  this.items = {};
  if (typeof multipleAllowed === "boolean") {
    this.multipleAllowed = multipleAllowed;
  } else {
    this.multipleAllowed = false;
  }
}

SelectionModel.prototype.checkExists = function (itemId) {
  return (this.items.hasOwnProperty(itemId))
};

SelectionModel.prototype.isSelected = function (itemId) {
  if (this.checkExists(itemId)) {
    return this.items[itemId];
  }

  return false;
};

/**
 * Sets the itemId to be selected. If the item does not exist, it is added to the SelectionModel.
 * If multipleAllowed is false, deselects all other items
 *
 * @param itemId
 */
SelectionModel.prototype.select = function (itemId) {
  if (!this.multipleAllowed) {
    this.deselectAll();
  }

  this.items[itemId] = true;
};

/**
 * If the itemId is not selected, same as select(itemId). Otherwise, deselects the item.
 *
 * @param itemId
 */
SelectionModel.prototype.touch = function (itemId) {
  if (this.checkExists(itemId) && this.items[itemId]) {
    this.items[itemId] = false;
  } else {
    this.select(itemId);
  }
};

SelectionModel.prototype.setMultipleAllowed = function (multipleAllowed) {
  if (typeof multipleAllowed == "boolean") {
    this.multipleAllowed = multipleAllowed;
  }
};

SelectionModel.prototype.insert = function (itemId) {
  if (!this.items.hasOwnProperty(itemId)) {
    this.items[itemId] = false;
  }
};

SelectionModel.prototype.insertAll = function (itemIds) {
  for (var i = 0, cnt = itemIds.length; i < cnt; i++) {
    this.insert(itemIds[i]);
  }
};

SelectionModel.prototype.setState = function (itemId, state) {
  this.items[itemId] = state;
};

SelectionModel.prototype.selectAll = function () {
  for (var item in this.items) {
    if (this.items.hasOwnProperty(item)) {
      this.items[item] = true;
    }
  }
};

SelectionModel.prototype.deselectAll = function () {
  for (var item in this.items) {
    if (this.items.hasOwnProperty(item)) {
      this.items[item] = false;
    }
  }
};

SelectionModel.prototype.clear = function () {
  this.items = {};
};





