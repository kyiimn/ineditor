function objectInit() {
	videoLoadYoutubeAPI();
	videoLoadVimeoAPI();

	$.each(G_OBJECT_DATA, function (id, data) {
		var obj = $('#'+id);
		if (obj.length < 1) return;

		obj.addClass('object');
		obj.addClass('transition');

		obj.attr('data-type', data.type);

		obj.data('type', data.type);
		obj.data('default-style', $.extend(true, {}, data.css));
		obj.data('style', $.extend(true, {}, data.css));

		$.each(data.data, function (key, value) {
			obj.data(key, value);
			switch (key) {
				case 'event':
					eventInit(obj, value);
					break;
				case 'image':
					imageInit(obj, value);
					break;
				case 'audio':
					audioInit(obj, value);
					break;
				case 'video':
					videoInit(obj, value);
					break;
				case 'text':
					obj.html(value);
					break;
				default:
					break;
			}
		});
	});
}

function objectSizeToPixel(parent, x, y) {
	var fX, fY, refSize;
	var retX, retY;

	if (G_CONF.orientation == 'landscape') {
		refSize = $(parent).height();
	} else {
		refSize = $(parent).width();
	}

	if (x.charAt(x.length - 1) == '%') {
		fX = parseFloat(x.substr(0, x.length - 1));
		retX = ''+Math.round(refSize * (fX / 100))+'px';
	} else {
		retX = x;
	}

	if (y != undefined) {
		if (y.charAt(y.length - 1) == '%') {
			fY = parseFloat(y.substr(0, y.length - 1));
			retY = ''+Math.round(refSize * (fY / 100))+'px';
		} else {
			retY = y;
		}
		return {
			x: retX, y: retY
		};
	} else {
		return retX;
	}
}

function objectSetStyle(obj, key, value) {
	var parent = $(obj).parent();
	var style = $(obj).data('style');
	var tmp1, tmp2, tmp3, tmp4;

	switch (key) {
		case 'left':
		case 'top':
		case 'right':
		case 'bottom':
		case 'width':
		case 'height':
		case 'min-width':
		case 'min-height':
		case 'max-width':
		case 'max-height':
		case 'margin-top':
		case 'margin-right':
		case 'margin-bottom':
		case 'margin-left':
		case 'padding-top':
		case 'padding-right':
		case 'padding-bottom':
		case 'padding-left':
			$(obj).css(key, objectSizeToPixel(parent, value));
			break;

		case 'background-image':
			if (value != 'initial') {
				tmp1 = 'url('+G_CONF['images']+value+')';
				$(obj).css('background-image', tmp1);
			} else {
				$(obj).css('background-image', 'none');
			}
			break;

		case 'box-shadow-vertical':
		case 'box-shadow-horizontal':
		case 'box-shadow-blur':
			tmp1 = {};
			tmp1[key] = value;
			tmp2 = $.extend({}, {
				'box-shadow-vertical': style['box-shadow-vertical'],
				'box-shadow-horizontal': style['box-shadow-horizontal'],
				'box-shadow-blur': style['box-shadow-blur']
			}, tmp1);

			$(obj).css('box-shadow', tmp2['box-shadow-vertical']+' '+tmp2['box-shadow-horizontal']+' '+tmp2['box-shadow-blur']);
			break;

		case 'transform-scale-x':
		case 'transform-scale-y':
		case 'transform-rotate':
		case 'transform-translate-x':
		case 'transform-translate-y':
			tmp1 = {};
			tmp1[key] = value;
			tmp2 = $.extend({}, {
				'transform-scale-x': style['transform-scale-x'],
				'transform-scale-y': style['transform-scale-y'],
				'transform-rotate': style['transform-rotate'],
				'transform-translate-x': style['transform-translate-x'],
				'transform-translate-y': style['transform-translate-y']
			}, tmp1);
			tmp3 = objectSizeToPixel(parent, style['transform-translate-x'], style['transform-translate-y']);

			tmp4  = 'scale('+style['transform-scale-x']+','+style['transform-scale-y']+') ';
			tmp4 += 'rotate('+style['transform-rotate']+') ';
			tmp4 += 'translate('+tmp3['x']+','+tmp3['y']+') ';

			$(obj).css('transform-origin', '' + (($(obj).width()/2)+parseFloat(tmp3['x'])) + 'px ' + (($(obj).height()/2)+parseFloat(tmp3['y'])) + 'px');
			$(obj).css('transform', tmp4);
			break;

		case 'animation-name':
			if (value == '') {
				$(obj).css(key, 'none');
				$(obj).data('animationName', '');
			} else {
				var kName = objectMakeKeyframe(obj, value);
				$(obj).css(key, kName);
			}
			break;

		case 'animation-delay':
		case 'animation-duration':
			$(obj).css(key, value + 's');
			objectResetKeyframe(obj);
			break;

		case 'animation-iteration-count':
			$(obj).css(key, (value == '0') ? 'infinite' : value);
			objectResetKeyframe(obj);
			break;

		case 'animation-timing-function':
		case 'animation-direction':
		case 'animation-play-state':
			$(obj).css(key, value);
			objectResetKeyframe(obj);
			break;

		default:
			$(obj).css(key, value);
			break;
	}
	style[key] = value;

	$(obj).data('style', style);

	return $(obj);
}

function objectResetKeyframe(obj) {
	var style = $(obj).data('style');

	if (!style['animation-name']) return;
	objectSetStyle(obj, 'animation-name', style['animation-name']);
}

function objectMakeKeyframe(obj, name) {
	var style = $(obj).data('style');
	var data, aData;
	var kName, kData = {};

	data = G_BODY_DATA['animation'];
	if (!data) return false;

	$.each(data, function (idx, val) {
		if (val.name == name) aData = val;
	});
	if (!aData) return false;

	// for webkit bug.... T.T
	if ($(obj).data('animationSwitch')) {
		kName = $(obj).attr('id') + '-' + aData.name + '-1';
		$(obj).data('animationSwitch', 0);
	} else {
		kName = $(obj).attr('id') + '-' + aData.name + '-0';
		$(obj).data('animationSwitch', 1);
	}

	kData.name = kName;
	$.each(aData.datas, function (idx, keyframe) {
		var styles = {}, transform = {};
		$.each(keyframe.datas, function (idx, style) {
			switch (style.css) {
				case 'left':
				case 'top':
				case 'right':
				case 'bottom':
				case 'width':
				case 'height':
				case 'min-width':
				case 'min-height':
				case 'max-width':
				case 'max-height':
				case 'margin-top':
				case 'margin-right':
				case 'margin-bottom':
				case 'margin-left':
				case 'padding-top':
				case 'padding-right':
				case 'padding-bottom':
				case 'padding-left':
					styles[style.css] = objectSizeToPixel($(obj).parent(), (style.value.length == 1) ? style.value[0] : (style.value[0] + style.value[1]));
					break;

				case 'opacity':
					styles[style.css] = style.value[0];
					break;

				case 'background-color':
				case 'color':
				case 'border-color':
					styles[style.css] = style.value[0];
					break;

				case 'font-size':
				case 'border-top-width':
				case 'border-right-width':
				case 'border-bottom-width':
				case 'border-left-width':
					if (style.value.length == 1) {
						styles[style.css] = style.value[0];
					} else {
						if (isNaN(parseFloat(style.value[0]))) {
							styles[style.css] = style.value[0];
						} else {
							styles[style.css] = style.value[0]+style.value[1];
						}
					}
					break;

				case 'transform-scale-x':
				case 'transform-scale-y':
				case 'transform-rotate':
				case 'transform-translate-x':
				case 'transform-translate-y':
					transform[style.css] = style.value;
					break;

				default:
					break;
			}
		});
		{
			var valSX = transform['transform-scale-x'];
			var valSY = transform['transform-scale-y'];
			var valR = transform['transform-rotate'];
			var valTX = transform['transform-translate-x'];
			var valTY = transform['transform-translate-y'];
			var val = '';

			if (valSX || valSY) {
				if (!valSX) {
					var tmp = style['transform-scale-x'];
					valSX = [parseFloat(tmp).toString()];
					valSX.push(tmp.replace(valSX[0], ''));
				}
				if (!valSY) {
					var tmp = style['transform-scale-y'];
					valSY = [parseFloat(tmp).toString()];
					valSY.push(tmp.replace(valSY[0], ''));
				}
				if (!isNaN(parseFloat(valSX[0])) && !isNaN(parseFloat(valSY[0]))) {
					val += 'scale('+valSX[0]+','+valSY[0]+') ';
				}
			}
			if (valR) {
				if (!isNaN(parseFloat(valR[0]))) {
					val += 'rotate('+valR[0]+valR[1]+') ';
				}
			}
			if (valTX || valTY) {
				if (!valTX) {
					var tmp = style['transform-translate-x'];
					valTX = [parseFloat(tmp).toString()];
					valTX.push(tmp.replace(valTX[0], ''));
				}
				if (!valTY) {
					var tmp = style['transform-translate-y'];
					valTY = [parseFloat(tmp).toString()];
					valTY.push(tmp.replace(valTY[0], ''));
				}
				if (!isNaN(parseFloat(valTX[0])) && !isNaN(parseFloat(valTY[0]))) {
					var parent = $(obj).parent();
					var fValTX = parseFloat(valTX[0]);
					var fValTY = parseFloat(valTY[0]);
					var refSize, origin = '';

					if (G_CONF.orientation == 'landscape') {
						refSize = $(parent).height();
					} else {
						refSize = $(parent).width();
					}
					val += 'translate(';
					if (valTX[1] == '%') {
						val += ''+Math.round(refSize * (fValTX / 100))+'px';
						origin += (($(obj).width()/2)+Math.round(refSize * (fValTX / 100)))+'px ';
					} else {
						val += valTX[0]+valTX[1];
						origin += (($(obj).width()/2)+parseFloat(valTX[0]))+valTX[1]+' ';
					}
					val += ',';
					if (valTY[1] == '%') {
						val += ''+Math.round(refSize * (fValTY / 100))+'px'
						origin += (($(obj).height()/2)+Math.round(refSize * (fValTY / 100)))+'px ';
					} else {
						val += valTY[0]+valTY[1];
						origin += (($(obj).height()/2)+parseFloat(valTY[0]))+valTY[1]+' ';
					}
					val += ')';

					styles['transform-origin'] = origin;
				}
			}
			styles['transform'] = val;
		}
		kData[keyframe.keyframe] = styles;
	});
	$.keyframe.define([kData]);

	return kName;
}

function objectSetDefaultStyle(obj) {
	var style = $(obj).data('default-style');

	$.each(style, function (key, value) {
		objectSetStyle(obj, key, value);
	});
}

function objectRedrawStyle(obj) {
	var style = $(obj).data('style');

	$(obj).removeClass('transition');
	$.each(style, function (key, value) {
		objectSetStyle(obj, key, value);
	});
	$(obj).addClass('transition');

	$(obj).find('> .object').each(function (idx, childObj) {
		objectRedrawStyle($(childObj));
	});
}
