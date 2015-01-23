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

  it( 'should add a new entry in the archive if there is a 16 character difference', inject( function() {
    scope.obj.str = "abcdefghij1234567890";
    scope.$apply();

    expect(scope.chronicle.archive[1].watchVar.str).toEqual("abcdefghij1234567890");
  }));

  it( 'should not remove a change if non string stuff is happening', inject( function() {
    scope.obj.str = "abcdef";
    scope.$apply();
    scope.obj.str = "abcdefg";
    scope.obj.zzz = 1;
    scope.$apply();

    expect(scope.chronicle.archive[1].watchVar.str).toEqual("abcdef");
  }));

  it( 'should not add a new entry in the archive if there is a 14 character difference and its not the first one', inject( function() {
    scope.obj.str = "abcdef";
    scope.$apply();
    scope.obj.str = "abcdefghij1234567890";
    scope.$apply();

    expect(scope.chronicle.archive[1].watchVar.str).toEqual("abcdefghij1234567890");
  }));

  it( 'should only add one new entry in the archive if there is two 14 character differences and its not the first difference', inject( function() {
    scope.obj.str = "abcdef";
    scope.$apply();
    scope.obj.str = "abcdefghij1234567890";
    scope.$apply();
    scope.obj.str = "abcdefghij1234567890klmn1234567890";
    scope.$apply();

    expect(scope.chronicle.archive[1].watchVar.str).toEqual("abcdefghij1234567890");
    expect(scope.chronicle.archive[2].watchVar.str).toEqual("abcdefghij1234567890klmn1234567890");
  }));

  it( 'should handle a new string attribute watch correctly', inject( function() {
    scope.$apply();
    scope.obj.newAttr = "";
    scope.$apply();
    scope.obj.newAttr = "s";
    scope.$apply();
    scope.obj.newAttr = "sam";
    scope.$apply();

    expect(scope.chronicle.archive[1].watchVar.newAttr).toEqual("");
    expect(scope.chronicle.archive[2].watchVar.newAttr).toEqual("sam");
  }));

});
