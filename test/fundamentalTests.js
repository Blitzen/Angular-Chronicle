describe( 'Chronicle', function() {
  var Chronicle, scope;
  beforeEach( function(){
    module('ChronTest');
    inject(function(_Chronicle_, $rootScope){
      Chronicle = _Chronicle_;
      this.str = "abcd";
      this.chronicle = Chronicle.record('str', this);
      scope = $rootScope.$new();
      scope.$apply();
    });
  });
  it( 'should have a Chronicle service injected', inject( function() {
    expect( Chronicle ).toNotBe(null);
  }));
});
