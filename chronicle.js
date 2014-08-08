(function () {
  "use strict";

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
    if (o1 === o2) return {isEqual: true, stringDiff: false, o1: o1, o2: o2};
    if (o1 === null || o2 === null) return {isEqual: false, stringDiff: false, o1: o1, o2: o2};
    if (o1 !== o1 && o2 !== o2) return {isEqual: true, stringDiff: false, o1: o1, o2: o2}; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 == t2) {
      if (t1 == 'string') {
        if (o1 != o2){
          return {isEqual: false, stringDiff: true, o1: o1, o2: o2};
        }
      }
      if (t1 == 'object') {
        if (isArray(o1)) {
          if (!isArray(o2)) return {isEqual: false, stringDiff: false, o1: o1, o2: o2};
          if ((length = o1.length) == o2.length) {
            for(key=0; key<length; key++) {
              var eq = equals(o1[key], o2[key]);
              if (!eq.isEqual) return eq;
            }
            return true;
          }
        } else if (isDate(o1)) {
          return {isEqual: isDate(o2) && o1.getTime() == o2.getTime(), stringDiff: false, o1: o1, o2: o2};
        } else if (isRegExp(o1) && isRegExp(o2)) {
          return {isEqual: o1.toString() == o2.toString(), stringDiff: false, o1: o1, o2: o2};
        } else {
          if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2) || isArray(o2)) return {isEqual: false, stringDiff: false, o1: o1, o2: o2};
          keySet = {};
          for(key in o1) {
            if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
            var eq = equals(o1[key], o2[key]);
            if (!eq.isEqual) return eq;
            keySet[key] = true;
          }
          for(key in o2) {
            if (!keySet.hasOwnProperty(key) &&
                key.charAt(0) !== '$' &&
                o2[key] !== undefined &&
                !isFunction(o2[key])) return {isEqual: false, stringDiff: false, o1: o1, o2: o2};
          }
          return {isEqual: true, stringDiff: false, o1: o1, o2: o2};
        }
      }
    }
    return {isEqual: false, stringDiff: false, o1: o1, o2: o2};
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

  angular.module('ngChronicle', []).service('Chronicle',
    function ($rootScope, $parse) {
      var watches = [];

      this.record = function record( watchVar, scope, wsString, noWatchVars ){
        var newWatch = new Watch(watchVar, scope, wsString, noWatchVars);
        watches.push(newWatch);
        return newWatch;
      };

      var Watch = function Watch(watchVar, scope, wsString, noWatchVars){
        //Initializing Watch
        if (isUndefined(watchVar)){
          throw new Error("Undefined watch variable passed to Chronicle.");
        }
        else{
          this.parsedWatchVar = $parse(watchVar);
        }

        if (isUndefined(scope)){
          throw new Error("Undefined scope passed to Chronicle.");
        }
        else{
          this.scope = scope;
        }

        if (wsString !== true && wsString !== 'true'){
          this.wsString = false;
        }
        else{
          this.wsString = true;
        }

        this.parsedNoWatchVars = [];
        if (isArray(noWatchVars)){
          var allAreStrings = true;
          for (var i in noWatchVars){
            if (!isString(noWatchVars[i])){
              allAreStrings = false;
            }
            else {
              this.parsedNoWatchVars.push($parse(noWatchVars[i]));
            }
          }
          if (!allAreStrings){
            throw new Error("Not all passed 'no watch' variables are in string format");
            this.parsedNoWatchVars = [];
          }
        }
        else if (isString(noWatchVars)){
          this.parsedNoWatchVars.push($parse(noWatchVars));
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
        this.parsedWatchVar.assign(this.scope, copy(this.parsedWatchVar(this.archive[revertToPos][0])));

        for (var i = 0; i < this.parsedNoWatchVars.length; i++){
          this.parsedNoWatchVars[i].assign(this.scope, copy(this.parsedNoWatchVars[i](this.archive[revertToPos][i+1])));
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



      Watch.prototype.addToArchive = function addToArchive() {
        var shouldBeAdded = false, stringDiff = false;

        if (this.archive.length){
          var eq = equals(this.parsedWatchVar(this.scope), this.parsedWatchVar(this.archive[this.currArchivePos][0]));
          //comparing to ensure there was a real change made and not just an undo/redo
          if(!eq.isEqual){
            shouldBeAdded = true;
            stringDiff = eq.stringDiff;
            if (stringDiff){
              var o1 = eq.o1;
              var o2 = eq.o2;
            }
          }
        }
        else{
          //Adding to the archive if there isn't an entry in the archive yet
          shouldBeAdded = true;
        }

        if (shouldBeAdded){
          //Adding all watched and non watched variables to the snapshot, which will be archived
          var currentSnapshot = [];


          //Creating the snapshot
          var obj = {};
          this.parsedWatchVar.assign(obj, copy(this.parsedWatchVar(this.scope)));
          currentSnapshot.push(obj);
          for (var i = 0; i < this.parsedNoWatchVars.length; i++){
            obj = {};
            this.parsedNoWatchVars[i].assign(obj, copy(this.parsedNoWatchVars[i](this.scope)));
            currentSnapshot.push(obj);
          }


          //Archiving the current state of the variables
          if (this.archive.length - 1 > this.currArchivePos){
            //Cutting off the end of the archive if you were in the middle of your archive and made a change
            var diff = this.archive.length - this.currArchivePos - 1;
            this.archive.splice(this.currArchivePos+1, diff);
          }
          //TODO make this NICER!!!!! at the moment it ony check if a space has been hit to register a new change if they are similar
          if (this.wsString && stringDiff){
            var differenceObject = similarStringDifference(o1,o2);

            if (differenceObject.areSimilar){
              var tooSimilar = true;
              for (var i in differenceObject.differences){
                for (var j in differenceObject.differences[i]){
                  if (differenceObject.differences[i][j] == ' '){
                    tooSimilar = false;
                  }
                }
              }
              if (tooSimilar){
                this.archive.splice(this.currArchivePos, 1);
              }
            }
          }

          this.archive.push(currentSnapshot);
          this.currArchivePos = this.archive.length -1;

          //Running the functions designated to run on adjustment
          for (i = 0; i < this.onAdjustFunctions.length; i++){
            this.onAdjustFunctions[i]();
          }
          console.log(this.archive);
        }
      };


      Watch.prototype.addWatch = function addWatch() {
        //Funky way of using $watch which would conceptually translate to something along the lines of:
        //$rootScope.$watch(this.scope[this.parsedWatchVar], this.addToArchive(), true);
        //but of course to actually do the above you need to work some magic!
        var _this = this;
        this.cancelWatch = $rootScope.$watch(bind(_this, function() {
          return _this.parsedWatchVar(_this.scope);
        }) , function(){
              _this.addToArchive.apply(_this);
        } , true);
      };
    });
})();
