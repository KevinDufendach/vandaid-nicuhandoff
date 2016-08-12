/**
 * Created by dufendkr on 10/11/2015.
 */

function ItemManager() {
  "use strict";

  // Allows observers
  var observers = new ObserverList();

  function addObserver ( observer ){
    observers.add( observer );
  }

  function notify ( newValue, oldValue ){
    console.log('itemManager updating from ' + oldValue + ' to ' + newValue);

    var observerCount = observers.count();
    for(var i=0; i < observerCount; i++){
      observers.get(i).update( newValue, oldValue );
    }
  }

  /**
   * Constructor for an Item
   * @param options
   * @constructor
   */
  function Item( options ) {
    if (typeof (options) == "undefined") {
      options = {};
    }

    // some defaults
    this.name = options.name || "item not loaded";
    this.id = options.id || "id";
    this.fields = options.fields || [];
    this.fieldGroups = options.fieldGroups || [];
    this.labs = options.labs || [];
    this.component = options.component || "base.html";
    //noinspection JSPotentiallyInvalidUsageOfThis
    this.categories = options.categories || [];

    options.hasOwnProperty("disabled") ? this.disabled = options.disabled : this.disabled = false;
    this.selected = this.disabled; // set selected by default if the selection box is disabled
  }

  // Add to the prototype item a function for returning if the item has fields
  Item.prototype.hasFields = function() {
    return (this.fields.length > 0);
  };

  /**
   * Constructor for a Category
   * @param options
   * @constructor
   */
  function Category( options ) {
    if (typeof (options) == "undefined") {
      options = {};
    }

    this.name = options.name || "newCategory name";
    this.id = options.id || "newCategoryId";
    this.items = options.items || [];
    this.categoryFields = options.categoryFields || [];
  }

  /**
   * Creates hasFields prototype function for a category
   * @returns {boolean}
     */
  Category.prototype.hasFields = function() {
    return (this.categoryFields.length > 0);
  };

  /**
   * Initialize all items and categories
   *
   * @param jsonItemList
   */
  function initialize(jsonItemList) {
    // clear the itemList then add the items to the list using the template
    itemList = {};
    itemIDs = [];
    itemList.length = 0;

    // Create items from the constructor, and add them to the itemList
    var i, len;
    for (i = 0, len = jsonItemList.length; i < len; i++) {
      var newItem = new Item(jsonItemList[i]);

      if (!hasOwnProperty(itemList, newItem.id)) {
        itemList[newItem.id] = newItem;
        itemIDs.push(newItem.id);
        itemList.length++;
      } else {
        tb.extend(itemList[newItem.id], newItem);
      }
    }

    // Create categories
    // TODO: Need to make categories loaded dynamically, not static in this itemManager

    // associate each item in a category list with that category
    for (i = 0, len = categories.length; i < len; i++) {
      var cat = categories[i];

      var j, lenJ;
      for (j = 0, lenJ = cat.items.length; j < lenJ; j++) {
        if (!itemList.hasOwnProperty(cat.items[j])) continue;
        var item = itemList[cat.items[j]];

        if (!tb.contains.call(item.categories, cat)) {
          item.categories.push(cat);
        }
      }
    }


    // Set up the defaults
    try {
      activeItem = itemList[categories[0].items[0]];
    } catch(err) {
      console.log("Unable to set default activeItem");
      activeItem = new Item();
    }

    // set ready and notify observers
    // Notify observers that the fieldManager is ready
    var oldValue = ready;
    ready = true;
    notify( true, oldValue );

  }

  /**
   * Toggles whether an item is selected or not
   * @param itemId
   */
  function toggleSelected(itemId) {
    itemList[itemId].selected = !itemList[itemId].selected;
  }

  /**
   * Advances to a new item as defined by "advance." Will wrap. Advance default = 1
   * @param advance
   */
  function incrementActiveItem (advance, selectIfNoFields) {
    advance = typeof advance !== 'undefined' ? advance : 1; // sets to advance 1 by default
    selectIfNoFields = typeof selectIfNoFields !== 'undefined' ? selectIfNoFields : false; // set false by default

    var index = itemIDs.indexOf(activeItem.id);
    if (index < 0) return;

    var start = index;

    do {
      index = index + advance;

      // uses the modulus operator in case the index is now greater than (or less than) the itemList length
      index = index % itemIDs.length;

      while (index < 0 && itemIDs.length > 0) {
        index += itemIDs.length;
      }

      activeItem = itemList[itemIDs[index]];
    } while ( !selectIfNoFields && !(activeItem.fields.length > 0) && !(index == start) );
  }

  function setActiveItem( item , selectIfNoFields) {
    selectIfNoFields = typeof selectIfNoFields !== 'undefined' ? selectIfNoFields : false; // set false by default

    if (item instanceof Item && (selectIfNoFields || item.fields.length > 0)) {
      activeItem = item;
    }
  }

  function getItemsByCategory(categoryName) {

    // Locate the category index in the list
    var catIndex = tb.getIndexByProperty(categoryName, categories);
    // return empty category if not found
    if (catIndex == -1) return new Category();

    var cat = categories[catIndex];

    var result = [];
    for (var i = 0; i < cat.items.length; i++) {
      // Be sure the item exists
      if (!itemList.hasOwnProperty(cat.items[i])) continue;

      result.push(itemList[cat.items[i]]);
    }

    return result;
  }

  function isSelected(itemId){
    // If an array is passed, recursively look for all its items to be present
    if (itemId instanceof Array) {
      for (var i = 0; i < itemId.length; i++) {
        if (this.isSelected(itemId[i])) {
          return true
        }
      }

      return false;
    }

    if (!angular.isDefined(itemList[itemId])) {
      return false;
    }

    return itemList[itemId].selected;
  }

  function createInitialCategories() {

    var categories = [
      {
        "name": "General",
        "id": "GEN",
        "items": [

        ],
        "categoryFields": [
          "font_size"
        ]
      },
      {
        "name": "Identifiers",
        "id": "ID",
        "items": [
          "id_name","id_mrn","id_sex","id_birth_date","demog_team_name","demog_provider","demog_location"
        ]
      },
      {
        "name": "Status",
        "id": "STATUS",
        "items": [
          "status_age_weight", "status_vitals", "status_alerts", "status_by_system"
        ]
      },
      {
        "name": "Problems and Diagnoses",
        "id": "PROBS",
        "items": [
          "status_summary", "probs_icd"
        ]
      },
      {
        "name": "Respiratory",
        "id": "RESP",
        "items": [
          "resp_vent"
        ]
      },
      {
        "name": "FEN",
        "id": "FEN",
        "items": [
          "fen_intake", "fen_lines_fluids"
        ]
      },
      {
        "name": "Labs",
        "id": "LAB",
        "layout": "column",
        "categoryFields": [
          "ital_new_labs",
          "new_labs",
          "bold_out_of_range_labs"
        ],
        "items": [
          "lab_blood_gas","lab_electrolyte_panel","lab_cbc","lab_coag","lab_bili","lab_blood_type"
        ]
      },
      {
        "name": "Medications",
        "id": "MEDS",
        "items": [
          "meds_list"
        ]
      },
      {
        "name": "Workflow",
        "id": "EXTRAS",
        "items": [
          "extras_todo"
        ]
      },
      {
        "name": "Summary",
        "id": "SUMMARY",
        "categoryFields": [
          "summary_comments"
        ]
      }
    ];

    //var initialCategories = ["Identifiers","Status","Problems and Diagnoses","Respiratory","Fluids, Electrolytes, and Nutrition","Labs","Medications","Workflow"];

    var result = [];
    for (var i = 0; i < categories.length; i++) {
      result.push(new Category( categories[i] ));
    }

    return(result);

  }

  /**
   * Retuns a list of id's of items in an object
   * @param obj the object to iterate over
   * @returns {Array}
     */
  var getIds = function( obj ) {
    var result = [];
    if (!Array.isArray(obj)) return [];

    for (var i = 0, cnt = obj.length; i < cnt; i++) {
      if (obj[i].hasOwnProperty('id')) {
        result.push(obj[i].id);
      }
    }

    return result;
  };

  function getItemList() {
    return itemList;
  }

  function getItemIDs() {
    return itemIDs;
  }

  function getCategories() {
    return categories;
  }

  function getCategoryIDs(){
    return categoryIDs;
  }

  function getActiveItem() {
    return activeItem;
  }

  function isReady() {
    return ready;
  }

  var itemList = {};
  var itemIDs = [];
  var categories = createInitialCategories();
  var categoryIDs = getIds(this.categories);
  var activeItem = new Item();
  var ready = false;

  return {
    initialize: initialize,
    toggleSelected: toggleSelected,
    incrementActiveItem: incrementActiveItem,
    setActiveItem: setActiveItem,
    getItemsByCategory: getItemsByCategory,
    isSelected: isSelected,
    createInitialCategories: createInitialCategories,

    addObserver: addObserver,

    getItemList: getItemList,
    getItemIDs: getItemIDs,
    getCategories: getCategories,
    getCategoryIDs: getCategoryIDs,
    getActiveItem: getActiveItem,
    isReady: isReady
  };


}




