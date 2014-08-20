describe( 'Chronicle basic undo/redo tests', function() {
  var Chronicle, scope;
  beforeEach( function(){
    module('ChronTest');
    inject(function(_Chronicle_, $rootScope){
      Chronicle = _Chronicle_;
      scope = $rootScope.$new();
      scope.str = "abcd";
      scope.chronicle = Chronicle.record('str', scope);
      scope.$apply();
    });
  });
  it( 'should add entries to the archive', inject( function(){

  }));
  it( 'should add entries to the archive', inject( function(){
    scope.str = "bcde";
    scope.$apply();
    scope.str = "cdef";
    scope.$apply();

    expect( scope.chronicle.archive[0].watchVar ).toBe( "abcd" );
    expect( scope.chronicle.archive[1].watchVar ).toBe( "bcde" );
    expect( scope.chronicle.archive[2].watchVar ).toBe( "cdef" );
  }));
  it( 'should allow an undo and redo', inject( function() {
    scope.str = "bcde";
    scope.$apply();
    scope.chronicle.undo();
    expect(scope.str).toBe( "abcd" );
    scope.chronicle.redo();
    expect(scope.str).toBe( "bcde" );
  }));
  it( 'should add entries to the archive', inject( function(){

  }));
});
