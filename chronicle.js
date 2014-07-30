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
    bind = angular.bind;


  angular.module('ngChronicle', []).service('Chronicle',
    function () {
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

        this.archive.push(currentSnapshot);
        console.log(this.archive);
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

    });
})();
