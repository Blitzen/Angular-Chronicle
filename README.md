# **Chronicle**
An undo/redo service for AngularJS.
## **Installation**
The easiest way to install is just to use [Bower](http://bower.io/
"Bower").

    bower intall chronicle

However if you aren't using Bower, you can simply take the
`chronicle.js` file and put it in your project, and be sure to include
it after you include your AngularJS source file.

## **Basic Usage**
First things first, you have to start recording your variable:

    $scope.chronicle = Chronicle.record('var', $scope);

## **On Event Handlers**
You may want to perform a certain function when something happens in
your Chronicle object. In order to do that, you may do as follows:

    watchObj.addOnUndoFunction(fn)

This will make Chronicle call `fn()` whenever watchObj sucessfully
undoes

    watchObj.addOnRedoFunction(fn)

This will make Chronicle call `fn()` whenever watchObj sucessfully
redoes

    watchObj.addOnAdjustFunction(fn)

This will make Chronicle call `fn()` whenever watchObj sucessfully
registers a change that is *not* an undo or redo - bascially any update
to the model that isn't a direct undo or redo.

If you wish to call a function with arguements, I suggest the following
structure, as at the moment Chronicle does not support that directly

    fn = function(passedVars){...} //The function that you wish to call
    intermediatefn = function() {
      var passingVars = ...//Get vars
      fn(passingVars);
    }
    ...
    watchObj.addOnAdjustFunction(intermediatefn);

And if at any point you wish to remove any of these onEvent functions,
just use `watchObj.removeOnXXXXXFunction(fn)` where `XXXXX` can be `Undo`,
`Redo`, or `Adjust`
