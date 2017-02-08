describe('LoginCtrl test:', function() {

  beforeEach(module('tutorExchange'));

  beforeAll(function() {
    var mockAuthService = {};

    module('tutorExchange', function($provide) {
      $provide.value('authService', mockAuthService);
    });

    // Mock AuthService
    inject(function() {
      mockAuthService.isAuthenticated = function() {
        return false;
      };
      mockAuthService.isAuthorised = function() {
        return true;
      };
    });
  });


  beforeEach(inject(function($controller, $rootScope, _authService_, _$state_) {
    $scope = $rootScope.$new();
    authService = _authService_;
    $state = _$state_;

    $state.go('login');
    spyOn($state, 'go').and.callThrough();

    LoginCtrl = $controller('LoginCtrl', {
      $scope: $scope,
      authService: authService,
      $state: $state,
    });
  }));



  describe('login check:', function() {
    it('should not change state if user is not logged in', function() {
      expect($state.go).not.toHaveBeenCalledWith('dashboard');
    });

    it('should change state if user is already logged in', function() {
      //expect($state.go).toHaveBeenCalledWith('dashboard');
    });

  });




});