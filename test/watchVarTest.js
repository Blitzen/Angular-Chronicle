describe( 'Chronicle watch variable', function() {
  var Chronicle, scope;
  beforeEach( function(){
    module('ChronTest');
    inject(function(_Chronicle_, $rootScope){
      Chronicle = _Chronicle_;
      scope = $rootScope.$new();
      scope.obj = {};
      scope.arr = [];
      scope.num = 0;
      this.obj = {};
      this.arr = [];
      this.num = 0;
    });
  });

  it( 'should be able to be an object and record a change in the object using $scope for scope' , inject( function() {
    scope.chron = Chronicle.record('obj', scope);
    scope.$apply();
    expect(scope.chron.archive.length).toEqual(1);

    scope.obj.str = "abc";
    scope.$apply();
    expect(scope.chron.archive[1].watchVar.str).toEqual("abc");
  }));

  it( 'should be able to be an array and record a change in the array using $scope for scope' , inject( function() {
    scope.chron = Chronicle.record('arr', scope);
    scope.$apply();
    expect(scope.chron.archive.length).toEqual(1);

    scope.arr.push("abc");
    scope.$apply();
    expect(scope.chron.archive[1].watchVar[0]).toEqual("abc");
  }));

  it( 'should be able to be a number and record a change in the number using $scope for scope' , inject( function() {
    scope.chron = Chronicle.record('num', scope);
    scope.$apply();
    expect(scope.chron.archive.length).toEqual(1);

    scope.num = 2;
    scope.$apply();
    expect(scope.chron.archive[1].watchVar).toEqual(2);
  }));

  it( 'should be able to be an object with an array inside it and record a change in the array using $scope for scope' , inject( function() {
    scope.chron = Chronicle.record('obj', scope);
    scope.$apply();
    expect(scope.chron.archive.length).toEqual(1);

    scope.obj.arr = [];
    scope.obj.arr.push("abc");
    scope.$apply();
    expect(scope.chron.archive[1].watchVar.arr[0]).toEqual("abc");
  }));

  it( 'should be able to be an object.array[0].member  and record a change in the array using $scope for scope' , inject( function() {
    scope.obj.arr = [];
    scope.obj.arr.push({});
    scope.obj.arr[0].member = "abc";
    scope.$apply();
    scope.chron = Chronicle.record('obj.arr[0].member', scope);
    scope.$apply();
    expect(scope.chron.archive.length).toEqual(1);

    scope.obj.arr[0].member = "abcd";
    scope.$apply();
    expect(scope.chron.archive[1].watchVar).toEqual("abcd");
  }));



  it( 'should be able to be an object and record a change in the object using this for scope' , inject( function() {
    this.chron = Chronicle.record('obj', this);
    scope.$apply();
    expect(this.chron.archive.length).toEqual(1);

    this.obj.str = "abc";
    scope.$apply();
    expect(this.chron.archive[1].watchVar.str).toEqual("abc");
  }));

  it( 'should be able to be an array and record a change in the array using this for scope' , inject( function() {
    this.chron = Chronicle.record('arr', this);
    scope.$apply();
    expect(this.chron.archive.length).toEqual(1);

    this.arr.push("abc");
    scope.$apply();
    expect(this.chron.archive[1].watchVar[0]).toEqual("abc");
  }));

  it( 'should be able to be a number and record a change in the number using this for scope' , inject( function() {
    this.chron = Chronicle.record('num', this);
    scope.$apply();
    expect(this.chron.archive.length).toEqual(1);

    this.num = 2;
    scope.$apply();
    expect(this.chron.archive[1].watchVar).toEqual(2);
  }));

  it( 'should be able to be an object with an array inside it and record a change in the array using this for scope' , inject( function() {
    this.chron = Chronicle.record('obj', this);
    scope.$apply();
    expect(this.chron.archive.length).toEqual(1);

    this.obj.arr = [];
    this.obj.arr.push("abc");
    scope.$apply();
    expect(this.chron.archive[1].watchVar.arr[0]).toEqual("abc");
  }));

  it( 'should be able to be an object.array[0].member  and record a change in the array using this for scope' , inject( function() {
    this.obj.arr = [];
    this.obj.arr.push({});
    this.obj.arr[0].member = "abc";
    scope.$apply();
    this.chron = Chronicle.record('obj.arr[0].member', this);
    scope.$apply();
    expect(this.chron.archive.length).toEqual(1);

    this.obj.arr[0].member = "abcd";
    scope.$apply();
    expect(this.chron.archive[1].watchVar).toEqual("abcd");
  }));

});
