# **Chronicle**
An undo/redo service for AngularJS.
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

