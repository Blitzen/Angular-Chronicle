(function () {
  "use strict";
  //Set this to change what the maxiumum number of characters an undo will be to a string if using the string specific saving
  var MAX_STRING_CHANGE_SIZE = 5;
  var isDefined = angular.isDefined,
    isUndefined = angular.isUndefined,
    isFunction = angular.isFunction,
    isArray = angular.isArray,
    isString = angular.isString,
    isObject = angular.isObject,
    isDate = angular.isDate,
    forEach = angular.forEach,
    copy = angular.copy,
    bind = angular.bind;

  //These 3 functions are stolen from AngularJS to be able to use the modified angular.equals
  function isRegExp(value) {
    return toString.call(value) === '[object RegExp]';
  }
  function isWindow(obj) {
    return obj && obj.window === obj;
  }
  function isScope(obj) {
    return obj && obj.$evalAsync && obj.$watch;
  }
  //This is a modified version of angular.equals, allowing me to see exactly *what* isn't equal
  function equals(o1, o2) {
    if (o1 === o2) return {isEqual: true, unequalLocation: '', stringDiff: false, o1: o1, o2: o2};
    if (o1 === null || o2 === null) return {isEqual: false, unequalLocation: '', stringDiff: false, o1: o1, o2: o2};
    if (o1 !== o1 && o2 !== o2) return {isEqual: true, unequalLocation: '', stringDiff: false, o1: o1, o2: o2}; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 == t2) {
      if (t1 == 'string') {
        if (o1 != o2){
          return {isEqual: false, unequalLocation: '', stringDiff: true, o1: o1, o2: o2};
        }
      }
      if (t1 == 'object') {
        if (isArray(o1)) {
          if (!isArray(o2)) return {isEqual: false, unequalLocation: '', stringDiff: false, o1: o1, o2: o2};
          if ((length = o1.length) == o2.length) {
            for(key=0; key<length; key++) {
              var eq = equals(o1[key], o2[key]);
              if (!eq.isEqual){
                eq.unequalLocation = '['+String(key)+']' + eq.unequalLocation;
                return eq;
              }
            }
            return {isEqual: true, unequalLocation: '', stringDiff: false, o1: o1, o2: o2};
          }
        } else if (isDate(o1)) {
          return {isEqual: isDate(o2) && o1.getTime() == o2.getTime(), unequalLocation: '', stringDiff: false, o1: o1, o2: o2};
        } else if (isRegExp(o1) && isRegExp(o2)) {
          return {isEqual: o1.toString() == o2.toString(), unequalLocation: '', stringDiff: false, o1: o1, o2: o2};
        } else {
          if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2)) return {isEqual: false, unequalLocation: '', stringDiff: false, o1: o1, o2: o2};
          keySet = {};
          for(key in o1) {
            if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
            var eq = equals(o1[key], o2[key]);
            if (!eq.isEqual){
              eq.unequalLocation = '.'+String(key) + eq.unequalLocation;
              return eq;
            }
            keySet[key] = true;
          }
          for(key in o2) {
            if (!keySet.hasOwnProperty(key) &&
                key.charAt(0) !== '$' &&
                o2[key] !== undefined &&
                !isFunction(o2[key])) return {isEqual: false, unequalLocation: '', stringDiff: false, o1: o1, o2: o2};
          }
          return {isEqual: true, unequalLocation: '', stringDiff: false, o1: o1, o2: o2};
        }
      }
    }
    return {isEqual: false, unequalLocation: '', stringDiff: false, o1: o1, o2: o2};
  }

  //Given two strings, it compares the two and returns two things:
  //   -areSimilar: a boolean value which is true iff all the characters in the smaller string are contained, in the same order, in the bigger string
  //   -differences: an array which contains entries which are the seperated extras in the larger string. This is hard to explain so an example is useful:
  //
  //   Given the strings "abcdefghijklmnopqrstuvwxyz" and "abUUUcdefghijklmnopqrstuvwAAAAxyz123", the return value will be:
  //   { areSimilar: true (since the second one contains the first one in order)
  //   differences: ['UUU', 'AAAA', '123']}
  function similarStringDifference(string1, string2){
    var s1, s2;
    //Ensuring s2 is longer or the same length as s1
    if (string1.length > string2.length){
      s2 = string1.split("");
      s1 = string2.split("");
    }
    else{
      s1 = string1.split("");
      s2 = string2.split("");
    }
    var j = 0;
    var difference;
    var differences = [];
    for (var i = 0; (i < s1.length) && (j<s2.length); i++){
      difference = '';
      while(s1[i] != s2[j] && j<s2.length){
        difference += s2[j];
        j++;
      }
      //now s1[i] == s2[j] or j==s2.length
      if (difference) differences.push(difference);
      if (s1[i] == s2[j]) j++;
    }

    var areSimilar = (i == s1.length);
    if (j<s2.length){
      difference = '';
      while (j<s2.length){
        difference += s2[j];
        j++;
      }
      differences.push(difference);
    }
    return {areSimilar: areSimilar, differences: differences};
  }

  //This function determines if the differences in two strings provide a big enough difference to warrant a new spot in the archive

  //This function is given the difference array from similarStringDifference
  //This difference array will be in the following format:
  //  Given the strings "abcdefghijklmnopqrstuvwxyz" and "abUUUcdefghijklmnopqrstuvwAAAAxyz123", the difference array will be
  //  differences: ['UUU', 'AAAA', '123']
  //The differences are determined to be too similar if the following are true:
  //  There is only one entry in the array
  //  There are only alpha-numeric characters in the difference
  //  The difference is shorter than 10 characters
  function tooSimilar(differences){
    var whiteSpace = /\s/g;

    if (differences.length == 1){
      if (differences[0].length < 10){
        for (var a in differences[0]){
          if (differences[0][a].match(whiteSpace)){
            return false;
          }
        }
      }
      else{
        return false;
      }
    }
    else{
      return false;
    }
   return true;
  }

  angular.module('ngChronicle', []).service('Chronicle',
    function ($rootScope, $parse) {
      var watches = [];

      this.record = function record( watchVar, scope, stringHandling, noWatchVars ){
        var newWatch = new Watch(watchVar, scope, stringHandling, noWatchVars);
        watches.push(newWatch);
        return newWatch;
      };

      var Watch = function Watch(watchVar, scope, stringHandling, noWatchVars){
        //Initializing Watch
        if (!isString(watchVar)){
          throw new Error("Watch variable that is not a string was passed to Chronicle.");
        }
        //}
        else{
          this.watchVar = watchVar;
          this.parsedWatchVar = $parse(watchVar);
          if (isUndefined(this.parsedWatchVar(scope))){
            throw new Error(watchVar + ", the watch variable passed to Chronicle, is not defined in the given scope");
          }
        }

        if (isUndefined(scope)){
          throw new Error("Undefined scope passed to Chronicle.");
        }
        else{
          if (isScope(scope)){
            this.isScope = true;
          }
          else if (isObject(scope)){
            this.isScope = false;
          }
          else{
            throw new Error("Incorrect scope type passed to Chronicle.");
          }
          this.scope = scope;
        }

        if (stringHandling !== true && stringHandling !== 'true'){
          this.stringHandling = false;
        }
        else{
          this.stringHandling = true;
        }

        this.parsedNoWatchVars = [];
        if (isArray(noWatchVars)){
          for (var i in noWatchVars){
            if (!isString(noWatchVars[i])){
              throw new Error("Not all passed 'no watch' variables are in string format");
            }
            else {
              this.parsedNoWatchVars.push($parse(noWatchVars[i]));
              if (isUndefined(this.parsedNoWatchVars[i](scope))){
                throw new Error(noWatchVars[i] + ", a 'no watch' variable passed to Chronicle, is not defined in the given scope");
              }
            }
          }
        }
        else if (isString(noWatchVars)){
          this.parsedNoWatchVars.push($parse(noWatchVars));
        }
        else if (!isUndefined(noWatchVars)){
          throw new Error ("Incorect type for 'no watch' variables");
        }
        this.archive = [];
        this.onAdjustFunctions = [];
        this.onRedoFunctions = [];
        this.onUndoFunctions = [];
        this.currArchivePos = null;

        this.addWatch();
      };



      //Adds a function that will be called whenever a new archive entry is created
      Watch.prototype.addOnAdjustFunction = function addOnAdjustFunction(fn){
        this.onAdjustFunctions.push(fn);
      };

      //Removes a function that will is called whenever a new archive entry is created
      Watch.prototype.removeOnAdjustFunction = function removeOnAdjustFunction(fn){
        this.onAdjustFunctions.splice(this.onAdjustFunctions.indexOf(fn), 1);
      };



      //Adds a function that will be called whenever an undo happens
      Watch.prototype.addOnUndoFunction = function addOnUndoFunction(fn){
        this.onUndoFunctions.push(fn);
      };

      //Removes a function that is called whenever an undo happens
      Watch.prototype.removeOnUndoFunction = function removeOnUndoFunction(fn){
        this.onUndoFunctions.splice(this.onUndoFunctions.indexOf(fn), 1);
      };



      //Adds a function that will be called whenever an redo happens
      Watch.prototype.addOnRedoFunction = function addOnRedoFunction(fn){
        this.onRedoFunctions.push(fn);
      };

      //Removes a function that is called whenever an undo happens
      Watch.prototype.removeOnRedoFunction = function removeOnRedoFunction(fn){
        this.onRedoFunctions.splice(this.onRedoFunctions.indexOf(fn), 1);
      };



      //Performs the entire undo on the Watch object
      //Returns: true if successful undo, false otherwise
      Watch.prototype.undo = function undo() {
        if (this.canUndo()){
          this.currArchivePos -= 1;
          this.revert(this.currArchivePos);

          //Running the functions designated to run on undo
          for (var i = 0; i < this.onUndoFunctions.length; i++){
            this.onUndoFunctions[i]();
          }
          return true;
        }
        return false;
      };



      //Performs the entire redo on the Watch object
      //Returns: true if successful undo, false otherwise
      Watch.prototype.redo = function redo() {
        if (this.canRedo()){
          this.currArchivePos += 1;
          this.revert(this.currArchivePos);

          //Running the functions designated to run on redo
          for (var i = 0; i < this.onRedoFunctions.length; i++){
            this.onRedoFunctions[i]();
          }
          return true;
        }
        return false;
      };


      //Given an index in the archive, reverts all watched and non watched variables to that location in the archive
      Watch.prototype.revert = function revert(revertToPos){
        this.parsedWatchVar.assign(this.scope, copy(this.archive[revertToPos].watchVar));

        for (var i = 0; i < this.parsedNoWatchVars.length; i++){
          this.parsedNoWatchVars[i].assign(this.scope, copy(this.archive[revertToPos].noWatchVars[i]));
        }
      };



      //Returns true if a redo can be performed, false otherwise
      Watch.prototype.canRedo = function canRedo() {
        if (this.currArchivePos < this.archive.length-1){
          return true;
        }
        return false;
      };



      //Returns true if an undo can be performed, false otherwise
      Watch.prototype.canUndo = function canUndo() {
        if (this.currArchivePos > 0){
          return true;
        }
        return false;
      };


      //This function adds the current state of the watch variable and non watch variables if it should be added
      //In order to *not* be added, the following conditions must be fulfilled
      //  There is stringHandling turned on
      //  There was a String-related change since the last archived spot
      //  The differences in the strings from the new and last archive aren't significant (using tooSimilar)
      Watch.prototype.addToArchive = function addToArchive() {
        var shouldBeAdded = false, stringDiff = false;

        if (this.archive.length){
          //comparing to ensure there was a real change made and not just an undo/redo
          var eq = equals(this.parsedWatchVar(this.scope), this.archive[this.currArchivePos].watchVar);
          if(!eq.isEqual){
            shouldBeAdded = true;
            stringDiff = eq.stringDiff;
            var parsedUnequalLocation = $parse(this.watchVar + eq.unequalLocation);
            if (this.stringHandling && eq.stringDiff){
              var tooSim = false;
              var o1 = eq.o1;
              var o2 = eq.o2;
              var differenceObject = similarStringDifference(o1,o2);

              if (differenceObject.areSimilar){
                if (this.archive[this.currArchivePos].parsedUnequalLocation == parsedUnequalLocation){
                  //We only consider them too similar if the same variable was changed last time and this time and their differences are considered to not be big enough by tooSimilar()
                  //Too similar means the
                  var tooSim = tooSimilar(differenceObject.differences);
                  if (tooSim){
                    //Checks to see if the length of the string that was changed is more than MAX_STRING_CHANGE_SIZE characters in length different in the most recent entry than in the previous entry.
                    //($parse('watchVar'+eq.unequalLocation)(this.archive[this.currArchivePos-1]) is the most confusing part, it boils down as such:
                    //$parse('watchVar'+eq.unequalLocation) is the parsedUnequalLocation but swapping out 'watchVar' for this.watchVar (a string containing the name of the watch var in the scope)
                    //(this.archive[this.currArchivePos-1]) is the archive entry before the one we are on. We look at the one before because the one we are currently on is likely going to be overwritten.
                    if (Math.abs($parse('watchVar'+eq.unequalLocation)(this.archive[this.currArchivePos-1]).length - $parse('watchVar'+eq.unequalLocation)(this.archive[this.currArchivePos]).length) >= MAX_STRING_CHANGE_SIZE){
                      tooSim = false;
                    }
                  }
                }
              }
            }

          }
        }
        else{
          //Adding to the archive if there isn't an entry in the archive yet
          shouldBeAdded = true;
        }

        if (shouldBeAdded){
          this.newEntry(tooSim, parsedUnequalLocation);
        }
      };


      //Creates new archive entry, and deletes the one before it if asked to
      Watch.prototype.newEntry = function newEntry(removeOneBefore, parsedUnequalLocation) {
        //Adding all watched and non watched variables to the snapshot, which will be archived
        var currentSnapshot = {};
        currentSnapshot.noWatchVars = [];
        currentSnapshot.parsedUnequalLocation = parsedUnequalLocation;


        //Creating the snapshot
        currentSnapshot.watchVar = copy(this.parsedWatchVar(this.scope));
        for (var i = 0; i < this.parsedNoWatchVars.length; i++){
          currentSnapshot.noWatchVars.push(copy(this.parsedNoWatchVars[i](this.scope)));
        }


        //Archiving the current state of the variables
        if (this.archive.length - 1 > this.currArchivePos){
          //Cutting off the end of the archive if you were in the middle of your archive and made a change
          var diff = this.archive.length - this.currArchivePos - 1;
          this.archive.splice(this.currArchivePos+1, diff);
        }

        //Since this entry and the one before it are too similar, and you aren't on the last object left, remove the object you are on (since a newer one will be added soon)
        if (removeOneBefore){
          this.archive.splice(this.currArchivePos, 1);
        }

        this.archive.push(currentSnapshot);
        this.currArchivePos = this.archive.length -1;

        //Running the functions designated to run on adjustment
        for (i = 0; i < this.onAdjustFunctions.length; i++){
          this.onAdjustFunctions[i]();
        }
      };


      //Adds $watch to the watch variable
      Watch.prototype.addWatch = function addWatch() {
        var _this = this;
        if (_this.isScope){
          //this is assuming the scope given variable is the angular '$scope'
          _this.cancelWatch = _this.scope.$watch(_this.watchVar, function(){
            _this.addToArchive.apply(_this);
          });
        }
        else{
          //This is assuming the scope variable given is using the controller as syntax
          //this is a funkier way of doing the above because $scope obscures a lot of the magic needed to $watch a variable
          _this.cancelWatch = $rootScope.$watch(bind(_this, function() {
            return _this.parsedWatchVar(_this.scope);
          }) , function(){
                _this.addToArchive.apply(_this);
          } , true);
        }
      };
    });
})();
