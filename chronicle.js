(function () {
  "use strict";

  var isDefined = angular.isDefined,
    isUndefined = angular.isUndefined,
    isFunction = angular.isFunction,
    isArray = angular.isArray,
    isString = angular.isString,
    isObject = angular.isObject,
    forEach = angular.forEach,
    copy = angular.copy,
    equals = angular.equals,
    bind = angular.bind;

  //TODO: use $parse to evaluate the watchVar properly
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
        var shouldBeAdded = false;

        if (this.archive.length){
          //comparing to ensure there was a real change made and not just an undo/redo
          if(!equals(this.parsedWatchVar(this.scope), this.parsedWatchVar(this.archive[this.currArchivePos][0]))){
            shouldBeAdded = true;
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
          }

          this.archive.push(currentSnapshot);
          this.currArchivePos = this.archive.length -1;

          //Running the functions designated to run on adjustment
          for (i = 0; i < this.onAdjustFunctions.length; i++){
            this.onAdjustFunctions[i]();
          }
        }
      };


      Watch.prototype.addWatch = function addWatch() {
        //Funky way of using $watch which would conceptually translate to something along the lines of:
        //$rootScope.$watch(this.scope[this.parsedWatchVar], this.addToArchive(), true);
        //but of course to actually do the above you need to work some magic!
        var _this = this;
        $rootScope.$watch(bind(_this, function() {
          return _this.parsedWatchVar(_this.scope);
        }) , function(){
              _this.addToArchive.apply(_this);
        } , true);
      };
    });
})();
