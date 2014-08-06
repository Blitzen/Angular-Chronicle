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
          console.log("Undefined watch variable passed.");
          return undefined;
        }
        else{
          this.watchVar = watchVar;
        }

        if (isUndefined(scope)){
          console.log("Undefined scope passed.");
          return undefined;
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

        if (isArray(noWatchVars)){
          var allAreStrings = true;
          for (var i in noWatchVars){
            if (!isString(noWatchVars[i])){
              allAreStrings = false;
            }
          }
          if (allAreStrings){
            this.noWatchVars = noWatchVars;
          }
        }
        else if (isString(noWatchVars)){
          this.noWatchVars = [noWatchVars];
        }
        else{
          this.noWatchVars = [];
        }
        this.archive = [];
        this.currArchivePos = null;


        this.addWatch();
      };



      //Performs the entire undo on the Watch object
      //Returns: true if successful undo, false otherwise
      Watch.prototype.undo = function undo() {
        if (this.canUndo()){
          this.currArchivePos -= 1;
          this.revert(this.currArchivePos);
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
          return true;
        }
        return false;
      };


      Watch.prototype.revert = function revert(revertToPos){
        this.scope[this.watchVar] = copy(this.archive[revertToPos][0][this.watchVar]);

        for (var i = 0; i < this.noWatchVars.length; i++){
          this.scope[this.noWatchVars[i]] = copy(this.archive[revertToPos][i+1][this.noWatchVars[i]]);
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
          if(!equals(this.scope[this.watchVar], this.archive[this.currArchivePos][0][this.watchVar])){
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
          obj[this.watchVar] = copy(this.scope[this.watchVar]);
          currentSnapshot.push(obj);
          for (var i = 0; i < this.noWatchVars.length; i++){
            obj = {};
            obj[this.noWatchVars[i]] = copy(this.scope[this.noWatchVars[i]]);
            currentSnapshot.push(obj);
          }


          //Archiving the current state of the variables
          if (this.archive.length - 1 > this.currArchivePos){
            //Cutting off the end of the archive if you were in the middle of your archive and made a change
            var diff = this.archive.length - this.currArchivePos - 1;
            console.log(this.archive.splice(this.currArchivePos+1, diff));
          }
          this.archive.push(currentSnapshot);
          this.currArchivePos = this.archive.length -1;
        }
      };


      Watch.prototype.addWatch = function addWatch() {
        //Funky way of using $watch which would conceptually translate to something along the lines of:
        //$rootScope.$watch(this.scope[this.watchVar], this.addToArchive(), true);
        //but of course to actually do the above you need to work some magic!
        var _this = this;
        $rootScope.$watch(bind(_this, function() {
          return _this.scope[_this.watchVar];
        }) , function(){
              _this.addToArchive.apply(_this);
        } , true);
      };
    });
})();
