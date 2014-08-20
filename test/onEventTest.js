describe( 'Chronicle on event functions', function() {
  var Chronicle, scope;
  beforeEach( function(){
    module('ChronTest');
    inject(function(_Chronicle_, $rootScope){
      Chronicle = _Chronicle_;
      this.str = "abcd";
      this.fn = function() {};
      this.fn2 = function() {};
      this.chronicle = Chronicle.record('str', this);
      scope = $rootScope.$new();
      scope.$apply();
    });
  });

  it( 'should call the OnUndo functions when an undo happens', inject( function() {
    spyOn(this, "fn");
    spyOn(this, "fn2");

    this.chronicle.addOnUndoFunction(this.fn);
    this.chronicle.addOnUndoFunction(this.fn2);

    this.str = "different value";
    scope.$apply();

    this.chronicle.undo();

    expect(this.fn).toHaveBeenCalled();
    expect(this.fn2).toHaveBeenCalled();
  }));

  it( 'should call the OnRedo functions when a redo happens', inject( function() {
    spyOn(this, "fn");
    spyOn(this, "fn2");

    this.chronicle.addOnRedoFunction(this.fn);
    this.chronicle.addOnRedoFunction(this.fn2);

    this.str = "different value";
    scope.$apply();

    this.chronicle.undo();
    this.chronicle.redo();

    expect(this.fn).toHaveBeenCalled();
    expect(this.fn2).toHaveBeenCalled();
  }));

  it( 'should call the OnAdjust functions when an adjustment happens', inject( function() {
    spyOn(this, "fn");
    spyOn(this, "fn2");

    this.chronicle.addOnAdjustFunction(this.fn);
    this.chronicle.addOnAdjustFunction(this.fn2);

    this.str = "different value";
    scope.$apply();

    expect(this.fn).toHaveBeenCalled();
    expect(this.fn2).toHaveBeenCalled();
  }));

  it( 'should error if a function that does not exist is added to onAdjust', inject( function() {
    this.chronicle.addOnAdjustFunction(this.fn);
    expect(function(){this.chronicle.addOnAdjustFunction(this.thisisundefined);}).toThrow();
  }));

  it( 'should error if a function that does not exist is added to onRedo', inject( function() {
    this.chronicle.addOnRedoFunction(this.fn);
    expect(function(){this.chronicle.addOnRedoFunction(this.thisisundefined);}).toThrow();
  }));

  it( 'should error if a function that does not exist is added to onUndo', inject( function() {
    this.chronicle.addOnUndoFunction(this.fn);
    expect(function(){this.chronicle.addOnUndoFunction(this.thisisundefined);}).toThrow();
  }));

  it( 'should error if an onbject is added to onUndo', inject( function() {
    this.obj = {};
    this.chronicle.addOnUndoFunction(this.fn);
    expect(function(){this.chronicle.addOnUndoFunction(this.obj)}).toThrow();
  }));

  it( 'should error if an onbject is added to onRedo', inject( function() {
    this.obj = {};
    this.chronicle.addOnRedoFunction(this.fn);
    expect(function(){this.chronicle.addOnRedoFunction(this.obj)}).toThrow();
  }));

  it( 'should error if an onbject is added to onAdjust', inject( function() {
    this.obj = {};
    this.chronicle.addOnAdjustFunction(this.fn);
    expect(function(){this.chronicle.addOnAdjustFunction(this.obj)}).toThrow();
  }));

  it( 'should no longer call the OnAdjust functions when an adjustment function is removed', inject( function() {
    spyOn(this, "fn");
    spyOn(this, "fn2");

    this.chronicle.addOnAdjustFunction(this.fn);
    this.chronicle.addOnAdjustFunction(this.fn2);
    this.chronicle.removeOnAdjustFunction(this.fn);

    this.str = "different value";
    scope.$apply();

    expect(this.fn).not.toHaveBeenCalled();
    expect(this.fn2).toHaveBeenCalled();
  }));

  it( 'should no longer call the OnRedo functions when an onRedo function is removed', inject( function() {
    spyOn(this, "fn");
    spyOn(this, "fn2");

    this.chronicle.addOnRedoFunction(this.fn);
    this.chronicle.addOnRedoFunction(this.fn2);
    this.chronicle.removeOnRedoFunction(this.fn);

    this.str = "different value";
    scope.$apply();
    this.chronicle.undo();
    this.chronicle.redo();

    expect(this.fn).not.toHaveBeenCalled();
    expect(this.fn2).toHaveBeenCalled();
  }));

  it( 'should no longer call the OnUndo functions when an onUndo function is removed', inject( function() {
    spyOn(this, "fn");
    spyOn(this, "fn2");

    this.chronicle.addOnUndoFunction(this.fn);
    this.chronicle.addOnUndoFunction(this.fn2);
    this.chronicle.removeOnUndoFunction(this.fn);

    this.str = "different value";
    scope.$apply();
    this.chronicle.undo();

    expect(this.fn).not.toHaveBeenCalled();
    expect(this.fn2).toHaveBeenCalled();
  }));
});
