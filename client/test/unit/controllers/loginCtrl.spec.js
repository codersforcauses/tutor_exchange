describe('LoginCtrl test:', function() {

  beforeEach(module('tutorExchange'));

  var $scope, authService, $state, LoginCtrl;
  var mockAuthService;

  beforeAll(function() {
    mockAuthService = {
      authenticated: false,
    };
    mockAuthService.isAuthenticated = function() {
      return mockAuthService.authenticated;
    };
    mockAuthService.isAuthorized = function() {
      console.log('isAuthorized');
    };
  });

  beforeEach(inject(function($controller, $rootScope, _$state_) {
    $scope = $rootScope.$new();
    authService = mockAuthService;
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

    beforeEach(function() {
      mockAuthService.authenticated = true;
    });

    it('should change state if user is already logged in', function() {
      expect($state.go).toHaveBeenCalledWith('dashboard');
    });

  });




});