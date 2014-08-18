# **Chronicle**
An undo/redo service for AngularJS.

Note: Since the current version is not yet at 1.x.x, there is the
chance of API changes that could fundamentally wreck certain
functionality. Use this beta at your own risk.

## **Installation**
The easiest way to install is just to use [Bower](http://bower.io/
"Bower").

```javscript
bower install chronicle
```

However if you aren't using Bower, you can simply take the
[`chronicle.js`](https://github.com/Blitzen/Angular-Chronicle/blob/master/chronicle.js "chronicle.js")
file and put it in your project and include
it in your html file after you include your AngularJS source file.

## **Examples**
[Here](http://blitzen.github.io/Angular-Chronicle "Chronicle Website")
is Chronicle's official page, and it contains a number of useful
examples that cover different supported pieces of functionality.

## **Basic Usage**
First things first, you have to start recording your variable:

```javascript
$scope.str = 'test';
$scope.chronicle = Chronicle.record('str', $scope);
```

You then take this scope variable and call functions on it.

```javascript
$scope.chronicle.undo();
$scope.chronicle.redo();
$scope.chronicle.canUndo();
$scope.chronicle.canRedo();
```

These functions should be self explanitory.
[This](http://blitzen.github.io/Angular-Chronicle/#basic-usage) should
be enough for basic undo/redo functionality.

## **Full Usage**
At the moment, there are only four arguments you can give
`Chronicle.record`.

```javascript
$scope.chron = Chronicle.record('watchVar', $scope, handleStringsBool, 'noWatchVar');
```

[`'watchVar'`](http://blitzen.github.io/Angular-Chronicle/#watch-variable "Example")
is the stringified variable name you want to be able to undo on.

[`scope`](http://blitzen.github.io/Angular-Chronicle/#scope "Example")
is the variable that contains your watch variable and your unwatched variables.

[`handleStringsBool`](http://blitzen.github.io/Angular-Chronicle/#string-handling "Example")
is the boolean that determines if you want to handle strings in a more user input friendly way.

[`'noWatchVar'`](http://blitzen.github.io/Angular-Chronicle/#no-watch-variables "Example")
is the stringified variable name that you want to be able to store alongside your watch variable but not trigger
your watch variable.

The functions that you can then use on `$scope.chron`:

```javascript
$scope.chron.undo();
```

Undoes to the previous change.

```javascript
$scope.chron.redo();
```

Redoes to the next change.

```javascript
$scope.chron.addOnUndoFunction(fn);
$scope.chron.addOnRedoFunction(fn);
$scope.chron.addOnAdjustFunction(fn);
```

Use these functions to make Chronicle call a function whenever a
significant event happens to the Chronicle object.

```javascript
$scope.chron.removeOnUndoFunction(fn);
$scope.chron.removeOnRedoFunction(fn);
$scope.chron.removeOnAdjustFunction(fn);
```

Removes the passed function call on the event. More info on the above 6
functions
[here](http://blitzen.github.io/Angular-Chronicle/#on-event-handlers).

```javascript
$scope.chron.canUndo();
$scope.chron.canRedo();
```

Returns true if the action can be performed, false if you can't perform
the action at the current time.

