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


  angular.module('ngChronicle', []).service('Chronicle',
    function ($rootScope) {
      var watches = [];

      this.record = function record( watchVars, scope, stringVars, noWatchVars ){
        var newWatch = new Watch(watchVars, scope, stringVars, noWatchVars);
        watches.push(newWatch);
        return newWatch;
      };

      var Watch = function Watch(watchVars, scope, stringVars, noWatchVars){
        this.watchVars = watchVars;
        this.scope = scope;
        this.stringVars = stringVars;
        this.noWatchVars = noWatchVars;
        this.archive = [];

        this.addToArchive();
        this.addWatch();
      };

      Watch.prototype.undo = function undo() {
        console.log("undo");
      };
      Watch.prototype.redo = function redo() {
        console.log("redo");
      };
      Watch.prototype.canRedo = function canRedo() {
        console.log("can redo");
      };
      Watch.prototype.canUndo = function canUndo() {
        console.log("can undo");
      };
      Watch.prototype.addToArchive = function addToArchive() {
        var shouldBeAdded = false;
        console.log("add2archive", this);

        if (this.archive.length){
          for (var i in this.watchVars){
            //comparing to ensure there was a change... Angular's $watch triggers on registration which sucks and this is to escape that
            if(!equals(this.scope[this.watchVars[i]], this.archive[this.archive.length-1][i][this.watchVars[i]])){
              shouldBeAdded = true;
            }
          }
        }
        else{
          shouldBeAdded = true;
        }

        if (shouldBeAdded){
          //Adding all watched and non watched variables to the snapshot, which will be archived
          var currentSnapshot = [];
          for (var a in this.watchVars){
            var obj = {};
            obj[this.watchVars[a]] = copy(this.scope[this.watchVars[a]]);
            currentSnapshot.push(obj);
          }
          for (a in this.noWatchVars){
            var obj = {};
            obj[this.noWatchVars[a]] = copy(this.scope[this.noWatchVars[a]]);
            currentSnapshot.push(obj);
          }

          //Archiving the current state of the variables
          this.archive.push(currentSnapshot);
        }
          //this.addWatch();
      };

      Watch.prototype.addWatch = function addWatch() {
        console.log("addwatch");
        var i = 0;
        $rootScope.$watch(bind(this, function() {
          return this.scope[this.watchVars[i]];
        }) , this.addToArchive, true);
      };
    });
})();
