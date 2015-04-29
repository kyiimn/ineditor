(function ($, undefined) {
	var DEFAULT_STYLE_FONT_FAMILY = G_FONT_LIST[0]['id'];
	var DEFAULT_STYLE_BACKGROUND_IMAGE = 'url(images/editor/transparent.png)';
	var DEFAULT_STYLE_BACKGROUND_REPEAT = 'repeat';
	var DEFAULT_STYLE_SELECT_BORDER_COLOR = 'red';
	var DEFAULT_STYLE_SELECT_BORDER_WIDTH = '1px';

	var DEFAULT_STYLE = DEFAULT_OBJECT_STYLE;
	DEFAULT_STYLE['font-family'] = [DEFAULT_STYLE_FONT_FAMILY];

	var _GENERATE_UID = function (separator) {
		var delim = separator || "-";

		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}
		return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
	};

	var _IS_ZERO = function (val) {
		if (isNaN(parseFloat(val[0])) || parseFloat(val[0]) == 0) return true;
		return false;
	};

	$.widget('inews.IObject', {
		options: {
			id: undefined,
			type: OBJECT_TYPE_BOX,
			style: {},
			data: undefined,
			editor: false
		},

		_create: function () {
			$(this.element).addClass(this.options.type);
			$(this.element).addClass('object');

			this._uid = _GENERATE_UID();
			$(this.element).attr('data-uid', this._uid);

			if (this.options.id) {
				$(this.element).attr('id', this.options.id);
			}
			this._type = this.options.type;

			$(this.element).trigger(EVT_OBJCREATE);
		},

		_init: function () {
			var self = this;

			this._style = $.extend({}, DEFAULT_STYLE, this.options.style);
			this._saveCSS = false;
			this._enableAnimation = false;

			this._lockResize = false;
			this._lockMove = false;

			if (!this.options.data) {
				this._data = {};
				switch (this.getType()) {
					case OBJECT_TYPE_TEXT:
						this.setData(OBJECT_TYPE_TEXT, '');
						$(this.element).on(EVT_INPUT, '.data', function (e) {
							self.setData('text', $(this).html());
						});
						break;
					case OBJECT_TYPE_IMAGE:
						this.setData(OBJECT_TYPE_IMAGE, {
							actionType: OBJECT_IMAGE_ACTIONTYPE_SWIPE_SCROLL,
							list: []
						});
						break;
					case OBJECT_TYPE_AUDIO:
						this.setData(OBJECT_TYPE_AUDIO, {
							autoPlay: false,
							control: false,
							loop: false,
							list: []
						});
						break;
					case OBJECT_TYPE_VIDEO:
						this.setData(OBJECT_TYPE_VIDEO, {
							site: '',
							width: '',
							height: '',
							key: ''
						});
						break;
					default:
						break;
				}
			} else {
				this._data = this.options.data;
			}
			this.cssAll();

			$(this.element).on(EVT_REDRAW, function (e) {
				self._onRedrawBody();
			});

			$(this.element).on(EVT_RESIZE, function (e) {
				self._onResizingBody();
			});

			$(this.element).on(EVT_EDITORRESIZE, function (e) {
				self._applyCSS();
				self._onResizingBody();
			});
			$(this.element).trigger(EVT_OBJUPDATE);
		},

		destroy: function () {
			switch (this.getType()) {
				case OBJECT_TYPE_TEXT:
					$(this.element).off(EVT_INPUT, '.data');
					break;
				case OBJECT_TYPE_IMAGE:
					break;
				case OBJECT_TYPE_AUDIO:
					break;
				case OBJECT_TYPE_VIDEO:
					break;
				default:
					break;
			}
			$(this.element).off(EVT_REDRAW);
			$(this.element).off(EVT_RESIZE);
			$(this.element).off(EVT_EDITORRESIZE);

			$(this.element).find('> .object').each(function (idx, obj) {
				//$(obj).IObject('destroy');
				$(obj).remove();
			});
			$(this.element).trigger(EVT_OBJDESTROY);

			//$(this.element).remove();

			$.Widget.prototype.destroy.apply(this, arguments);
		},

		_drawResizer: function () {
			$(this.element).append($('<div></div>').addClass('rotater'));

			$(this.element).append($('<div></div>').addClass('resizer').addClass('top'));
			$(this.element).append($('<div></div>').addClass('resizer').addClass('left'));
			$(this.element).append($('<div></div>').addClass('resizer').addClass('bottom'));
			$(this.element).append($('<div></div>').addClass('resizer').addClass('right'));

			$(this.element).append($('<div></div>').addClass('resizer').addClass('topleft'));
			$(this.element).append($('<div></div>').addClass('resizer').addClass('topright'));
			$(this.element).append($('<div></div>').addClass('resizer').addClass('bottomleft'));
			$(this.element).append($('<div></div>').addClass('resizer').addClass('bottomright'));
		},

		_removeResizer: function () {
			$(this.element).find('.rotater').remove();
			$(this.element).find('.resizer').remove();
		},

		_onRedrawBody: function () {
			$(this.element).find('> .data').remove();

			switch (this.getType()) {
				case OBJECT_TYPE_TEXT:
					this._onRedrawTextBody();
					break;
				case OBJECT_TYPE_IMAGE:
					this._onRedrawImageBody();
					break;
				case OBJECT_TYPE_AUDIO:
					this._onRedrawAudioBody();
					break;
				case OBJECT_TYPE_VIDEO:
					this._onRedrawVideoBody();
					break;
				case OBJECT_TYPE_BOX:
				default:
					this._onRedrawBoxBody();
					break;
			}
			this._onResizingBody();
		},

		_onRedrawBoxBody: function () {
			if (!$(this.element).hasClass('file-drop-here')) {
				$(this.element).addClass('file-drop-here');
				$(this.element).attr('data-type', this.getType());
				$(this.element).attr('data-target', $(this.element).attr('id'));
			}
		},

		_onRedrawTextBody: function () {
			$('<span></span>').addClass('data').attr('contentEditable', 'true').html(this.getData('text')).appendTo($(this.element));
		},

		_onRedrawImageBody: function () {
			var imageData = this.getData(OBJECT_TYPE_IMAGE);
			var data = $('<div></div>').addClass('data');

			if (imageData.list.length > 0) {
				var imgSrc, img;

				img = $('<img></img>').addClass('file-drop-here');
				img.attr('data-type', this.getType());
				img.attr('data-target', $(this.element).attr('id'));
				img.appendTo(data);

				data.appendTo($(this.element));

				switch (imageData.list[0].type) {
					case OBJECT_IMAGE_ITEMTYPE_SERVER:
						imgSrc = pathGetImage(imageData.list[0].name);
						break;
					case OBJECT_IMAGE_ITEMTYPE_LINK:
					default:
						imgSrc = imageData.list[0].name;
						break;
				}
				img.load(function () {
					$(this).attr('data-natural-width', this.naturalWidth);
					$(this).attr('data-natural-height', this.naturalHeight);
					$(this).data('loaded', true);
					$(this).trigger(EVT_LOADCOMPLETE);
				});
				img.attr('src', imgSrc);

				// 채움
				if (imageData.list[0].fill == OBJECT_IMAGE_FILLTYPE_FILL) {
					img.css('width', '100%');
					img.css('height', '100%');
				}
			} else {
				var dropArea = $('<div></div>').addClass('drop-area').addClass('file-drop-here');
				var text = $('<span></span>').html(MESSAGE['IMAGE_DROP_HERE']);
				var marginW, marginH;

				dropArea.attr('data-type', this.getType());
				dropArea.attr('data-target', $(this.element).attr('id'));
				dropArea.appendTo(data);

				text.appendTo(dropArea);

				data.appendTo($(this.element));
			}
		},

		_onRedrawAudioBody: function () {
			var audioData = this.getData(OBJECT_TYPE_AUDIO);
			var data = $('<div></div>').addClass('data');
			var dropArea = $('<div></div>').addClass('drop-area').addClass('file-drop-here');
			var text = $('<span></span>');
			var marginW, marginH;

			dropArea.attr('data-type', this.getType());
			dropArea.attr('data-target', $(this.element).attr('id'));
			dropArea.appendTo(data);

			if (audioData.list.length > 0) {
				text.append($('<div></div>').addClass('obj-icon'));
			} else {
				text.append($('<span></span>').html(MESSAGE['AUDIO_DROP_HERE_1']));
			}
			text.append($('<span></span>').addClass('small').html(audioData.list.length + MESSAGE['AUDIO_DROP_HERE_2']));
			text.appendTo(dropArea);

			data.appendTo($(this.element));
		},

		_onRedrawVideoBody: function () {
			var videoData = this.getData(OBJECT_TYPE_VIDEO);
			var data = $('<div></div>').addClass('data');
			var dropArea = $('<div></div>').addClass('drop-area');

			dropArea.appendTo(data);

			if (videoData.key && videoData.site && videoData.width && videoData.height) {
				var imgSrc, img, dropArea;
				var site = inews.property.video.Video.getSite(videoData.site);

				img = $('<img></img>');
				img.css('top', 'calc(50% - '+(site.logoHeight/2)+'px)');
				img.css('left', 'calc(50% - '+(site.logoWidth/2)+'px)');
				img.css('position', 'absolute');
				img.attr('src', site.logo);
				img.appendTo(dropArea);

				data.appendTo($(this.element));
			} else {
				var text = $('<span></span>').html(MESSAGE['VIDEO_IS_NOTSET']);

				text.appendTo(dropArea);
				data.appendTo($(this.element));
			}
		},

		_onResizingBody: function () {
			switch (this.getType()) {
				case OBJECT_TYPE_IMAGE:
					this._onResizingImageBody();
					break;
				case OBJECT_TYPE_AUDIO:
					this._onResizingAudioBody();
					break;
				case OBJECT_TYPE_VIDEO:
					this._onResizingVideoBody();
					break;
				case OBJECT_TYPE_TEXT:
				case OBJECT_TYPE_BOX:
				default:
					break;
			}
		},

		_onResizingImageBody: function () {
			var imageData = this.getData(OBJECT_TYPE_IMAGE);
			var self = this;

			if (imageData.list.length > 0) {
				var width = $(this.element).width();
				var height = $(this.element).height();
				var img = $(this.element).find('.data img');
				var imgWidth, imgHeight;
				var rate, realWidth, realHeight;

				if (!$(img).data('loaded')) {
					$(img).one(EVT_LOADCOMPLETE, function () {
						self._onResizingImageBody();
					});
					return;
				}
				imgWidth = parseInt($(img).attr('data-natural-width'));
				imgHeight = parseInt($(img).attr('data-natural-height'));

				switch (imageData.list[0].fill) {
					case OBJECT_IMAGE_FILLTYPE_AUTOFIT_INNER:
						rate = imgWidth / imgHeight;
						realWidth = Math.round(width);
						realHeight = Math.round(width / rate);

						if (height < realHeight) {
							rate = imgHeight / imgWidth;
							realWidth = Math.round(height / rate);
							realHeight = Math.round(height);
						}
						$(img).width(realWidth);
						$(img).height(realHeight);

						$(img).css('margin-top', Math.floor((height - realHeight) / 2));
						break;

					case OBJECT_IMAGE_FILLTYPE_AUTOFIT_OUTER:
						rate = imgWidth / imgHeight;
						realWidth = Math.round(width);
						realHeight = Math.round(width / rate);

						if (height > realHeight) {
							rate = imgHeight / imgWidth;
							realWidth = Math.round(height / rate);
							realHeight = Math.round(height);
						}
						$(img).width(realWidth);
						$(img).height(realHeight);

						$(img).css('margin-top', Math.floor((height - realHeight) / 2));
						$(img).css('margin-left', Math.floor((width - realWidth) / 2));
						break;
					default:
						break;
				}
			} else {
				var data = $(this.element).find('.data');
				var text = $(this.element).find('span');
				var marginW = (data.width() - text.width()) / 2;
				var marginH = (data.height() - text.height()) / 2;

				text.css('margin-top', Math.floor(marginH));
				text.css('margin-bottom', Math.floor(marginH));
			}
		},

		_onResizingAudioBody: function () {
			var data = $(this.element).find('.data');
			var text = $(this.element).find('.drop-area > span');
			var img = text.find('.obj-icon');
			var marginW, marginH;

			if (img.length > 0) {
				var naturalHeight = 99;
				var orgHeight = text.height() - img.height() + naturalHeight;
				if (orgHeight > data.height()) {
					var newHeight = naturalHeight - (orgHeight - data.height());
					img.css('height', newHeight+'px');
					img.css('background-size', 'auto '+newHeight+'px');
				}
			}
			marginW = (data.width() - text.width()) / 2;
			marginH = (data.height() - text.height()) / 2;

			text.css('margin-top', Math.floor(marginH));
			text.css('margin-bottom', Math.floor(marginH));
		},

		_onResizingVideoBody: function () {
			var videoData = this.getData(OBJECT_TYPE_VIDEO);
			var width = $(this.element).width();
			var height = $(this.element).height();
			var marginW, marginH;
			var self = this;
			var body, bodyW, bodyH;

			if ($(this.element).find('img').length > 0) return;

			body = $(this.element).find('span');
			bodyW = body.width();
			bodyH = body.height();

			marginW = (width - body.width()) / 2;
			marginH = (height - body.height()) / 2;

			body.css('margin-top', Math.floor(marginH));
			body.css('margin-bottom', Math.floor(marginH));
		},

		_getComputeSize: function (val) {
			var ret;

			if (val.length == 1) {
				ret = val[0];
			} else {
				if (isNaN(parseFloat(val[0]))) {
					ret = val[0];
				} else {
					if (val[1] == '%') {
						var parent = $(this.element).parent();
						var fVal = parseFloat(val[0]);
						var refSize;

						if (this.options.editor.getOrientation() == ORIENTATION_LANDSCAPE) {
							refSize = $(parent).height();
						} else {
							refSize = $(parent).width();
						}
						ret = ''+Math.round(refSize * (fVal / 100))+'px';
					} else {
						ret = val[0]+val[1];
					}
				}
			}
			return ret;
		},

		_applyCSS: function () {
			this._applyCSSLeft();
			this._applyCSSTop();
			this._applyCSSRight();
			this._applyCSSBottom();
			this._applyCSSWidth();
			this._applyCSSHeight();
			this._applyCSSMinWidth();
			this._applyCSSMinHeight();
			this._applyCSSMaxWidth();
			this._applyCSSMaxHeight();
			this._applyCSSMarginTop();
			this._applyCSSMarginRight();
			this._applyCSSMarginBottom();
			this._applyCSSMarginLeft();
			this._applyCSSPaddingTop();
			this._applyCSSPaddingRight();
			this._applyCSSPaddingBottom();
			this._applyCSSPaddingLeft();
			this._applyCSSOverflowX();
			this._applyCSSOverflowY();
			this._applyCSSVisibility();
			this._applyCSSPosition();
			this._applyCSSDisplay();
			this._applyCSSFloat();
			this._applyCSSClear();
			this._applyCSSZIndex();
			this._applyCSSBackgroundColor();
			this._applyCSSBackgroundImage();
			this._applyCSSBackgroundRepeat();
			this._applyCSSBackgroundSize();
			this._applyCSSBackgroundAttachment();
			this._applyCSSAnimationName();
			this._applyCSSAnimationDuration();
			this._applyCSSAnimationDelay();
			this._applyCSSAnimationTimingFunction();
			this._applyCSSAnimationDirection();
			this._applyCSSAnimationPlayStage();
			this._applyCSSAnimationIterationCount();
			this._applyCSSFontFamily();
			this._applyCSSTextAlign();
			this._applyCSSFontSize();
			this._applyCSSFontWeight();
			this._applyCSSFontStyle();
			this._applyCSSFontColor();
			this._applyCSSBorderTopWidth();
			this._applyCSSBorderRightWidth();
			this._applyCSSBorderBottomWidth();
			this._applyCSSBorderLeftWidth();
			this._applyCSSBorderTopLeftRadius();
			this._applyCSSBorderTopRightRadius();
			this._applyCSSBorderBottomRightRadius();
			this._applyCSSBorderBottomLeftRadius();
			this._applyCSSBorderStyle();
			this._applyCSSBorderColor();
			this._applyCSSOpacity();
			this._applyCSSBoxShadow();
			this._applyCSSTransform();
		},

		_applyCSSBySize: function (key) {
			var val = this._style[key];

			if (val.length == 1) {
				$(this.element).css(key, val[0]);
			} else {
				if (isNaN(parseFloat(val[0]))) {
					$(this.element).css(key, val[0]);
				} else {
					$(this.element).css(key, val[0]+val[1]);
				}
			}
		},

		_applyCSSByComputSize: function (key) {
			var val = this._getComputeSize(this._style[key]);
			var err = 0;

			if (!isNaN(parseFloat(val)) && this.isSelected()) {
				switch (key) {
					case 'width':
					case 'min-width':
					case 'max-width':
						if (_IS_ZERO(this._style['border-left-width'])) err++;
						if (_IS_ZERO(this._style['border-right-width'])) err++;
						val = 'calc('+val+' - '+err+'px)';
						break;

					case 'height':
					case 'min-height':
					case 'max-height':
						if (_IS_ZERO(this._style['border-top-width'])) err++;
						if (_IS_ZERO(this._style['border-bottom-width'])) err++;
						val = 'calc('+val+' - '+err+'px)';
						break;

					default:
						break;
				}
			} else if ($(this.element).parent().hasClass('object')) {
				var parent = $(this.element).parent();
				if (!isNaN(parseFloat(val)) && parent.IObject('isSelected')) {
					switch (key) {
						case 'left':
							if (_IS_ZERO(parent.IObject('css', 'border-left-width'))) val = 'calc('+val+' - 1px)';
							break;
						case 'right':
							if (_IS_ZERO(parent.IObject('css', 'border-right-width'))) val = 'calc('+val+' - 1px)';
							break;
						case 'top':
							if (_IS_ZERO(parent.IObject('css', 'border-top-width'))) val = 'calc('+val+' - 1px)';
							break;
						case 'bottom':
							if (_IS_ZERO(parent.IObject('css', 'border-bottom-width'))) val = 'calc('+val+' - 1px)';
							break;
						default:
							break;
					}
				}
			}
			$(this.element).css(key, val);
		},

		_applyCSSBySizeWithSelectRule: function (key) {
			var val = this._style[key];

			if (key == 'border-top-width' || key == 'border-bottom-width') {
				this.correctSizeHeight();
				$(this.element).find('> .object').each(function (idx, child) {
					$(child).IObject('correctPositionWidth');
				});
			} else if (key == 'border-right-width' || key == 'border-left-width') {
				this.correctSizeWidth();
				$(this.element).find('> .object').each(function (idx, child) {
					$(child).IObject('correctPositionHeight');
				});
			}

			if (this.isSelected()) {
				if (_IS_ZERO(val)) {
					$(this.element).css(key, DEFAULT_STYLE_SELECT_BORDER_WIDTH);
					return;
				}
			}
			this._applyCSSBySize(key);
		},

		_applyCSSByText: function (key) {
			var val = this._style[key];
			$(this.element).css(key, val[0]);
		},

		_applyCSSByColor: function (key) {
			var val = this._style[key];
			$(this.element).css(key, val[0]);
		},

		_applyCSSByColorWithSelectRule: function (key) {
			if (this.isSelected()) {
				$(this.element).css(key, DEFAULT_STYLE_SELECT_BORDER_COLOR);
			} else {
				this._applyCSSByColor(key);
			}
		},

		_applyCSSLeft: function () {					this._applyCSSByComputSize('left');							},
		_applyCSSTop: function () {						this._applyCSSByComputSize('top');							},
		_applyCSSRight: function () {					this._applyCSSByComputSize('right');						},
		_applyCSSBottom: function () {					this._applyCSSByComputSize('bottom');						},
		_applyCSSWidth: function () {					this._applyCSSByComputSize('width');						},
		_applyCSSHeight: function () {					this._applyCSSByComputSize('height');						},
		_applyCSSMinWidth: function () {				this._applyCSSByComputSize('min-width');					},
		_applyCSSMinHeight: function () {				this._applyCSSByComputSize('min-height');					},
		_applyCSSMaxWidth: function () {				this._applyCSSByComputSize('max-width');					},
		_applyCSSMaxHeight: function () {				this._applyCSSByComputSize('max-height');					},
		_applyCSSMarginTop: function () {				this._applyCSSByComputSize('margin-top');					},
		_applyCSSMarginRight: function () {				this._applyCSSByComputSize('margin-right');					},
		_applyCSSMarginBottom: function () {			this._applyCSSByComputSize('margin-bottom');				},
		_applyCSSMarginLeft: function () {				this._applyCSSByComputSize('margin-left');					},
		_applyCSSPaddingTop: function () {				this._applyCSSByComputSize('padding-top');					},
		_applyCSSPaddingRight: function () {			this._applyCSSByComputSize('padding-right');				},
		_applyCSSPaddingBottom: function () {			this._applyCSSByComputSize('padding-bottom');				},
		_applyCSSPaddingLeft: function () {				this._applyCSSByComputSize('padding-left');					},
		_applyCSSOverflowX: function () {				this._applyCSSByText('overflow-x');							},
		_applyCSSOverflowY: function () {				this._applyCSSByText('overflow-y');							},
		_applyCSSVisibility: function () {				this._applyCSSByText('visibility');							},
		_applyCSSPosition: function () {				this._applyCSSByText('position');							},
		_applyCSSDisplay: function () {					this._applyCSSByText('display');							},
		_applyCSSFloat: function () {					this._applyCSSByText('float');								},
		_applyCSSClear: function () {					this._applyCSSByText('clear');								},
		_applyCSSZIndex: function () {					this._applyCSSByText('z-index');							},
		_applyCSSBackgroundColor: function () {			this._applyCSSByColor('background-color');					},
		_applyCSSBackgroundAttachment: function () {	this._applyCSSByText('background-attachment');				},
		_applyCSSFontFamily: function () {				this._applyCSSByText('font-family');						},
		_applyCSSTextAlign: function () {				this._applyCSSByText('text-align');							},
		_applyCSSFontSize: function () {				this._applyCSSBySize('font-size');							},
		_applyCSSFontWeight: function () {				this._applyCSSByText('font-weight');						},
		_applyCSSFontStyle: function () {				this._applyCSSByText('font-style');							},
		_applyCSSFontColor: function () {				this._applyCSSByColor('color');								},
		_applyCSSBorderTopWidth: function () {			this._applyCSSBySizeWithSelectRule('border-top-width');		},
		_applyCSSBorderRightWidth: function () {		this._applyCSSBySizeWithSelectRule('border-right-width');	},
		_applyCSSBorderBottomWidth: function () {		this._applyCSSBySizeWithSelectRule('border-bottom-width');	},
		_applyCSSBorderLeftWidth: function () {			this._applyCSSBySizeWithSelectRule('border-left-width');	},
		_applyCSSBorderTopLeftRadius: function () {		this._applyCSSBySize('border-top-left-radius');				},
		_applyCSSBorderTopRightRadius: function () {	this._applyCSSBySize('border-top-right-radius');			},
		_applyCSSBorderBottomRightRadius: function () {	this._applyCSSBySize('border-bottom-right-radius');			},
		_applyCSSBorderBottomLeftRadius: function () {	this._applyCSSBySize('border-bottom-left-radius');			},
		_applyCSSBorderStyle: function () {				this._applyCSSByText('border-style');						},
		_applyCSSBorderColor: function () {				this._applyCSSByColorWithSelectRule('border-color');		},
		_applyCSSOpacity: function () {					this._applyCSSByText('opacity');							},

		_applyKeyframe: function (name) {
			var data, aData;
			var kName, kData = {};
			var self = this;

			data = this.options.editor.getData('animation');
			$.each(data, function (idx, val) {
				if (val.name == name) aData = val;
			});
			if (!aData) return false;

			kName = this.id() + '-' + aData.name;

			// for webkit bug.... T.T
			if (this._animationSwitch) {
				kName = this.id() + '-' + aData.name + '-1';
				this._animationSwitch = false;
			} else {
				kName = this.id() + '-' + aData.name + '-0';
				this._animationSwitch = true;
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
							styles[style.css] = self._getComputeSize(style.value);
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
						if (!valSx) valSx = self.css('transform-scale-x');
						if (!valSy) valSy = self.css('transform-scale-y');
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
						if (!valTX) valTX = self.css('transform-translate-x');
						if (!valTY) valTY = self.css('transform-translate-y');
						if (!isNaN(parseFloat(valTX[0])) && !isNaN(parseFloat(valTY[0]))) {
							var parent = $(self.element).parent();
							var fValTX = parseFloat(valTX[0]);
							var fValTY = parseFloat(valTY[0]);
							var refSize, origin = '';

							if (self.options.editor.getOrientation() == ORIENTATION_LANDSCAPE) {
								refSize = $(parent).height();
							} else {
								refSize = $(parent).width();
							}
							val += 'translate(';
							if (valTX[1] == '%') {
								val += ''+Math.round(refSize * (fValTX / 100))+'px'
								origin += (($(self.element).width() / 2)+Math.round(refSize * (fValTX / 100)))+'px ';
							} else {
								val += valTX[0]+valTX[1];
								origin += (($(self.element).width() / 2)+parseFloat(valTX[0]))+valTX[1]+' ';
							}
							val += ',';
							if (valTY[1] == '%') {
								val += ''+Math.round(refSize * (fValTY / 100))+'px'
								origin += (($(self.element).height() / 2)+Math.round(refSize * (fValTY / 100)))+'px ';
							} else {
								val += valTY[0]+valTY[1];
								origin += (($(self.element).height() / 2)+parseFloat(valTY[0]))+valTY[1]+' ';
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
		},

		_applyCSSAnimationName: function () {
			if (this._enableAnimation) {
				var hasKeyframe = false;
				if (this._style['animation-name'] != '') {
					var kName = this._applyKeyframe(this._style['animation-name']);
					if (kName) {
						hasKeyframe = true;
						$(this.element).css('animation-name', kName);
					}
				}
				if (!hasKeyframe) {
					$(this.element).css('animation-name', 'none');
				}
			} else {
				$(this.element).css('animation-name', (DEFAULT_STYLE['animation-name'] != '') ? DEFAULT_STYLE['animation-name'] : 'none');
			}
		},

		_applyCSSAnimationDuration: function (ff) {
			if (this._enableAnimation) {
				$(this.element).css('animation-duration', this._style['animation-duration']+'s');
			} else {
				$(this.element).css('animation-duration', DEFAULT_STYLE['animation-duration']+'s');
			}
			this._applyCSSAnimationName();
		},

		_applyCSSAnimationDelay: function () {
			if (this._enableAnimation) {
				$(this.element).css('animation-delay', this._style['animation-delay']+'s');
			} else {
				$(this.element).css('animation-delay', DEFAULT_STYLE['animation-delay']+'s');
			}
			this._applyCSSAnimationName();
		},

		_applyCSSAnimationTimingFunction: function () {
			if (this._enableAnimation) {
				$(this.element).css('animation-timing-function', this._style['animation-timing-function']);
			} else {
				$(this.element).css('animation-timing-function', DEFAULT_STYLE['animation-timing-function']);
			}
			this._applyCSSAnimationName();
		},

		_applyCSSAnimationDirection: function () {
			if (this._enableAnimation) {
				$(this.element).css('animation-direction', this._style['animation-direction']);
			} else {
				$(this.element).css('animation-direction', DEFAULT_STYLE['animation-direction']);
			}
			this._applyCSSAnimationName();
		},

		_applyCSSAnimationPlayStage: function () {
			if (this._enableAnimation) {
				$(this.element).css('animation-play-state', this._style['animation-play-state']);
			} else {
				$(this.element).css('animation-play-state', DEFAULT_STYLE['animation-play-state']);
			}
			this._applyCSSAnimationName();
		},

		_applyCSSAnimationIterationCount: function () {
			if (this._enableAnimation) {
				$(this.element).css('animation-iteration-count', (this._style['animation-iteration-count'] > 0) ? this._style['animation-iteration-count'] : 'infinite');
			} else {
				$(this.element).css('animation-iteration-count', (DEFAULT_STYLE['animation-iteration-count'] > 0) ? DEFAULT_STYLE['animation-iteration-count'] : 'infinite');
			}
			this._applyCSSAnimationName();
		},

		_applyCSSBackgroundImage: function () {
			var url, val = this._style['background-image'];
			if (val[0] == '') {
				$(this.element).css('background-image', DEFAULT_STYLE_BACKGROUND_IMAGE);
			} else {
				url = 'url(' + pathGetImage(val[0]) + ')';
				$(this.element).css('background-image', url);
			}
		},

		_applyCSSBackgroundRepeat: function () {
			var valR = this._style['background-repeat'];
			var valI = this._style['background-image'];

			if (valI[0] == '') {
				$(this.element).css('background-repeat', DEFAULT_STYLE_BACKGROUND_REPEAT);
			} else {
				$(this.element).css('background-repeat', valR[0]);
			}
		},

		_applyCSSBackgroundSize: function () {
			var valS = this._style['background-size'];
			var valI = this._style['background-image'];

			if (valI[0] == '') {
				$(this.element).css('background-size', 'auto');
			} else {
				if (isNaN(parseFloat(valS[0]))) {
					$(this.element).css('background-size', valS[0]);
				} else {
					$(this.element).css('background-size', valS[0]+valS[1]);
				}
			}
		},

		_applyCSSBoxShadow: function () {
			var valV = this._style['box-shadow-vertical'];
			var valH = this._style['box-shadow-horizontal'];
			var valB = this._style['box-shadow-blur'];
			var val = '';

			if (isNaN(parseInt(valV[0]))) {
				val += valV[0];
			} else {
				val += valV[0] + valV[1];
			}
			val += ' ';

			if (isNaN(parseInt(valH[0]))) {
				val += valH[0];
			} else {
				val += valH[0] + valH[1];
			}
			val += ' ';

			if (isNaN(parseInt(valB[0]))) {
				val += valB[0];
			} else {
				val += valB[0] + valB[1];
			}
			$(this.element).css('box-shadow', val);
		},

		_applyCSSTransform: function () {
			var valSX = this._style['transform-scale-x'];
			var valSY = this._style['transform-scale-y'];
			var valR = this._style['transform-rotate'];
			var valTX = this._style['transform-translate-x'];
			var valTY = this._style['transform-translate-y'];
			var val = '';

			if (!isNaN(parseFloat(valSX[0])) && !isNaN(parseFloat(valSY[0]))) {
				val += 'scale(';
				val += valSX[0];
				val += ',';
				val += valSY[0];
				val += ')';
			}
			val += ' ';

			if (!isNaN(parseFloat(valR[0]))) {
				val += 'rotate(';
				val += valR[0] + valR[1];
				val += ')';

				if (parseFloat(valR[0]) == 0) {
					$(this.element).addClass('zero-angle');
				} else {
					$(this.element).removeClass('zero-angle');
				}
			}
			val += ' ';

			if (!isNaN(parseFloat(valTX[0])) && !isNaN(parseFloat(valTY[0]))) {
				var parent = $(this.element).parent();
				var fValTX = parseFloat(valTX[0]);
				var fValTY = parseFloat(valTY[0]);
				var refSize, origin = '';

				if (this.options.editor.getOrientation() == ORIENTATION_LANDSCAPE) {
					refSize = $(parent).height();
				} else {
					refSize = $(parent).width();
				}
				val += 'translate(';
				if (valTX[1] == '%') {
					val += ''+Math.round(refSize * (fValTX / 100))+'px'
					origin += (($(this.element).width() / 2)+Math.round(refSize * (fValTX / 100)))+'px ';
				} else {
					val += valTX[0]+valTX[1];
					origin += (($(this.element).width() / 2)+parseFloat(valTX[0]))+valTX[1]+' ';
				}
				val += ',';
				if (valTY[1] == '%') {
					val += ''+Math.round(refSize * (fValTY / 100))+'px'
					origin += (($(this.element).height() / 2)+Math.round(refSize * (fValTY / 100)))+'px ';
				} else {
					val += valTY[0]+valTY[1];
					origin += (($(this.element).height() / 2)+parseFloat(valTY[0]))+valTY[1]+' ';
				}
				val += ')';
				$(this.element).css('transform-origin', origin);
			}
			$(this.element).css('transform', val);
		},

		cssAll: function () {
			this._applyCSS();
			return $(this.element);
		},

		css: function () {
			var key, val, unit;

			if (arguments.length == 1) {
				return this._style[arguments[0]];
			} else if (arguments.length > 1) {
			} else {
				return this._style;
			}
			key = '' + arguments[0].toLowerCase();
			val = '' + arguments[1];
			unit = (arguments.length == 3) ? ('' + arguments[2]) : '';

			//if (!isNaN(parseFloat(val))) {
			if ($.isNumeric(val)) {
				if (unit == '%' || key == 'opacity') {
					val = '' + parseFloat(val).toFixed(4);
				} else {
					val = Math.round(parseFloat(val));
				}
			} else {
				switch (key) {
					case 'left':
					case 'top':
					case 'right':
					case 'bottom':
						val = 'auto';
						break;
					default:
						break;
				}
			}
			this._style[key] = (arguments.length == 3) ? [val, unit] : [val];

			switch (arguments[0]) {
				case 'left':						this._applyCSSLeft(); break;
				case 'top':							this._applyCSSTop(); break;
				case 'right':						this._applyCSSRight(); break;
				case 'bottom':						this._applyCSSBottom(); break;
				case 'width':						this._applyCSSWidth(); break;
				case 'height':						this._applyCSSHeight(); break;
				case 'min-width':					this._applyCSSMinWidth(); break;
				case 'min-height':					this._applyCSSMinHeight(); break;
				case 'max-width':					this._applyCSSMaxWidth(); break;
				case 'max-height':					this._applyCSSMaxHeight(); break;
				case 'margin-top':					this._applyCSSMarginTop(); break;
				case 'margin-right':				this._applyCSSMarginRight(); break;
				case 'margin-bottom':				this._applyCSSMarginBottom(); break;
				case 'margin-left':					this._applyCSSMarginLeft(); break;
				case 'padding-top':					this._applyCSSPaddingTop(); break;
				case 'padding-right':				this._applyCSSPaddingRight(); break;
				case 'padding-bottom':				this._applyCSSPaddingBottom(); break;
				case 'padding-left':				this._applyCSSPaddingLeft(); break;
				case 'overflow-x':					this._applyCSSOverflowX(); break;
				case 'overflow-y':					this._applyCSSOverflowY(); break;
				case 'visibility':					this._applyCSSVisibility(); break;
				case 'position':					this._applyCSSPosition(); break;
				case 'display':						this._applyCSSDisplay(); break;
				case 'float':						this._applyCSSFloat(); break;
				case 'clear':						this._applyCSSClear(); break;
				case 'z-index':						this._applyCSSZIndex(); break;
				case 'background-color':			this._applyCSSBackgroundColor(); break;
				case 'background-image':			this._applyCSSBackgroundImage(); break;
				case 'background-repeat':			this._applyCSSBackgroundRepeat(); break;
				case 'background-size':				this._applyCSSBackgroundSize(); break;
				case 'background-attachment':		this._applyCSSBackgroundAttachment(); break;
				case 'animation-name':				this._applyCSSAnimationName(); break;
				case 'animation-duration':			this._applyCSSAnimationDuration(); break;
				case 'animation-delay':				this._applyCSSAnimationDelay(); break;
				case 'animation-timing-function':	this._applyCSSAnimationTimingFunction(); break;
				case 'animation-direction':			this._applyCSSAnimationDirection(); break;
				case 'animation-play-state':		this._applyCSSAnimationPlayStage(); break;
				case 'animation-iteration-count':	this._applyCSSAnimationIterationCount(); break;
				case 'font-family':					this._applyCSSFontFamily(); break;
				case 'text-align':					this._applyCSSTextAlign(); break;
				case 'font-size':					this._applyCSSFontSize(); break;
				case 'font-weight':					this._applyCSSFontWeight(); break;
				case 'font-style':					this._applyCSSFontStyle(); break;
				case 'color':						this._applyCSSFontColor(); break;
				case 'border-top-width':			this._applyCSSBorderTopWidth(); break;
				case 'border-right-width':			this._applyCSSBorderRightWidth(); break;
				case 'border-bottom-width':			this._applyCSSBorderBottomWidth(); break;
				case 'border-left-width':			this._applyCSSBorderLeftWidth(); break;
				case 'border-top-left-radius':		this._applyCSSBorderTopLeftRadius(); break;
				case 'border-top-right-radius':		this._applyCSSBorderTopRightRadius(); break;
				case 'border-bottom-right-radius':	this._applyCSSBorderBottomRightRadius(); break;
				case 'border-bottom-left-radius':	this._applyCSSBorderBottomLeftRadius(); break;
				case 'border-style':				this._applyCSSBorderStyle(); break;
				case 'border-color':				this._applyCSSBorderColor(); break;
				case 'opacity':						this._applyCSSOpacity(); break;
				case 'box-shadow-vertical':
				case 'box-shadow-horizontal':
				case 'box-shadow-blur':				this._applyCSSBoxShadow(); break;
				case 'transform-scale-x':
				case 'transform-scale-y':
				case 'transform-rotate':
				case 'transform-translate-x':
				case 'transform-translate-y':		this._applyCSSTransform(); break;

				default:
					break;
			}
			$(this.element).trigger(EVT_OBJUPDATE);

			return $(this.element);
		},

		uid: function () {
			return this._uid;
		},

		id: function (id) {
			var oldid = $(this.element).attr('id');
			if (!id) return $(this.element).attr('id');
			$(this.element).attr('id', id);
			$(this.element).trigger(EVT_OBJUPDATE);
		},

		select: function () {
			$(this.element).addClass('selected');

			this._applyCSSBorderTopWidth();
			this._applyCSSBorderRightWidth();
			this._applyCSSBorderBottomWidth();
			this._applyCSSBorderLeftWidth();
			this._applyCSSBorderColor();

			this._drawResizer();

			$(this.element).trigger(EVT_SELECT);
		},

		unselect: function () {
			$(this.element).removeClass('selected');

			this._applyCSSBorderTopWidth();
			this._applyCSSBorderRightWidth();
			this._applyCSSBorderBottomWidth();
			this._applyCSSBorderLeftWidth();
			this._applyCSSBorderColor();

			this._removeResizer();

			$(this.element).trigger(EVT_UNSELECT);
		},

		isSelected: function () {
			return ($(this.element).hasClass('selected')) ? 1 : 0;
		},

		moveTranslate: function (x, y, fireEvent) {
			var parent = $(this.element).parent();
			var parentWidth = $(parent).width();
			var parentHeight = $(parent).height();
			var cssTransX = this.css('transform-translate-x');
			var cssTransY = this.css('transform-translate-y');
			var width = $(this.element).width();
			var height = $(this.element).height();
			var oldX, oldY, newX, newY;
			var refSize;

			if (this._lockMove) return;

			if (this.options.editor.getOrientation() == ORIENTATION_LANDSCAPE) {
				refSize = parentHeight;
			} else {
				refSize = parentWidth;
			}

			if (cssTransX[1] == '%') {
				var cssVal = parseFloat(cssTransX[0]);
				if (!cssVal) cssVal = 0;
				oldX = refSize * (cssVal / 100);
			} else {
				oldX = parseFloat(cssTransX[0]);
			}
			newX = oldX + x;

			cssTransX[0] = (cssTransX[1] == '%') ? ((newX / refSize) * 100) : newX;
			this.css('transform-translate-x', cssTransX[0], cssTransX[1]);

			if (cssTransY[1] == '%') {
				var cssVal = parseFloat(cssTransY[0])
				if (!cssVal) cssVal = 0;
				oldY = refSize * (cssVal / 100);
			} else {
				oldY = parseFloat(cssTransY[0]);
			}
			newY = oldY + y;

			cssTransY[0] = (cssTransY[1] == '%') ? ((newY / refSize) * 100) : newY;
			this.css('transform-translate-y', cssTransY[0], cssTransY[1]);

			$(this.element).trigger(EVT_MOVING);
			if (fireEvent) $(this.element).trigger(EVT_MOVE);
		},

		move: function (x, y, fireEvent) {
			var parent = $(this.element).parent();
			var parentWidth = $(parent).width();
			var parentHeight = $(parent).height();
			var cssLeft = this.css('left');
			var cssTop = this.css('top');
			var cssRight = this.css('right');
			var cssBottom = this.css('bottom');
			var width = $(this.element).width();
			var height = $(this.element).height();
			var limitLeft, limitTop, limitRight, limitBottom;
			var oldX, oldY, newX, newY;
			var refSize;

			if (this._lockMove) return;

			if (this.options.editor.getOrientation() == ORIENTATION_LANDSCAPE) {
				refSize = parentHeight;
			} else {
				refSize = parentWidth;
			}
			limitLeft = 0 - (width - 10);
			limitTop = 0 - (height - 10);
			limitRight = parentWidth - 10;
			limitBottom = parentHeight - 10;

			if (!isNaN(parseFloat(cssLeft[0])) && cssRight[0] == 'auto') {
				if (cssLeft[1] == '%') {
					var cssVal = parseFloat(cssLeft[0]);
					if (!cssVal) cssVal = 0;
					oldX = refSize * (cssVal / 100);
				} else {
					oldX = parseFloat(cssLeft[0]);
				}
				newX = oldX + x;

				/*if (newX < limitLeft) newX = limitLeft;
				else if (newX > limitRight) newX = limitRight;*/

				cssLeft[0] = (cssLeft[1] == '%') ? ((newX / refSize) * 100) : newX;
				this.css('left', cssLeft[0], cssLeft[1]);
			} else if (!isNaN(parseFloat(cssRight[0])) && cssLeft[0] == 'auto') {
				if (cssRight[1] == '%') {
					var cssVal = parseFloat(cssRight[0]);
					if (!cssVal) cssVal = 0;
					oldX = refSize * (cssVal / 100);
				} else {
					oldX = parseFloat(cssLeft[0]);
				}
				newX = oldX - x;

				/*if (newX < limitLeft) newX = limitLeft;
				else if (newX > limitRight) newX = limitRight;*/

				cssRight[0] = (cssRight[1] == '%') ? ((newX / refSize) * 100) : newX;
				this.css('right', cssRight[0], cssRight[1]);
			}

			if (!isNaN(parseFloat(cssTop[0])) && cssBottom[0] == 'auto') {
				if (cssTop[1] == '%') {
					var cssVal = parseFloat(cssTop[0])
					if (!cssVal) cssVal = 0;
					oldY = refSize * (cssVal / 100);
				} else {
					oldY = parseFloat(cssTop[0]);
				}
				newY = oldY + y;

				/*if (newY < limitTop) newY = limitTop;
				else if (newY > limitBottom) newY = limitBottom;*/

				cssTop[0] = (cssTop[1] == '%') ? ((newY / refSize) * 100) : newY;
				this.css('top', cssTop[0], cssTop[1]);
			} else if (!isNaN(parseFloat(cssBottom[0])) && cssTop[0] == 'auto') {
				if (cssBottom[1] == '%') {
					var cssVal = parseFloat(cssBottom[0])
					if (!cssVal) cssVal = 0;
					oldY = refSize * (cssVal / 100);
				} else {
					oldY = parseFloat(cssBottom[0]);
				}
				newY = oldY - y;

				/*if (newY < limitTop) newY = limitTop;
				else if (newY > limitBottom) newY = limitBottom;*/

				cssBottom[0] = (cssBottom[1] == '%') ? ((newY / refSize) * 100) : newY;
				this.css('bottom', cssBottom[0], cssBottom[1]);
			}

			$(this.element).trigger(EVT_MOVING);
			if (fireEvent) $(this.element).trigger(EVT_MOVE);
		},

		resize: function (action, x, y, fireEvent) {
			var parent = $(this.element).parent();
			var parentWidth = $(parent).width();
			var parentHeight = $(parent).height();
			var oldWidth = $(this.element).width();
			var oldHeight = $(this.element).height();
			var cssLeft, cssRight, cssTop, cssBottom;
			var cssWidth, cssHeight;
			var newX, newY, newWidth, newHeight;
			var oldX, oldY;
			var refSize;

			if (this._lockResize) return;

			if (this.options.editor.getOrientation() == ORIENTATION_LANDSCAPE) {
				refSize = parentHeight;
			} else {
				refSize = parentWidth;
			}
			cssLeft = this.css('left');
			cssTop = this.css('top');
			cssRight = this.css('right');
			cssBottom = this.css('bottom');
			cssWidth = this.css('width');
			cssHeight = this.css('height');

			if (this.isSelected()) {
				var cssBorderLeft = this.css('border-left-width');
				var cssBorderRight = this.css('border-right-width');
				var cssBorderTop = this.css('border-top-width');
				var cssBorderBottom = this.css('border-bottom-width');

				if (_IS_ZERO(cssBorderLeft)) oldWidth++;
				if (_IS_ZERO(cssBorderRight)) oldWidth++;
				if (_IS_ZERO(cssBorderTop)) oldHeight++;
				if (_IS_ZERO(cssBorderBottom)) oldHeight++;
			}
			if (!isNaN(parseFloat(cssLeft[0])) && cssRight[0] == 'auto') {
				switch (action) {
					case ACT_OBJECT_RESIZE_LEFT:
					case ACT_OBJECT_RESIZE_TOP_LEFT:
					case ACT_OBJECT_RESIZE_BOTTOM_LEFT:
						if (cssLeft[1] == '%') {
							var cssVal = parseFloat(cssLeft[0]);
							if (!cssVal) cssVal = 0;
							oldX = refSize * (cssVal / 100);
						} else {
							oldX = parseFloat(cssLeft[0]);
						}
						break;
					default:
						break;
				}
				switch (action) {
					case ACT_OBJECT_RESIZE_LEFT:
					case ACT_OBJECT_RESIZE_TOP_LEFT:
					case ACT_OBJECT_RESIZE_BOTTOM_LEFT:
						newX = oldX + x;
						cssLeft[0] = (cssLeft[1] == '%') ? ((newX / refSize) * 100) : newX;
						this.css('left', cssLeft[0], cssLeft[1]);
						newWidth = oldWidth - x;
						cssWidth[0] = (cssWidth[1] == '%') ? ((newWidth / refSize) * 100) : newWidth;
						this.css('width', cssWidth[0], cssWidth[1]);
						break;

					case ACT_OBJECT_RESIZE_RIGHT:
					case ACT_OBJECT_RESIZE_TOP_RIGHT:
					case ACT_OBJECT_RESIZE_BOTTOM_RIGHT:
						newWidth = oldWidth + x;
						cssWidth[0] = (cssWidth[1] == '%') ? ((newWidth / refSize) * 100) : newWidth;
						this.css('width', cssWidth[0], cssWidth[1]);
						break;

					default:
						break;
				}
			} else if (!isNaN(parseFloat(cssRight[0])) && cssLeft[0] == 'auto') {
				switch (action) {
					case ACT_OBJECT_RESIZE_RIGHT:
					case ACT_OBJECT_RESIZE_TOP_RIGHT:
					case ACT_OBJECT_RESIZE_BOTTOM_RIGHT:
						if (cssRight[1] == '%') {
							var cssVal = parseFloat(cssRight[0]);
							if (!cssVal) cssVal = 0;
							oldX = refSize * (cssVal / 100);
						} else {
							oldX = parseFloat(cssRight[0]);
						}
						break;
					default:
						break;
				}
				switch (action) {
					case ACT_OBJECT_RESIZE_LEFT:
					case ACT_OBJECT_RESIZE_TOP_LEFT:
					case ACT_OBJECT_RESIZE_BOTTOM_LEFT:
						newWidth = oldWidth - x;
						cssWidth[0] = (cssWidth[1] == '%') ? ((newWidth / refSize) * 100) : newWidth;
						this.css('width', cssWidth[0], cssWidth[1]);
						break;

					case ACT_OBJECT_RESIZE_RIGHT:
					case ACT_OBJECT_RESIZE_TOP_RIGHT:
					case ACT_OBJECT_RESIZE_BOTTOM_RIGHT:
						newX = oldX - x;
						cssRight[0] = (cssRight[1] == '%') ? ((newX / refSize) * 100) : newX;
						this.css('right', cssRight[0], cssRight[1]);
						newWidth = oldWidth + x;
						cssWidth[0] = (cssWidth[1] == '%') ? ((newWidth / refSize) * 100) : newWidth;
						this.css('width', cssWidth[0], cssWidth[1]);
						break;

					default:
						break;
				}
			}

			if (!isNaN(parseFloat(cssTop[0])) && cssBottom[0] == 'auto') {
				switch (action) {
					case ACT_OBJECT_RESIZE_TOP:
					case ACT_OBJECT_RESIZE_TOP_LEFT:
					case ACT_OBJECT_RESIZE_TOP_RIGHT:
						if (cssTop[1] == '%') {
							var cssVal = parseFloat(cssTop[0])
							if (!cssVal) cssVal = 0;
							oldY = refSize * (cssVal / 100);
						} else {
							oldY = parseFloat(cssTop[0]);
						}
						break;
					default:
						break;
				}
				switch (action) {
					case ACT_OBJECT_RESIZE_TOP:
					case ACT_OBJECT_RESIZE_TOP_LEFT:
					case ACT_OBJECT_RESIZE_TOP_RIGHT:
						newY = oldY + y;
						cssTop[0] = (cssTop[1] == '%') ? ((newY / refSize) * 100) : newY;
						this.css('top', cssTop[0], cssTop[1]);
						newHeight = oldHeight - y;
						cssHeight[0] = (cssHeight[1] == '%') ? ((newHeight / refSize) * 100) : newHeight;
						this.css('height', cssHeight[0], cssHeight[1]);
						break;

					case ACT_OBJECT_RESIZE_BOTTOM:
					case ACT_OBJECT_RESIZE_BOTTOM_LEFT:
					case ACT_OBJECT_RESIZE_BOTTOM_RIGHT:
						newHeight = oldHeight + y;
						cssHeight[0] = (cssHeight[1] == '%') ? ((newHeight / refSize) * 100) : newHeight;
						this.css('height', cssHeight[0], cssHeight[1]);
						break;

					default:
						break;
				}
			} else if (!isNaN(parseFloat(cssBottom[0])) && cssTop[0] == 'auto') {
				switch (action) {
					case ACT_OBJECT_RESIZE_BOTTOM:
					case ACT_OBJECT_RESIZE_BOTTOM_LEFT:
					case ACT_OBJECT_RESIZE_BOTTOM_RIGHT:
						if (cssBottom[1] == '%') {
							var cssVal = parseFloat(cssBottom[0])
							if (!cssVal) cssVal = 0;
							oldY = refSize * (cssVal / 100);
						} else {
							oldY = parseFloat(cssBottom[0]);
						}
						break;
					default:
						break;
				}
				switch (action) {
					case ACT_OBJECT_RESIZE_TOP:
					case ACT_OBJECT_RESIZE_TOP_LEFT:
					case ACT_OBJECT_RESIZE_TOP_RIGHT:
						newHeight = oldHeight - y;
						cssHeight[0] = (cssHeight[1] == '%') ? ((newHeight / refSize) * 100) : newHeight;
						this.css('height', cssHeight[0], cssHeight[1]);
						break;

					case ACT_OBJECT_RESIZE_BOTTOM:
					case ACT_OBJECT_RESIZE_BOTTOM_LEFT:
					case ACT_OBJECT_RESIZE_BOTTOM_RIGHT:
						newY = oldY - y;
						cssBottom[0] = (cssBottom[1] == '%') ? ((newY / refSize) * 100) : newY;
						this.css('bottom', cssBottom[0], cssBottom[1]);
						newHeight = oldHeight + y;
						cssHeight[0] = (cssHeight[1] == '%') ? ((newHeight / refSize) * 100) : newHeight;
						this.css('height', cssHeight[0], cssHeight[1]);
						break;

					default:
						break;
				}
			}
			this._onResizingBody();

			$(this.element).trigger(EVT_RESIZING);
			if (fireEvent) $(this.element).trigger(EVT_RESIZE);
		},

		getType: function () {
			return this._type;
		},

		getData: function (type) {
			if (type == undefined) return this._data;
			if (!this._data[type]) return [];
			return this._data[type];
		},

		setData: function (type, value) {
			this._data[type] = value;
			$(this.element).trigger(EVT_OBJUPDATE);
		},

		saveCSS: function (css) {
			var json;

			if (css != undefined) {
				if (this._saveCSS) {
					json = $.JSON.encode(this._style[css]);
					this._saveCSS[css] = $.JSON.decode(json);
				} else {
					css == undefined;
				}
			}
			if (css == undefined) {
				json = $.JSON.encode(this._style);
				this._saveCSS = $.JSON.decode(json);
			}
		},

		loadCSS: function (css) {
			var json;

			if (!this._saveCSS) return;
			if (css == undefined) {
				json = $.JSON.encode(this._saveCSS);
				this._style = $.JSON.decode(json);
			} else {
				json = $.JSON.encode(this._saveCSS[css]);
				this._style[css] = $.JSON.decode(json);
			}
			this._applyCSS();

			$(this.element).trigger(EVT_OBJUPDATE);
		},

		setLockResize: function (val) {
			this._lockResize = val;
		},

		getLockResize: function () {
			return this._lockResize;
		},

		setLockMove: function (val) {
			this._lockMove = val;
		},

		getLockMove: function () {
			return this._lockMove;
		},

		applyData: function (type) {
			var data = this.getData(type);
			var tmp1;

			switch (type) {
				case 'transition':
					tmp1 = '';
					$.each(data, function (idx, val) {
						if (tmp1 != '') tmp1 += ',';
						tmp1 += val['property']+' '+val['duration']+'s '+val['timing'];
					});
					$(this.element).css('transition', tmp1);
					break;
				case 'animation':
					this._enableAnimation = true;
					this._applyCSSAnimationName();
					this._applyCSSAnimationDuration(1);
					this._applyCSSAnimationDelay();
					this._applyCSSAnimationTimingFunction(1);
					this._applyCSSAnimationDirection();
					this._applyCSSAnimationPlayStage();
					this._applyCSSAnimationIterationCount();
					break;

				default:
					break;
			}
		},

		unapplyData: function (type) {
			switch (type) {
				case 'transition':
					$(this.element).css('transition', 'initial');
					break;

				case 'animation':
					this._enableAnimation = false;
					this._applyCSSAnimationName();
					this._applyCSSAnimationDuration();
					this._applyCSSAnimationDelay();
					this._applyCSSAnimationTimingFunction();
					this._applyCSSAnimationDirection();
					this._applyCSSAnimationPlayStage();
					this._applyCSSAnimationIterationCount();
					break;

				default:
					break;
			}
		},

		getPath: function () {
			var path = [];
			var obj = $(this.element);

			do {
				if (obj.hasClass('editor')) {
					path.push({
						id: '',
						uid: 'body',
						type: 'body'
					});
					break;
				}
				path.push({
					id: obj.IObject('id'),
					uid: obj.IObject('uid'),
					type: obj.IObject('getType')
				});
				obj = obj.parent();
			} while (true);

			return path;
		},

		correctPositionWidth:function () {
			this._applyCSSLeft();
			this._applyCSSRight();
		},

		correctPositionHeight: function () {
			this._applyCSSTop();
			this._applyCSSBottom();
		},

		correctSizeWidth:function () {
			this._applyCSSWidth();
			this._applyCSSMinWidth();
			this._applyCSSMaxWidth();
		},

		correctSizeHeight:function () {
			this._applyCSSHeight();
			this._applyCSSMinHeight();
			this._applyCSSMaxHeight();
		}
	});
}(jQuery));
