describe( 'Chronicle on event functions', function() {
  var Chronicle, scope;
  beforeEach( function(){
    module('ChronTest');
    inject(function(_Chronicle_, $rootScope){
      Chronicle = _Chronicle_;
      this.str = "abcd";
      this.nonfn = 5;
      this.fn = function() {};
      this.fn2 = function() {};
      this.chronicle = Chronicle.record('str', this);
      scope = $rootScope.$new();
      scope.$apply();
    });
  });
  it( 'should call the OnUndo functions when a redo happens', inject( function() {
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
});
