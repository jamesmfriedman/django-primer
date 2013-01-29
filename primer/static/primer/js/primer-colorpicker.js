var ColorPicker = {}

!function() {
	$.fn.colorPicker = function(options) {

		var keys = [];
		for (key in ColorPicker.colorMap) {
			keys.push(key);
		}

		var settings = {
			colors : keys,
			onSelect : $.noop,
			active: null
		};

		//methods
		if (typeof options == 'string' && options in $(this).data('primer-color-picker')) {
			var method = $(this).data('primer-color-picker')[options];
			return method.apply(method, Array.prototype.slice.call( arguments, 1 ));
		}

		return this.each(function(){
			
			var $this = $(this);
			var config;
			var public = {};

			var init = function() {
				config = $.extend({}, settings, options);

				$this.addClass('color-picker clearfix');

				for (var i = 0; i < config.colors.length; i++) {
					
					var color = config.colors[i].toUpperCase();
					var convertedColor = ColorPicker.colorStringToHex(color); 					
					var active = config.active.toUpperCase() == color || config.active.toUpperCase() == convertedColor ? true : false;
					public.addColor(config.colors[i], active);
				}

				//handlers
				$this.on('click.color-picker', '.color-picker-widget', function(e){
					e.preventDefault();
					public.setColor($(this).data('color'));
				});
			};

			public.addColor = function(color, active) {
				var colorWidget = $('<a href="#" class="color-picker-widget"></a>');
				var color = ColorPicker.colorStringToHex(color); 
				colorWidget.css('background-color', color);
				colorWidget.attr('data-color', color);

				$this.append(colorWidget);

				if (active) {
					public.setColor(color);
				}
			};

			public.setColor = function(color) {
				$this.find('.color-picker-widget')
					.removeClass('active')
					.filter('[data-color='+ color +']')
						.addClass('active');

				$this.data('color', color);
				$this.trigger('select', [color]);
				config.onSelect(color);
			};

			public.getColor = function() {
				return $this.data('color');
			};

			$this.data('primer-color-picker', public);

			init();	
		});
	};

	ColorPicker.hexToRgb = function(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16)
		] : null;
	};

	ColorPicker.colorStringToHex = function(str) {
		var color = null;
		str = str.replace('#', '').toLowerCase();
		if (str in ColorPicker.colorMap) {
			color = ColorPicker.colorMap[str];
		} else {
			color = str;
		}

		return '#' + color.toUpperCase();
	};

	ColorPicker.getRandom = function() {
		var hex = '';
		var arr = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f']

		var n1 = Math.round(Math.random()*15);
		var n2 = Math.round(Math.random()*15);
		var n3 = Math.round(Math.random()*15);
		var n4 = Math.round(Math.random()*15);
		var n5 = Math.round(Math.random()*15);
		var n6 = Math.round(Math.random()*15);
		
		return '#' + arr[n1]+arr[n2]+arr[n3]+arr[n4]+arr[n5]+arr[n6];
	}

	ColorPicker.colorMap = {
		'white' : 'ffffff',
		'ivory' : 'fffff0',
		'ivory1' : 'fffff0',
		'lightyellow' : 'ffffe0',
		'lightyellow1' : 'ffffe0',
		'yellow' : 'ffff00',
		'yellow1' : 'ffff00',
		'snow' : 'fffafa',
		'snow1' : 'fffafa',
		'floralwhite' : 'fffaf0',
		'lemonchiffon' : 'fffacd',
		'lemonchiffon1' : 'fffacd',
		'cornsilk' : 'fff8dc',
		'cornsilk1' : 'fff8dc',
		'khaki1' : 'fff68f',
		'seashell' : 'fff5ee',
		'seashell1' : 'fff5ee',
		'lavenderblush' : 'fff0f5',
		'lavenderblush1' : 'fff0f5',
		'antiquewhite1' : 'ffefdb',
		'papayawhip' : 'ffefd5',
		'lightgoldenrod1' : 'ffec8b',
		'blanchedalmond' : 'ffebcd',
		'wheat1' : 'ffe7ba',
		'mistyrose' : 'ffe4e1',
		'mistyrose1' : 'ffe4e1',
		'bisque' : 'ffe4c4',
		'bisque1' : 'ffe4c4',
		'moccasin' : 'ffe4b5',
		'thistle1' : 'ffe1ff',
		'navajowhite' : 'ffdead',
		'navajowhite1' : 'ffdead',
		'peachpuff' : 'ffdab9',
		'peachpuff1' : 'ffdab9',
		'gold' : 'ffd700',
		'gold1' : 'ffd700',
		'burlywood1' : 'ffd39b',
		'rosybrown1' : 'ffc1c1',
		'goldenrod1' : 'ffc125',
		'pink' : 'ffc0cb',
		'plum1' : 'ffbbff',
		'darkgoldenrod1' : 'ffb90f',
		'lightpink' : 'ffb6c1',
		'pink1' : 'ffb5c5',
		'lightpink1' : 'ffaeb9',
		'tan1' : 'ffa54f',
		'orange' : 'ffa500',
		'orange1' : 'ffa500',
		'lightsalmon' : 'ffa07a',
		'lightsalmon1' : 'ffa07a',
		'salmon1' : 'ff8c69',
		'darkorange' : 'ff8c00',
		'orchid1' : 'ff83fa',
		'palevioletred1' : 'ff82ab',
		'sienna1' : 'ff8247',
		'coral' : 'ff7f50',
		'chocolate1' : 'ff7f24',
		'darkorange1' : 'ff7f00',
		'coral1' : 'ff7256',
		'hotpink1' : 'ff6eb4',
		'indianred1' : 'ff6a6a',
		'hotpink' : 'ff69b4',
		'tomato' : 'ff6347',
		'tomato1' : 'ff6347',
		'orangered' : 'ff4500',
		'orangered1' : 'ff4500',
		'brown1' : 'ff4040',
		'violetred1' : 'ff3e96',
		'maroon1' : 'ff34b3',
		'firebrick1' : 'ff3030',
		'deeppink' : 'ff1493',
		'deeppink1' : 'ff1493',
		'magenta' : 'ff00ff',
		'magenta1' : 'ff00ff',
		'red' : 'ff0000',
		'red1' : 'ff0000',
		'oldlace' : 'fdf5e6',
		'ltgoldenrodyello' : 'fafad2',
		'linen' : 'faf0e6',
		'antiquewhite' : 'faebd7',
		'salmon' : 'fa8072',
		'ghostwhite' : 'f8f8ff',
		'mintcream' : 'f5fffa',
		'whitesmoke' : 'f5f5f5',
		'beige' : 'f5f5dc',
		'wheat' : 'f5deb3',
		'sandybrown' : 'f4a460',
		'azure' : 'f0ffff',
		'azure1' : 'f0ffff',
		'honeydew' : 'f0fff0',
		'honeydew1' : 'f0fff0',
		'aliceblue' : 'f0f8ff',
		'lightcoral' : 'f08080',
		'ivory2' : 'eeeee0',
		'lightyellow2' : 'eeeed1',
		'yellow2' : 'eeee00',
		'snow2' : 'eee9e9',
		'lemonchiffon2' : 'eee9bf',
		'cornsilk2' : 'eee8cd',
		'palegoldenrod' : 'eee8aa',
		'khaki2' : 'eee685',
		'seashell2' : 'eee5de',
		'lavenderblush2' : 'eee0e5',
		'antiquewhite2' : 'eedfcc',
		'lightgoldenrod' : 'eedd82',
		'lightgoldenrod2' : 'eedc82',
		'wheat2' : 'eed8ae',
		'mistyrose2' : 'eed5d2',
		'bisque2' : 'eed5b7',
		'thistle2' : 'eed2ee',
		'navajowhite2' : 'eecfa1',
		'peachpuff2' : 'eecbad',
		'gold2' : 'eec900',
		'burlywood2' : 'eec591',
		'rosybrown2' : 'eeb4b4',
		'goldenrod2' : 'eeb422',
		'plum2' : 'eeaeee',
		'darkgoldenrod2' : 'eead0e',
		'pink2' : 'eea9b8',
		'lightpink2' : 'eea2ad',
		'tan2' : 'ee9a49',
		'orange2' : 'ee9a00',
		'lightsalmon2' : 'ee9572',
		'violet' : 'ee82ee',
		'salmon2' : 'ee8262',
		'orchid2' : 'ee7ae9',
		'palevioletred2' : 'ee799f',
		'sienna2' : 'ee7942',
		'chocolate2' : 'ee7621',
		'darkorange2' : 'ee7600',
		'hotpink2' : 'ee6aa7',
		'coral2' : 'ee6a50',
		'indianred2' : 'ee6363',
		'tomato2' : 'ee5c42',
		'orangered2' : 'ee4000',
		'brown2' : 'ee3b3b',
		'violetred2' : 'ee3a8c',
		'maroon2' : 'ee30a7',
		'firebrick2' : 'ee2c2c',
		'deeppink2' : 'ee1289',
		'magenta2' : 'ee00ee',
		'red2' : 'ee0000',
		'darksalmon' : 'e9967a',
		'gray91' : 'e8e8e8',
		'lavender' : 'e6e6fa',
		'lightcyan' : 'e0ffff',
		'lightcyan1' : 'e0ffff',
		'azure2' : 'e0eeee',
		'honeydew2' : 'e0eee0',
		'mediumorchid1' : 'e066ff',
		'burlywood' : 'deb887',
		'plum' : 'dda0dd',
		'gainsboro' : 'dcdcdc',
		'palevioletred' : 'db7093',
		'goldenrod' : 'daa520',
		'orchid' : 'da70d6',
		'thistle' : 'd8bfd8',
		'lightgray' : 'd3d3d3',
		'tan' : 'd2b48c',
		'chocolate' : 'd2691e',
		'lightcyan2' : 'd1eeee',
		'mediumorchid2' : 'd15fee',
		'violetred' : 'd02090',
		'gray81' : 'cfcfcf',
		'ivory3' : 'cdcdc1',
		'lightyellow3' : 'cdcdb4',
		'yellow3' : 'cdcd00',
		'snow3' : 'cdc9c9',
		'lemonchiffon3' : 'cdc9a5',
		'cornsilk3' : 'cdc8b1',
		'khaki3' : 'cdc673',
		'seashell3' : 'cdc5bf',
		'lavenderblush3' : 'cdc1c5',
		'antiquewhite3' : 'cdc0b0',
		'lightgoldenrod3' : 'cdbe70',
		'wheat3' : 'cdba96',
		'mistyrose3' : 'cdb7b5',
		'bisque3' : 'cdb79e',
		'thistle3' : 'cdb5cd',
		'navajowhite3' : 'cdb38b',
		'peachpuff3' : 'cdaf95',
		'gold3' : 'cdad00',
		'burlywood3' : 'cdaa7d',
		'rosybrown3' : 'cd9b9b',
		'goldenrod3' : 'cd9b1d',
		'plum3' : 'cd96cd',
		'darkgoldenrod3' : 'cd950c',
		'pink3' : 'cd919e',
		'lightpink3' : 'cd8c95',
		'peru' : 'cd853f',
		'tan3' : 'cd853f',
		'orange3' : 'cd8500',
		'lightsalmon3' : 'cd8162',
		'salmon3' : 'cd7054',
		'orchid3' : 'cd69c9',
		'palevioletred3' : 'cd6889',
		'sienna3' : 'cd6839',
		'chocolate3' : 'cd661d',
		'darkorange3' : 'cd6600',
		'hotpink3' : 'cd6090',
		'indianred' : 'cd5c5c',
		'coral3' : 'cd5b45',
		'indianred3' : 'cd5555',
		'tomato3' : 'cd4f39',
		'orangered3' : 'cd3700',
		'brown3' : 'cd3333',
		'violetred3' : 'cd3278',
		'maroon3' : 'cd2990',
		'firebrick3' : 'cd2626',
		'deeppink3' : 'cd1076',
		'magenta3' : 'cd00cd',
		'red3' : 'cd0000',
		'darkolivegreen1' : 'caff70',
		'lightsteelblue1' : 'cae1ff',
		'mediumvioletred' : 'c71585',
		'slategray1' : 'c6e2ff',
		'darkseagreen1' : 'c1ffc1',
		'azure3' : 'c1cdcd',
		'honeydew3' : 'c1cdc1',
		'olivedrab1' : 'c0ff3e',
		'lightblue1' : 'bfefff',
		'darkorchid1' : 'bf3eff',
		'grey' : 'bebebe',
		'darkkhaki' : 'bdb76b',
		'darkolivegreen2' : 'bcee68',
		'lightsteelblue2' : 'bcd2ee',
		'rosybrown' : 'bc8f8f',
		'paleturquoise1' : 'bbffff',
		'mediumorchid' : 'ba55d3',
		'slategray2' : 'b9d3ee',
		'darkgoldenrod' : 'b8860b',
		'grey71' : 'b5b5b5',
		'darkseagreen2' : 'b4eeb4',
		'lightcyan3' : 'b4cdcd',
		'mediumorchid3' : 'b452cd',
		'olivedrab2' : 'b3ee3a',
		'lightblue2' : 'b2dfee',
		'darkorchid2' : 'b23aee',
		'firebrick' : 'b22222',
		'lightskyblue1' : 'b0e2ff',
		'powderblue' : 'b0e0e6',
		'lightsteelblue' : 'b0c4de',
		'maroon' : 'b03060',
		'paleturquoise' : 'afeeee',
		'paleturquoise2' : 'aeeeee',
		'greenyellow' : 'adff2f',
		'lightblue' : 'add8e6',
		'mediumpurple1' : 'ab82ff',
		'darkgrey' : 'a9a9a9',
		'brown' : 'a52a2a',
		'lightskyblue2' : 'a4d3ee',
		'darkolivegreen3' : 'a2cd5a',
		'lightsteelblue3' : 'a2b5cd',
		'sienna' : 'a0522d',
		'purple' : 'a020f0',
		'slategray3' : '9fb6cd',
		'mediumpurple2' : '9f79ee',
		'grey61' : '9c9c9c',
		'darkseagreen3' : '9bcd9b',
		'purple1' : '9b30ff',
		'palegreen1' : '9aff9a',
		'yellowgreen' : '9acd32',
		'olivedrab3' : '9acd32',
		'lightblue3' : '9ac0cd',
		'darkorchid3' : '9a32cd',
		'darkorchid' : '9932cc',
		'palegreen' : '98fb98',
		'cadetblue1' : '98f5ff',
		'darkslategray1' : '97ffff',
		'paleturquoise3' : '96cdcd',
		'darkviolet' : '9400d3',
		'mediumpurple' : '9370db',
		'purple2' : '912cee',
		'palegreen2' : '90ee90',
		'lightgreen' : '90ee90',
		'darkseagreen' : '8fbc8f',
		'cadetblue2' : '8ee5ee',
		'darkslategray2' : '8deeee',
		'lightskyblue3' : '8db6cd',
		'ivory4' : '8b8b83',
		'lightyellow4' : '8b8b7a',
		'yellow4' : '8b8b00',
		'snow4' : '8b8989',
		'lemonchiffon4' : '8b8970',
		'cornsilk4' : '8b8878',
		'seashell4' : '8b8682',
		'khaki4' : '8b864e',
		'lavenderblush4' : '8b8386',
		'antiquewhite4' : '8b8378',
		'lightgoldenrod4' : '8b814c',
		'wheat4' : '8b7e66',
		'mistyrose4' : '8b7d7b',
		'bisque4' : '8b7d6b',
		'thistle4' : '8b7b8b',
		'navajowhite4' : '8b795e',
		'peachpuff4' : '8b7765',
		'gold4' : '8b7500',
		'burlywood4' : '8b7355',
		'rosybrown4' : '8b6969',
		'goldenrod4' : '8b6914',
		'plum4' : '8b668b',
		'darkgoldenrod4' : '8b658b',
		'pink4' : '8b636c',
		'lightpink4' : '8b5f65',
		'tan4' : '8b5a2b',
		'orange4' : '8b5a00',
		'lightsalmon4' : '8b5742',
		'salmon4' : '8b4c39',
		'orchid4' : '8b4789',
		'palevioletred4' : '8b475d',
		'sienna4' : '8b4726',
		'saddlebrown' : '8b4513',
		'chocolate4' : '8b4513',
		'darkorange4' : '8b4500',
		'coral4' : '8b3e2f',
		'hotpink4' : '8b3a62',
		'indianred4' : '8b3a3a',
		'tomato4' : '8b3626',
		'orangered4' : '8b2500',
		'brown4' : '8b2323',
		'violetred4' : '8b2252',
		'maroon4' : '8b1c62',
		'firebrick4' : '8b1a1a',
		'deeppink4' : '8b0a50',
		'magenta4' : '8b008b',
		'darkmagenta' : '8b008b',
		'red4' : '8b0000',
		'darkred' : '8b0000',
		'blueviolet' : '8a2be2',
		'mediumpurple3' : '8968cd',
		'skyblue1' : '87ceff',
		'lightskyblue' : '87cefa',
		'skyblue' : '87ceeb',
		'lightslateblue' : '8470ff',
		'azure4' : '838b8b',
		'honeydew4' : '838b83',
		'slateblue1' : '836fff',
		'grey51' : '828282',
		'aquamarine' : '7fffd4',
		'aquamarine1' : '7fffd4',
		'chartreuse' : '7fff00',
		'chartreuse1' : '7fff00',
		'skyblue2' : '7ec0ee',
		'purple3' : '7d26cd',
		'lawngreen' : '7cfc00',
		'palegreen3' : '7ccd7c',
		'mediumslateblue' : '7b68ee',
		'cadetblue3' : '7ac5cd',
		'lightcyan4' : '7a8b8b',
		'slateblue2' : '7a67ee',
		'mediumorchid4' : '7a378b',
		'darkslategray3' : '79cdcd',
		'lightslategray' : '778899',
		'aquamarine2' : '76eec6',
		'chartreuse2' : '76ee00',
		'slategrey' : '708090',
		'darkolivegreen4' : '6e8b3d',
		'lightsteelblue4' : '6e7b8b',
		'skyblue3' : '6ca6cd',
		'slategray4' : '6c7b8b',
		'olivedrab' : '6b8e23',
		'slateblue' : '6a5acd',
		'darkseagreen4' : '698b69',
		'olivedrab4' : '698b22',
		'dimgrey' : '696969',
		'grey41' : '696969',
		'slateblue3' : '6959cd',
		'lightblue4' : '68838b',
		'darkorchid4' : '68228b',
		'mediumaquamarine' : '66cdaa',
		'aquamarine3' : '66cdaa',
		'chartreuse3' : '66cd00',
		'paleturquoise4' : '668b8b',
		'cornflowerblue' : '6495ed',
		'steelblue1' : '63b8ff',
		'lightskyblue4' : '607b8b',
		'cadetblue' : '5f9ea0',
		'mediumpurple4' : '5d478b',
		'steelblue2' : '5cacee',
		'darkolivegreen' : '556b2f',
		'purple4' : '551a8b',
		'seagreen1' : '54ff9f',
		'palegreen4' : '548b54',
		'cadetblue4' : '53868b',
		'darkslategray4' : '528b8b',
		'steelblue3' : '4f94cd',
		'grey31' : '4f4f4f',
		'seagreen2' : '4eee94',
		'skyblue4' : '4a708b',
		'mediumturquoise' : '48d1cc',
		'royalblue1' : '4876ff',
		'darkslateblue' : '483d8b',
		'slateblue4' : '473c8b',
		'steelblue' : '4682b4',
		'aquamarine4' : '458b74',
		'chartreuse4' : '458b00',
		'seagreen3' : '43cd80',
		'royalblue2' : '436eee',
		'royalblue' : '4169e1',
		'turquoise' : '40e0d0',
		'mediumseagreen' : '3cb371',
		'royalblue3' : '3a5fcd',
		'steelblue4' : '36648b',
		'grey21' : '363636',
		'limegreen' : '32cd32',
		'darkslategray' : '2f4f4f',
		'seagreen' : '2e8b57',
		'seagreen4' : '2e8b57',
		'royalblue4' : '27408b',
		'forestgreen' : '228b22',
		'lightseagreen' : '20b2aa',
		'dodgerblue' : '1e90ff',
		'dodgerblue1' : '1e90ff',
		'dodgerblue2' : '1c86ee',
		'grey11' : '1c1c1c',
		'midnightblue' : '191970',
		'dodgerblue3' : '1874cd',
		'dodgerblue4' : '104e8b',
		'cyan' : '00ffff',
		'cyan1' : '00ffff',
		'springgreen' : '00ff7f',
		'springgreen1' : '00ff7f',
		'green' : '00ff00',
		'green1' : '00ff00',
		'medspringgreen' : '00fa9a',
		'turquoise1' : '00f5ff',
		'cyan2' : '00eeee',
		'springgreen2' : '00ee76',
		'green2' : '00ee00',
		'turquoise2' : '00e5ee',
		'darkturquoise' : '00ced1',
		'cyan3' : '00cdcd',
		'springgreen3' : '00cd66',
		'green3' : '00cd00',
		'turquoise3' : '00c5cd',
		'deepskyblue' : '00bfff',
		'deepskyblue1' : '00bfff',
		'deepskyblue2' : '00b2ee',
		'deepskyblue3' : '009acd',
		'cyan4' : '008b8b',
		'darkcyan' : '008b8b',
		'springgreen4' : '008b45',
		'green4' : '008b00',
		'turquoise4' : '00868b',
		'deepskyblue4' : '00688b',
		'darkgreen' : '006400',
		'blue' : '0000ff',
		'blue1' : '0000ff',
		'blue2' : '0000ee',
		'mediumblue' : '0000cd',
		'blue3' : '0000cd',
		'blue4' : '00008b',
		'darkblue' : '00008b',
		'navyblue' : '000080',
		'black' : '000000'
	}


}(jQuery);


