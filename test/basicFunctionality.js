describe( 'Chronicle', function() {
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
  it( 'should allow a number of undos in a row', inject( function(){
    scope.str = "bcde";
    scope.$apply();
    scope.str = "cdef";
    scope.$apply();
    scope.str = "defg";
    scope.$apply();

    scope.chronicle.undo();
    expect( scope.str ).toBe( "cdef" );
    scope.chronicle.undo();
    expect( scope.str ).toBe( "bcde" );
    scope.chronicle.undo();
    expect( scope.str ).toBe( "abcd" );
  }));

  it( 'should allow a number of redos in a row', inject( function(){
    scope.str = "bcde";
    scope.$apply();
    scope.str = "cdef";
    scope.$apply();
    scope.str = "defg";
    scope.$apply();

    scope.chronicle.undo();
    scope.chronicle.undo();
    scope.chronicle.undo();
    expect( scope.str ).toBe( "abcd" );
    scope.chronicle.redo();
    expect( scope.str ).toBe( "bcde" );
    scope.chronicle.redo();
    expect( scope.str ).toBe( "cdef" );
    scope.chronicle.redo();
    expect( scope.str ).toBe( "defg" );
  }));

  it( 'should not error if undo or redo are called at a time they cannot be used', inject (function(){
    scope.chronicle.undo();
    scope.chronicle.redo();
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

  it( 'should allow a revert call and have it work', inject( function(){
    scope.str = "bcde";
    scope.$apply();
    scope.str = "e";
    scope.$apply();
    scope.chronicle.revert(0);
    expect(scope.str).toBe( "abcd" );
  }));

  it( 'should have canUndo() return true and false when it should', inject( function(){
    expect(scope.chronicle.canUndo()).toBe( false );
    scope.str = "bcde";
    scope.$apply();
    expect(scope.chronicle.canUndo()).toBe( true );
    scope.str = "e";
    scope.$apply();
    expect(scope.chronicle.canUndo()).toBe( true );

    scope.chronicle.undo();
    expect(scope.chronicle.canUndo()).toBe( true );
    scope.chronicle.undo();
    expect(scope.chronicle.canUndo()).toBe( false );
    scope.chronicle.redo();
    expect(scope.chronicle.canUndo()).toBe( true );
  }));

  it( 'should have canRedo() return true and false when it should', inject( function(){
    expect(scope.chronicle.canRedo()).toBe( false );
    scope.str = "bcde";
    scope.$apply();
    scope.str = "e";
    scope.$apply();
    expect(scope.chronicle.canRedo()).toBe( false );

    scope.chronicle.undo();
    expect(scope.chronicle.canRedo()).toBe( true );
    scope.chronicle.undo();
    scope.chronicle.redo();
    expect(scope.chronicle.canRedo()).toBe( true );
    scope.chronicle.redo();
    expect(scope.chronicle.canRedo()).toBe( false );
  }));

  it( 'should have undo/redo() preserve the length of the archive', inject( function(){
    expect(scope.chronicle.archive.length).toEqual( 1 );
    scope.str = "bcde";
    scope.$apply();
    expect(scope.chronicle.archive.length).toEqual( 2 );
    scope.str = "e";
    scope.$apply();
    expect(scope.chronicle.archive.length).toEqual( 3 );

    scope.chronicle.undo();
    scope.chronicle.undo();
    expect(scope.chronicle.archive.length).toEqual( 3 );
    scope.chronicle.redo();
    scope.chronicle.redo();
    expect(scope.chronicle.archive.length).toEqual( 3 );
  }));
});
