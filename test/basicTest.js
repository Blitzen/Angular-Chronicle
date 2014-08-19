describe( 'Basic Chronicle tests', function() {
  var Chronicle, scope;
  beforeEach( function(){
    module('ChronTest');
    inject(function(_Chronicle_, $rootScope){
      Chronicle = _Chronicle_;
      this.str = "abcd";
      this.chronicle = Chronicle.record('str', this);
      scope = $rootScope.$new();
      scope.$apply();
      /*
      scope = $rootScope.$new();
      scope.str = "abcd";
      scope.chronicle = Chronicle.record('str', scope);
      scope.$apply();
     */
    });
  });
  it( 'should have a Chronicle service injected', inject( function() {
    expect( Chronicle ).toNotBe(null);
  }));
  it( 'should return a Watch object', inject( function(){
    this.str = "xqqx";
    scope.$apply();
    console.log(this.chronicle.archive);

    expect( this.chronicle ).toNotBe(null);
  }));
  it( 'should return a Watch object', inject( function(){
    console.log(this.chronicle.archive);

    expect( this.chronicle ).toNotBe(null);
  }));
});
