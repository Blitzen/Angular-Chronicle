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

These functions should be self explanitory. This should be enough for
basic undo/redo functionality.

## **Full Usage**
At the moment, there are only four arguments you can give
`Chronicle.record`.

```javascript
$scope.chron = Chronicle.record('watchVar', $scope, handleStringsBool, 'noWatchVar');
```

[`'watchVar'`](#watch-variable) is the stringified variable you want to
be able to undo on.

[`scope`](#scope) is the variable that contains your watch variable and
your unwatched variables.

[`handleStringsBool`](#string-handling) is the variable that determines
if you want to handle strings in a more user input friendly way.

[`noWatchVar`](#no-watch-variables) is the stringified variable that you
want to be able to store alongside your watch variable but not trigger
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
functions [here](#on-event-handlers).

```javascript
$scope.chron.canUndo();
$scope.chron.canRedo();
```

Returns true if the action can be performed, false if you can't perform
the action at the current time.

## **Watch Variable**
This parameter must be a string version of how you access the variable
you want to watch. For example:

```javascript
$scope.obj.arrOfObjs[2].foo //The var you want to watch

$scope.chronicle = Chronicle.record('obj.arrOfObjs[2].foo', $scope); //This is valid
$scope.chronicle = Chronicle.record(obj.arrOfObjs[2].foo, $scope); //invalid
var index = 2;
$scope.chronicle = Chronicle.record('obj.arrOfObjs[index].foo', $scope); //invalid
```

Generally good practice would be to avoid trying to watch a specific
variable in an array. However watching a specific variable in an object
is just fine.

The watch will record the entire variable. So if the watch variable is
an object or array, it will watch everything in the object/array:

```javascript
$scope.obj = {};
$scope.obj.arr = [1, 2, 3];
$scope.obj.str = 'abc';

$scope.chronicle = Chronicle.record('obj', $scope);
...
$scope.obj.newVar = 123; //New thing to undo
...
$scope.arr[0] = 4; //New thing to undo
...
$scope.str += 'def'; //New thing to undo.
```

## **Scope**
This is the scope of the controller with the variable you want to watch.
`$scope` can be used.

### Controller As Syntax
This library fully supports "controller as" syntax. So everything will work
just the same as using `$scope`, just replace `$scope` with `this`:

```javascript
this.watchThis = 'something'
this.chronicle = Chronicle.record('watchThis', this);
```

As well as:
```javascript
var vm = this;
vm.watchThis = {};
vm.chronicle = Chronicle.record('watchThis', vm);
```


## **String Handling**
This service provides an option for handling strings in a special way.
This option was designed with text inputs in mind - no user wants an
undo to change only a single character each time. String handling is by
default not active.

To enable this, pass `true` to the third arguement on
`Chronicle.record`.

```javascript
$scope.undoRedo = Chronicle.record('var', $scope, true); // turns string handling on
```

### Specific Details on String Handling
Specific string handling, when on, works like this:
The newest update is always kept. However if the newest update is
considered to be too similar to the update before it, it removes the
update before it completely. Too similar is defined as:

- One string contains the other string completely, in order, with only 1
  place where the longer string contains extra characters.

- The longer string is no more than 5 characters longer than the shorter
  string (this number can be changed - it is the variable
  `MAX_STRING_CHANGE_SIZE` at the top of
[`chronicle.js`](https://github.com/Blitzen/Angular-Chronicle/blob/dev/chronicle.js/#L4 "chronicle.js line 4")

- The longer string has no whitespace in the extra characters

[Here (not here yet!!)](http://blitzen.github.io/Angular-Chronicle "Chronicle Website")
is a demo of string specific handling in action.

## **No Watch Variables**
You have the option to provide secondary variable(s) to Chronicle which
will be stored whenever your watch variable is changed but, if changed,
will not trigger a new undo location. This looks like so:

```javascript
$scope.watchThis = 'abc';
$scope.dontWatchThis = 'ignored';
$scope.chron = Chronicle.record('watchThis', $scope, false, 'dontWatchThis');

```

Since the no watch variable option is the fourth one, be sure to pass
the string handling variable before it, even if you don't intend to use
that functionality (just pass `false` in that case).

You can also pass in an array of no watch variables to tie a number of
them to the Chronicle object (note - this does NOT work with watch
variables, you may only have one watch variable).

```javascript
$scope.watchThis = 'abc';
$scope.dontWatchThis = 12;
$scope.norThis = "I'm being";
$scope.ignorePlease = {};
$scope.chron = Chronicle.record('watchThis', $scope, false, ['dontWatchThis', 'norThis', 'ignorePlease']);
...
$scope.dontWatchThis = 5;
...
$scope.watchThis = 'cba';
...
$scope.ignorePlease.member = 3;
$scope.norThis += " ignored";
...
$scope.watchThis = 'abcdefg';
...
$scope.ignorePlease.member = 1000;
//So currently
//watchThis='abcdefg', dontWatchThis = 5,
//norThis = "I'm being ignored", ignorePlease = {member: 1000}
...
$scope.chron.undo();
//So now
//watchThis='cba', dontWatchThis = 5,
//norThis = "I'm being", ignorePlease = {}
...
$scope.chron.undo();
//So now
//watchThis='abc', dontWatchThis = 12,
//norThis = "I'm being", ignorePlease = {}
...
$scope.chron.redo();
$scope.chron.redo();
//So now
//watchThis='abcdefg', dontWatchThis = 5,
//norThis = "I'm being ignored", ignorePlease = {member: 3}
```

## **On Event Handlers**
You may want to perform a certain function when something happens in
your Chronicle object. In order to do that, you may do as follows:

```javascript
$scope.chron.addOnUndoFunction(fn)
```

This will make Chronicle call `fn()` whenever the `$scope.chron` object
sucessfully undoes.

```javascript
$scope.chron.addOnRedoFunction(fn)
```

This will make Chronicle call `fn()` whenever the `$scope.chron` object
sucessfully redoes.

```javascript
$scope.chron.addOnAdjustFunction(fn)
```

This will make Chronicle call `fn()` whenever the `$scope.chron` object
sucessfully registers a change that is *not* an undo or redo - bascially any update
to the model that isn't caused by a direct call to `undo()` or `redo()`.

If you wish to call a function with arguements, I suggest the following
structure, as at the moment Chronicle does not support that directly:

```javascript
$scope.fn = function(passedVars){...} //The function that you wish to call
$scope.intermediatefn = function() {
  var passingVars = ...//Get vars
  $scope.fn(passingVars);
}
...
$scope.chron.addOnAdjustFunction(intermediatefn);
```

And if at any point you wish to remove any of these onEvent functions,
just use `watchObj.removeOnEventFunction(fn)` where `Event` can be `Undo`,
`Redo`, or `Adjust`.
