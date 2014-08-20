describe( 'Chronicle string handling', function() {
  var Chronicle, scope;
  beforeEach( function(){
    module('ChronTest');
    inject(function(_Chronicle_, $rootScope){
      Chronicle = _Chronicle_;
      scope = $rootScope.$new();
      scope.obj= {};
      scope.obj.str = "abcd";
      scope.chronicle = Chronicle.record('obj', scope, true);
      scope.$apply();
    });
  });

  it( 'should add a new entry in the archive if there are two spots where the variable has changed', inject( function() {
    scope.obj.str = "_abcde";
    scope.$apply();

    expect(scope.chronicle.archive[1].watchVar.str).toEqual("_abcde");
  }));

  it ( 'should add a new entry if a different string is changed', inject( function() {
    scope.obj.str2 = "zzzz";
    scope.$apply();

    scope.obj.str = "bcde";
    scope.$apply();

    scope.obj.str2 = "yyyy";
    scope.$apply();

    expect(scope.chronicle.archive.length).toEqual(4);
  }));

  it( 'should add a new entry in the archive if there is a space in the difference', inject( function() {
    scope.obj.str = "abcd ";
    scope.$apply();

    expect(scope.chronicle.archive[1].watchVar.str).toEqual("abcd ");
  }));

  it( 'should add a new entry in the archive if there is a 6 character difference', inject( function() {
    scope.obj.str = "abcdefghij";
    scope.$apply();

    expect(scope.chronicle.archive[1].watchVar.str).toEqual("abcdefghij");
  }));

  it( 'should not add a new entry in the archive if there is a 4 character difference and its not the first one', inject( function() {
    scope.obj.str = "abcdef";
    scope.$apply();
    scope.obj.str = "abcdefghij";
    scope.$apply();

    expect(scope.chronicle.archive[1].watchVar.str).toEqual("abcdefghij");
  }));

  it( 'should only add one new entry in the archive if there is two 4 character differences and its not the first difference', inject( function() {
    scope.obj.str = "abcdef";
    scope.$apply();
    scope.obj.str = "abcdefghij";
    scope.$apply();
    scope.obj.str = "abcdefghijklmn";
    scope.$apply();

    expect(scope.chronicle.archive[1].watchVar.str).toEqual("abcdefghij");
    expect(scope.chronicle.archive[2].watchVar.str).toEqual("abcdefghijklmn");
  }));

});
