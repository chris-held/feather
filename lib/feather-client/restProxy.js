(function() {
  
  feather.rest = {};

  feather.bindRestProxy = function(proxyInfo) {
    _.each(proxyInfo.apis, function(api) {
      feather.rest[api.name] = {};
      _.each(api.methods, function(method) {
        feather.rest[api.name][method.name] = function(path, data, cb) {
          if (typeof data === "function") {
            cb = data;
            data = null;
          }

          var contentType = 'application/json';
          //connect currently has issues with GET and application/json
          if (method.verb.toLowerCase() === "get") {
            contentType = 'text/plain';
            //add cache_break qs value
            var hasQs = /[?&]/.test(path);
            if(hasQs) {
              path += "&feather_cache_break=" + new Date().getTime();
            } else {
              path += "?feather_cache_break=" + new Date().getTime();
            }
          }

          $.ajax({
            url: encodeURI("/_rest/" + api.name + decodeURI(path)),
            data: (typeof data === "undefined" || data === null) ? null : JSON.stringify(data),
            type: method.verb,
            dataType: "json",
            contentType: contentType,
            success: function(result) {
              cb && cb({
                success: true,
                result: result
              });
            },
            statusCode: {
              404: function(xhr, textStatus, err) {
                cb && cb({
                  success: false,
                  statusCode: 404,
                  err: err,
                  xhr: xhr,
                  textStatus: textStatus
                });
              },
              500: function(xhr, textStatus, err) {
                cb && cb({
                  success: false,
                  statusCode: 500,
                  err: JSON.parse(xhr.responseText),
                  xhr: xhr,
                  textStatus: textStatus
                });
              }
            }
          });
        };
      });
    });
  };

})();