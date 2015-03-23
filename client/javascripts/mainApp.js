var app = angular.module('mainApp', ['ngRoute', 'ngResource']).run(function($rootScope,$http) {
	$rootScope.authenticated = false;
	$rootScope.current_user = '';

});

app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		//the signup display
		.when('/signup', {
			templateUrl: 'register.html',
			controller: 'authController'
		}).when('/loggedIn/', {
		templateUrl: 'loggedIn.html'
		}).otherwise({
		redirectTo : '/'
	});
});

app.controller('mainController', function($scope, $rootScope){
	
});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.credentials = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(credentials){
    $http.post('/auth/login', credentials).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(credentials){
    $http.post('/auth/signup', credentials).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
  
  $rootScope.signout = function(){
    	$http.get('auth/signout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
		$location.path("/login");
	};
});