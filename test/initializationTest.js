describe( 'Chronicle initialization', function() {
  var Chronicle, scope;
  beforeEach( function(){
    module('ChronTest');
    inject(function(_Chronicle_, $rootScope){
      Chronicle = _Chronicle_;
      scope = $rootScope.$new();
    });
  });
  it( 'should initialize Chronicle correctly with only two valid arguements', inject( function() {
    this.str = "abcd";
    this.chronicle = Chronicle.record('str', this);
    scope.$apply();

    expect(this.chronicle.parsedNoWatchVars).toEqual([]);
    expect(this.chronicle.stringHandling).toBe(false);
  }));
  it( 'should initialize Chronicle correctly with only three valid arguements', inject( function() {
    this.str = "abcd";
    this.chronicle = Chronicle.record('str', this, true);
    scope.$apply();

    expect(this.chronicle.parsedNoWatchVars).toEqual([]);
    expect(this.chronicle.stringHandling).toBe(true);
  }));
  it( 'should initialize Chronicle correctly with a single no watch variable', inject( function() {
    this.str = "abcd";
    this.noWatch = 4;
    this.chronicle = Chronicle.record('str', this, true, 'noWatch');
    scope.$apply();

    expect(this.chronicle.parsedNoWatchVars.length).toEqual(1);
    expect(this.chronicle.stringHandling).toBe(true);
  }));
  it( 'should throw an error if given a non string as the first argument' , inject( function() {
    this.obj = {};
    expect(function(){Chronicle.record( this.obj, this)}).toThrow();
  }));
  it( 'should throw an error if given a watch var which can\'t be found in the given scope' , inject( function() {
    this.obj = {};
    expect(function(){Chronicle.record( 'thisIsTotallyNotInTheScope', this)}).toThrow();
  }));
  it( 'should allow the scope to be the AngularJS\' "$scope" type' , inject( function() {
    scope.str = 'asdf';
    scope.noWatch = 'asdf';
    scope.chronicle = Chronicle.record('str', scope, true, 'noWatch');
  }));
  it( 'should allow the scope to be the "this" type (a basic object)' , inject( function() {
    this.str = 'asdf';
    this.noWatch = 'asdf';
    this.chronicle = Chronicle.record('str', this, true, 'noWatch');
  }));
  it( 'should throw an error if given a scope which is an array type' , inject( function() {
    this.array = [];
    this.array.push("abc");
    expect(function(){Chronicle.record('[0]', this.array)}).toThrow();
  }));
  it( 'should set string handling to false if not given a correct argument' , inject( function() {
    scope.str = 'asdf';
    scope.noWatch = 'asdf';
    scope.chronicle = Chronicle.record('str', scope, this, 'noWatch');
    expect(scope.chronicle.stringHandling).toBe(false);
  }));
  it( 'should handle single string argument for no watch var correctly' , inject( function() {
    scope.str = 'asdf';
    scope.noWatch = 'asdf';
    scope.chronicle = Chronicle.record('str', scope, true, 'noWatch');
    expect(scope.chronicle.parsedNoWatchVars.length).toEqual(1);
  }));
  it( 'should handle array argument for no watch vars correctly' , inject( function() {
    scope.str = 'asdf';
    scope.noWatchB = 'qqq';
    scope.noWatch = 'asdf';
    scope.chronicle = Chronicle.record('str', scope, true, ['noWatch', 'noWatchB']);
    expect(scope.chronicle.parsedNoWatchVars.length).toEqual(2);
  }));
  it( 'should error if given an array of strings with one non string as the non watched variables' , inject( function() {
    scope.str = 'asdf';
    scope.noWatchB = 'qqq';
    scope.noWatch = 'asdf';
    expect(function(){Chronicle.record('str', scope, true, ['noWatch',5, 'noWatchB'])}).toThrow();
  }));
  it( 'should error if given a fourth argument that isn\'t a string or an array' , inject( function() {
    scope.str = 'asdf';
    expect(function(){Chronicle.record('str', scope, true, 5)}).toThrow();
  }));
  it( 'should error if given a single no watch variable and that variable is not found in the given scope' , inject( function() {
    scope.str = 'asdf';
    expect(function(){Chronicle.record('str', scope, true, 'noWatch')}).toThrow();
  }));
  it( 'should error if given an array of non watched variables, one of which is not found in the given scope' , inject( function() {
    scope.str = 'asdf';
    scope.noWatch = 'asdf';
    expect(function(){Chronicle.record('str', scope, true, ['noWatch','noWatchB'])}).toThrow();
  }));
  it( 'should have one archive entry after being recorded' , inject( function() {
    scope.str = "abc";
    scope.chron = Chronicle.record('str', scope);
    scope.$apply();
    expect(scope.chron.archive.length).toEqual(1);
  }));
  it( 'should start with all blank onEventFunction lists' , inject( function() {
    scope.str = "abc";
    scope.chron = Chronicle.record('str', scope);
    scope.$apply();
    expect(scope.chron.onUndoFunctions).toEqual([]);
    expect(scope.chron.onRedoFunctions).toEqual([]);
    expect(scope.chron.onAdjustFunctions).toEqual([]);

  }));
});
