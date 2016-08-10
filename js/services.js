(function(){

'use strict'

angular.module('azweb.services',[]);

angular.module('azweb.services').factory('authService', ['$auth', '$http', 'AUTH_PREFIX', function($auth, $http, AUTH_PREFIX) {
  return {
    login: function(email, password) {
      var user = {};
      user.email = email;
      try {
        user.password = CryptoJS.SHA256(password).toString();
      }
      catch(err) {
        console.log(err);
        user.password = undefined;
      }
      return $auth.login(user, {
        method: 'POST',
        url: AUTH_PREFIX+'/login'
      });
    },
    logout: function() {
      return $auth.logout();
    },
    profile: function() {
      return $auth.getPayload();
    },
    isAuthenticated: function() {
      return $auth.isAuthenticated();
    },
    setStorageType: function(StorageType) {
      return $auth.setStorageType(StorageType);
    }
  }
}]);
angular.module('azweb.services').factory('couponService', ['$http', 'COUPON_PREFIX', function($http, COUPON_PREFIX) {
  return {
    getCoupons: function(type, page) {
    	var types = ['actual','used','all'];
    	var config = {
    		method: 'GET',
    		url: COUPON_PREFIX+'/'+( types.indexOf(type) < 0 ? 'actual' : type ),
    		params: {
    			page: (page ? page : 1)
    		} 
    	}
    	return $http(config);
    	},
    useCoupon: function(id) {
      var config = {
        method: 'PUT',
        url: COUPON_PREFIX,
        data: { id: id }
      }
      return $http(config);
    },
    getNominals: function(duedate) {
      var config = {
        method: 'POST',
        url: COUPON_PREFIX + '/nominal'
      }
      if(duedate) {
        config.data = { duedate: duedate }
      }
      return $http(config); 
    },
    invite: function(req) {
      var config = {
        method: 'POST',
        url: COUPON_PREFIX + '/invite',
        data: req
      }
      return $http(config);
    },
    getInvitationCouponsList: function(uuid, page) {
      var config = {
        method: 'GET',
        url: COUPON_PREFIX + '/invite/list/'+uuid,
        params: {
          page: (page ? page : 1)
        }
      }
      return $http(config);
    },
    getInvitations: function(page) {
      var config = {
        method: 'GET',
        url: COUPON_PREFIX + '/invitations',
        params: {
          page: (page ? page : 1)
        }
      }
      return $http(config);
    }

	}
}]);
angular.module('azweb.services').factory('paginationService',[function(){
  return {
    paginationStart: function(page, window) {
        return page <= window ? 1 : page - window;
      },
    paginationEnd: function(page, window, total) {
        var end = page <= window ? window * 2 : page + window;
        if(total && total != undefined) {
          end = end <= total ? end : total;
        }
        return end;
      }
  }
}]);
angular.module('azweb.services').value('AUTH_PREFIX','http://127.0.0.1:5000/api/v1/auth');
angular.module('azweb.services').value('COUPON_PREFIX','http://127.0.0.1:5000/api/v1/coupons');

}());