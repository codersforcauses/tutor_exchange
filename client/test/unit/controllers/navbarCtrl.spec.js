describe('NavbarCtrl test:', function() {

  beforeEach(module('tutorExchange'));

  var $scope, $location, authService, USER_ROLES, userFunctions;

  beforeEach(function() {
    var mockAuthService, mockUserFunctions;

    mockAuthService = {};
    mockAuthService.isAuthenticated = function() {};

    mockUserFunctions = {};
    mockUserFunctions.logoutUser = function() {};

    module('tutorExchange', function($provide) {
      $provide.value('authService', mockAuthService);
      $provide.value('userFunctions', mockUserFunctions);
    });
  });


  beforeEach(inject(function($controller, $rootScope, _$location_, _authService_, _USER_ROLES_, _userFunctions_) {
    $scope = $rootScope.$new();
    $location = _$location_;
    authService = _authService_;
    USER_ROLES = _USER_ROLES_;
    userFunctions = _userFunctions_;

    NavbarCtrl = $controller('NavbarCtrl', {
      $scope: $scope,
      $location: $location,
      authService: authService,
      USER_ROLES: USER_ROLES,
      userFunctions: userFunctions,
    });
  }));


  describe('$scope.$on(\'$stateChangeStart\', ...):', function() {
    it('should call authService.isAuthenticated() when $stateChangeStart is broadcasted', function() {
      spyOn(authService, 'isAuthenticated').and.callThrough();
      $scope.$broadcast('$stateChangeStart');
      expect(authService.isAuthenticated).toHaveBeenCalled();
    });

    it('should set $scope.isLoggedIn to equal authService.isAuthenticated()', function() {
      spyOn(authService, 'isAuthenticated').and.returnValues(true, false);

      $scope.$broadcast('$stateChangeStart');
      expect($scope.isLoggedIn).toBeTruthy();

      $scope.$broadcast('$stateChangeStart');
      expect($scope.isLoggedIn).toBeFalsy();
    });
  });


  describe('$scope.isSelected:', function() {
    it('should return true if and only if currentLocation equal $location.path()', function() {
      $location.path('/login');
      spyOn($location, 'path').and.callThrough();
      expect($scope.isSelected('/login')).toBeTruthy();
      expect($scope.isSelected('/apply')).toBeFalsy();

      expect($location.path).toHaveBeenCalled();
    });

  });


  describe('$scope.logout:', function() {
    it('should set $scope.isLoggedIn to false', function() {
      $scope.logout();
      expect($scope.isLoggedIn).toBe(false);
    });

    it('should call userFunctions.logout()', function() {
      spyOn(userFunctions, 'logoutUser');
      $scope.logout();
      expect(userFunctions.logoutUser).toHaveBeenCalled();
    });
  });


});
