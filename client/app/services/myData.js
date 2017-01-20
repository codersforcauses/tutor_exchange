angular
  .module('tutorExchange')
  .factory('myData', function() {
    var data = {};

    function set(d) {
      data = d;
    }

    function get() {
      return data;
    }

    return {
      set: set,
      get: get,
    };

  });
