describe('LoginCtrl test:', function() {

  beforeEach(module('tutorExchange'));

  var $contoller, $q;
  var LoginCtrl, $scope, authService, $state;

  // Mock objects
  beforeEach(function() {
    var mockAuthService;

    mockAuthService = {message: 'server message'};
    mockAuthService.isAuthenticated = function() {
      //console.log('mockAuthService.isAuthenticated');
    };

    mockAuthService.login = function() {
      //console.log('mockAuthService.login');
      var deferred = $q.defer();
      deferred.resolve({data: {message: mockAuthService.message}});
      return deferred.promise;
    };

    module('tutorExchange', function($provide) {
      $provide.value('authService', mockAuthService);
    });
  });

  // Inject dependancies
  beforeEach(inject(function(_$controller_, _$q_, $rootScope, _authService_, _$state_) {
    $controller = _$controller_;
    $q = _$q_;

    $scope = $rootScope.$new();
    authService = _authService_;
    $state = _$state_;

    $scope.loginForm = {};
    $scope.loginForm.$setPristine = function() {};
  }));



  describe('login check:', function() {
    it('should not change state if user is not logged in', function() {
      spyOn(authService, 'isAuthenticated').and.returnValue(false);
      spyOn($state, 'go');
      LoginCtrl = $controller('LoginCtrl', {$scope: $scope, authService: authService, $state: $state});
      expect($state.go).not.toHaveBeenCalled();
    });

    it('should change state if user is already logged in', function() {
      spyOn(authService, 'isAuthenticated').and.returnValue(true);
      spyOn($state, 'go');
      LoginCtrl = $controller('LoginCtrl', {$scope: $scope, authService: authService, $state: $state});
      expect($state.go).toHaveBeenCalledWith('dashboard');
    });
  });



  describe('$scope.submit:', function() {

    var user;

    beforeEach(function() {
      LoginCtrl = $controller('LoginCtrl', {$scope: $scope, authService: authService, $state: $state});
      user = {id: 11111111, password: 'password'};
    });


    it('should call authService.login with user id and password', function() {
      spyOn(authService, 'login').and.callThrough();
      $scope.submit(user);
      expect(authService.login).toHaveBeenCalledWith(user.id, user.password);
    });

    it('should change state to dashboard if authentication is successful', function() {
      spyOn(authService, 'isAuthenticated').and.returnValue(true);
      spyOn($state, 'go');
      $scope.submit(user);
      $scope.$digest();
      expect($state.go).toHaveBeenCalledWith('dashboard');
    });

    it('should not change state if authentication is not successful', function() {
      spyOn(authService, 'isAuthenticated').and.returnValue(false);
      spyOn($state, 'go');
      $scope.submit(user);
      $scope.$digest();
      expect($state.go).not.toHaveBeenCalled();
    });

    it('should update $scope.errorMsg if authentication is not successful', function() {
      spyOn(authService, 'isAuthenticated').and.returnValue(false);
      $scope.submit(user);
      $scope.$digest();
      expect($scope.errorMsg).toBe(authService.message);
    });

    it('should clear login form if authentication is not successful', function() {
      spyOn(authService, 'isAuthenticated').and.returnValue(false);
      spyOn($scope.loginForm, '$setPristine');
      $scope.submit(user);
      $scope.$digest();
      expect($scope.loginForm.$setPristine).toHaveBeenCalled();
    });
  });

});
