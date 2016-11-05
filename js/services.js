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
angular.module('azweb.services').factory('couponService', ['$http', 'COUPON_PREFIX', 'ACCOUNT_PREFIX', function($http, COUPON_PREFIX, ACCOUNT_PREFIX) {
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
    sendAccounts: function(req) {
      var config = {
        method: 'POST',
        url: ACCOUNT_PREFIX + '/invite',
        data: req
      }
      return $http(config);
    },
    checkAccountsAmount: function(date, data) {
      for(var i=0; i < data.length; i++) {
        if(new Date(date).valueOf() === new Date(data[i].duedate).valueOf()) {
          return parseInt(data[i].amount); 
        }
      }
      return 0;
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
    },
    getMaxDueDate: function() {
      var config = {
        method: 'GET',
        url: COUPON_PREFIX + '/maxduedate'
      }
      return $http(config);
    },
    getActiveCouponsAmount: function() {
      var config = {
        method: 'GET',
        url: COUPON_PREFIX + '/active/amount'
      }
      return $http(config);
    },
    getActiveAccountsAmount: function() {
      var config = {
        method: 'GET',
        url: ACCOUNT_PREFIX + '/active/amount'
      }
      return $http(config);
    },
    listDisabledDates: function(activeDates) {
            var current = null;
            var prev = null;
            var disabledDates = [];
            for(var i=0;i<activeDates.length;i++){
              prev = current;
              current = new Date(activeDates[i].duedate);
              if(prev != null) {
                var diff = Math.floor((current - prev) / 86400000);
                if(diff > 1) {
                  for(var d=1;d<diff;d++) {
                    var emptyDate = new Date(prev);
                    emptyDate.setDate(emptyDate.getDate() + d);
                    disabledDates.push(dateToStr(emptyDate));
                  }
                }
              }

            }
            return disabledDates;
      }
	}
  function dateToStr(date) {
        function pad(s) { return (s < 10) ? '0' + s : s; };
        return [date.getFullYear(), pad(date.getMonth()+1), pad(date.getDate())].join('-');
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
//angular.module('azweb.services').value('AUTH_PREFIX','http://198.96.90.123:10101/api/v1/auth');
//angular.module('azweb.services').value('COUPON_PREFIX','http://198.96.90.123:10101/api/v1/coupons');
//angular.module('azweb.services').value('ACCOUNT_PREFIX','http://198.96.90.123:10101/api/v1/accounts');
angular.module('azweb.services').value('AUTH_PREFIX','http://127.0.0.1:5000/api/v1/auth');
angular.module('azweb.services').value('COUPON_PREFIX','http://127.0.0.1:5000/api/v1/coupons');
angular.module('azweb.services').value('ACCOUNT_PREFIX','http://127.0.0.1:5000/api/v1/accounts');
}());