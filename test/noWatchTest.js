describe( 'Chronicle no watch variable', function() {
  var Chronicle, scope;
  beforeEach( function(){
    module('ChronTest');
    inject(function(_Chronicle_, $rootScope){
      Chronicle = _Chronicle_;
      scope = $rootScope.$new();
      scope.obj = {};
      scope.arr = [];
      scope.num = 0;
      scope.watch = 0;
    });
  });

  it( 'should be able to be an object and record a change only when the watchVar is changed' , inject( function() {
    scope.chron = Chronicle.record('watch', scope, false, 'obj');
    scope.$apply();

    scope.watch = 1;
    scope.$apply();
    scope.obj.mem = "abc";
    scope.$apply();
    expect(scope.chron.archive[1].noWatchVars[0].mem).toBeUndefined();

    scope.watch = 2;
    scope.$apply();
    expect(scope.chron.archive[2].noWatchVars[0].mem).toEqual("abc");
  }));

  it( 'should be able to be an array and record a change only when the watchVar is changed' , inject( function() {
    scope.chron = Chronicle.record('watch', scope, false, 'arr');
    scope.$apply();

    scope.watch = 1;
    scope.$apply();
    scope.arr.push("abc");
    scope.$apply();
    expect(scope.chron.archive[1].noWatchVars[0][0]).toBeUndefined();

    scope.watch = 2;
    scope.$apply();
    expect(scope.chron.archive[2].noWatchVars[0][0]).toEqual("abc");
  }));

  it( 'should be able to be multiple variable in an array and record changes only when the watchVar is changed' , inject( function() {
    scope.chron = Chronicle.record('watch', scope, false, ['obj', 'num']);
    scope.$apply();

    scope.watch = 1;
    scope.$apply();
    scope.obj.mem = "abc";
    scope.num = 1;
    scope.$apply();
    expect(scope.chron.archive[1].noWatchVars[0].mem).toBeUndefined();
    expect(scope.chron.archive[1].noWatchVars[1]).toEqual(0);

    scope.watch = 2;
    scope.$apply();
    expect(scope.chron.archive[2].noWatchVars[0].mem).toEqual("abc");
    expect(scope.chron.archive[2].noWatchVars[1]).toEqual(1);
  }));

  it( 'should be able to be an object with an array inside it and record a change only when the watchVar is changed' , inject( function() {
    scope.chron = Chronicle.record('watch', scope, false, 'obj');
    scope.$apply();

    scope.watch = 1;
    scope.$apply();
    scope.obj.arr = [];
    scope.obj.arr.push("abc");
    scope.$apply();
    expect(scope.chron.archive[1].noWatchVars[0].arr).toBeUndefined();

    scope.watch = 2;
    scope.$apply();
    expect(scope.chron.archive[2].noWatchVars[0].arr[0]).toEqual("abc");
  }));

  it ( 'should be able to be an object.array[0].member and record a change only when the watchVar is changed', inject( function(){
    scope.obj.arr = [];
    scope.obj.arr.push({});
    scope.obj.arr[0].member = "abc";
    scope.chron = Chronicle.record('watch', scope, false, 'obj.arr[0].member');
    scope.$apply();

    scope.watch = 1;
    scope.$apply();
    scope.obj.arr[0].member = "cba";
    scope.$apply();
    expect(scope.chron.archive[1].noWatchVars[0]).toEqual("abc");

    scope.watch = 2;
    scope.$apply();
    expect(scope.chron.archive[2].noWatchVars[0]).toEqual("cba");
    
  }));

});
