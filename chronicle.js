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

      this.record = function record( watchVar, scope, wsString, noWatchVars ){
        var newWatch = new Watch(watchVar, scope, wsString, noWatchVars);
        watches.push(newWatch);
        return newWatch;
      };

      var Watch = function Watch(watchVar, scope, wsString, noWatchVars){
        this.watchVar = watchVar;
        this.scope = scope;
        this.wsString = wsString;
        this.noWatchVars = noWatchVars;
        this.archive = [];
        this.currArchivePos = null;

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
          //comparing to ensure there was a change... Angular's $watch triggers on registration which sucks and this is to escape that
          if(!equals(this.scope[this.watchVar], this.archive[this.archive.length-1][this.watchVar])){
            shouldBeAdded = true;
          }
        }
        else{
          //Adding to the archive if there isn't an entry there
          shouldBeAdded = true;
        }

        if (shouldBeAdded){
          //Adding all watched and non watched variables to the snapshot, which will be archived
          var currentSnapshot = [];

          //Creating the snapshot
          var obj = {};
          obj[this.watchVar] = copy(this.scope[this.watchVar]);
          currentSnapshot.push(obj);
          for (var a in this.noWatchVars){
            var obj = {};
            obj[this.noWatchVars[a]] = copy(this.scope[this.noWatchVars[a]]);
            currentSnapshot.push(obj);
          }

          //Archiving the current state of the variables
          this.archive.push(currentSnapshot);
          this.currArchivePos = this.archive.length -1;
        }
      };

      Watch.prototype.addWatch = function addWatch() {
        //Very funky way of using $watch which would conceptually translate to something along the lines of:
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
