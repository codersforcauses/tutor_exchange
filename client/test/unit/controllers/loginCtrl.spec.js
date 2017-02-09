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
      console.log('mockAuthService.isAuthorized');
    };

    mockAuthService.login = function() {
      console.log('mockAuthService.login');
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

    beforeAll(function() {
      mockAuthService.authenticated = true;
    });

    afterAll(function() {
      mockAuthService.authenticated = false;
    });

    it('should change state if user is already logged in', function() {
      expect($state.go).toHaveBeenCalledWith('dashboard');
    });

  });


  describe('$scope.submit:', function() {
    it('should call authService.login with user id and student number', function() {
      //spyOn(authService, 'login').and.callThrough();
      //var user = {id: 11223344, password: 'password'};
      //$scope.submit(user);
      //expect(authService.login).toHaveBeenCalledWith(user.id, user.password);
    });

    it('should change state to dashboard if authentication is successful', function() {
    });

    it('should not change state if authentication is not successful', function() {
    });

    it('should update $scope.errorMsg if authentication is not successful', function() {
    });

    it('should clear login form if authentication is not successful', function() {
    });

  });

});