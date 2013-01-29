var Toolkit = function() {

	var api = {};

	/************************************************************************************************************************
	 * URL MANIPULATIONS
	 ************************************************************************************************************************/

	/**
	 * Returns an object of url params. Can take a url string, or else it will use the current url
	 */
	api.getUrlParams = function(url) {
		
		var params;
		if (url) {
			params = url.split('?');
			if (params.length == 1) return {}
		} else {
			params = window.location.search;	
		}
		
		var new_params = {};

		if (params.substring(0,1) == '?') {
			params = params.substring(1);	
		}

		//params might be an empty string if there were not get params
		if (params) {
			params = params.split('&');
			for (var i = 0; i < params.length; i++) {
				p = params[i].split('=');
				new_params[p[0]] = p[1];
			}
		}
		
		return new_params;
	};


	/**
	 * Replaces get parameters and returns a complete url
	 * params string. Will add the parameters if not present. This does not modifiy
	 * the actual URL, just returns the string, so subsequent calls will still get
	 * the params frm the current url.
	 * @param params obj|string an object of replacement params or a string of a key
	 * @param val string|int an optinonal value for if params is a single key string
	 * @param url string an optional url to pass to get the params from rather than the current url
	 */
	api.replaceUrlParams = function(params, val, url) {
		var urlParams = api.getUrlParams(url);

		// turn params into an object if not one
		if (typeof params == 'string') {
			var key = params;
			params = {};
			params[key] = val;
		}

		for (key in params) {
			urlParams[key] = params[key];
		}

		return api.objToUrlParamsString(urlParams);
	};


	/**
	 * Deletes get params from a urls get params string, and returns the url string
	 * params string. This does not modifiy the actual URL, just returns the string
	 * so subsequent calls will still get the params frm the current url.
	 * @param params obj|string an object of params to delete or a string of a key
	 * @param val string|int an optinonal value for if params is a single key string
	 */
	api.deleteUrlParams = function(params, val) {
		var urlParams = api.getUrlParams();

		// turn params into an object if not one
		if (typeof params == 'string') {
			var key = params;
			params = {};
			params[key] = val;
		}

		for (key in params) {
			delete urlParams[key];
		}

		return api.objToUrlParamsString(urlParams);
	};


	/**
	 * Takes an object and turns it into a url parameters string
	 */
	api.objToUrlParamsString = function(obj) {
		
		var params = [];
		for (key in obj) {
			var paramString = key + '=' + obj[key];
			params.push(paramString);
		}

		return '?' + params.join('&');
	};


	return api;
}();


(function($){
	
	/*******************************************************************************************************************************
	 * String prototype
	 * A collection of useful functions added directly to the string
	 * objects prototype
	 ******************************************************************************************************************************/

	/**
	 * Trims whitepace off of the front and back of a string
	 */
	String.prototype.trim = function(){
		return this.replace(/^\s+|\s+$/g, "");
	};
	
	/**
	 * Converts a string to camel case
	 */
	String.prototype.toCamel = function(){
		var str = this.replace(/((\_|-|\W)[a-z])/gi, function($1){return $1.toUpperCase().replace(/-|_|\W/g,'');});
		return str.charAt(0).toLowerCase() + str.slice(1);
	};
	
	/**
	 * Converts camel case and spaces to dashes
	 */
	String.prototype.toDash = function(){
		return this.replace(/[\W_]/g, '-').replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();}).replace(/--/g, '-');
	};
	
	/**
	 * Converts anything to a class name format, camelCased with a capital first letter
	 */
	String.prototype.toClassName = function(){
		var str = this.toCamel();
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
	
	/**
	 * Converts a to underscores
	 */
	String.prototype.toUnderscore = function(){
		return this.replace(/[\W-]/g, '_').replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();}).replace(/__/g,'_');
	};


	String.random = function(length) {
		
		if (!length) {
			length = 32;
		}

	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

	    if (! length) {
	        length = Math.floor(Math.random() * chars.length);
	    }

	    var str = '';
	    for (var i = 0; i < length; i++) {
	        str += chars[Math.floor(Math.random() * chars.length)];
	    }
	    
	    return str;
	};


	

	/*******************************************************************************************************************************
	 * Array prototype
	 * A collection of useful functions added directly to the array
	 * objects prototype
	 ******************************************************************************************************************************/
	
	/**
	 * Polyfill for older browsers that don't support indexOf
	 */
	if(!Array.indexOf){
	    Array.prototype.indexOf = function(obj){
	        for(var i=0; i<this.length; i++){
	            if(this[i]==obj){
	                return i;
	            }
	        }
	        return -1;
	    }
	}

	/**
	 * Diff two arrays
	 */
	Array.prototype.diff = function(b) {
		return this.subtract(b).concat(b.subtract(this));
	};

	/**
	 * Subract an array from the calling array
	 */
	Array.prototype.subtract = function(b) {
		var a = this;
		var diff = [];
		for(var i = 0; i < a.length; i++) {
			var found = false;
			for(var j = 0; j < b.length; j++) {
				
				//we are comparing objects
				if (typeof a[i] == 'object' && typeof b[j] == 'object') { 
					if(JSON.stringify(a[i]) === JSON.stringify(b[j])) {
						found = true;
						break;
					}
				} 

				//standard comparison
				else if(a[i] === b[j]) {
					found = true;
					break;
				}
			}

			if(!found) diff.push(a[i]);
		}
		
		return diff;	
	};
	

	/*******************************************************************************************************************************
	 * Math prototype
	 * A collection of useful functions added directly to the math
	 * objects prototype
	 ******************************************************************************************************************************/
	
	/**
	 * Get an int between min and max inclusive
	 */ 
	 Math.between = function(min, max, round) {
	 	round = round || false;
	 	var rand = min + (max - min) * Math.random();
	 	return round ? Math.round(rand) : rand;
	 };




/************************************************************************************************
 * Utilities
 ************************************************************************************************/
	

	
})(jQuery);