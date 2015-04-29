(function ($, undefined) {
	var _MOUSE_ACTION = ACT_NONE;

	var _USE_TOOL = EDITOR_TOOL_SELECT;

	var LOCK_MOVE = false;
	var LOCK_SELECT = false;
	var LOCK_RESIZE = false;
	var LOCK_CREATE = false;

	var DEFAULT_STYLE_BACKGROUND_IMAGE = ['url(images/editor/bg.png)'];
	var DEFAULT_STYLE_BACKGROUND_REPEAT = ['repeat'];

	var DEFAULT_STYLE = {
		'background-color':				DEFAULT_OBJECT_STYLE['background-color'],
		'background-image':				DEFAULT_OBJECT_STYLE['background-image'],
		'background-repeat':			DEFAULT_OBJECT_STYLE['background-repeat'],
		'background-size':				DEFAULT_OBJECT_STYLE['background-size'],
		'background-attachment':		DEFAULT_OBJECT_STYLE['background-attachment'],
	};

	var _OBJ_GET_OFFSET_LEFT = function (obj) {
		var parent = $(obj);
		var left = 0;

		do {
			parent = $(parent).parent();
			if (!$(parent).length) break;
			left += parent[0].offsetLeft;
		} while (!$(parent).hasClass('editor'));

		return left;
	};

	var _OBJ_GET_OFFSET_TOP = function (obj) {
		var parent = $(obj);
		var top = 0;

		do {
			parent = $(parent).parent();
			if (!$(parent).length) break;
			top += parent[0].offsetTop;
		} while (!$(parent).hasClass('editor'));

		return top;
	};

	var _GET_RESIZER_TYPE = function (resizer) {
		var act = false;

		if (!$(resizer).hasClass('resizer')) return false;

		if ($(resizer).hasClass('top')) {
			act = ACT_OBJECT_RESIZE_TOP;
		} else if ($(resizer).hasClass('topleft')) {
			act = ACT_OBJECT_RESIZE_TOP_LEFT;
		} else if ($(resizer).hasClass('left')) {
			act = ACT_OBJECT_RESIZE_LEFT;
		} else if ($(resizer).hasClass('bottomleft')) {
			act = ACT_OBJECT_RESIZE_BOTTOM_LEFT;
		} else if ($(resizer).hasClass('bottom')) {
			act = ACT_OBJECT_RESIZE_BOTTOM;
		} else if ($(resizer).hasClass('bottomright')) {
			act = ACT_OBJECT_RESIZE_BOTTOM_RIGHT;
		} else if ($(resizer).hasClass('right')) {
			act = ACT_OBJECT_RESIZE_RIGHT;
		} else if ($(resizer).hasClass('topright')) {
			act = ACT_OBJECT_RESIZE_TOP_RIGHT;
		}
		return act;
	};

	$.widget('inews.IEditor', {
		options: {
			orientation: ORIENTATION_LANDSCAPE,

			style: {},
			data: {},

			onCustomMouseMove: false,
			onCustomMouseStop: false,
			onCustomMouseOut: false,

			magnet: 5,
			rotateZeroLock: 10
		},

		_create: function () {
			var editor = $('<div></div>').addClass('editor');
			editor.addClass('file-drop-here');
			editor.attr('data-target', 'document');
			editor.attr('data-type', 'document');

			switch (this.options.orientation) {
				case ORIENTATION_PORTRAIT:
					$(this.element).addClass(ORIENTATION_PORTRAIT);
					break;

				case ORIENTATION_LANDSCAPE:
				default:
					$(this.element).addClass(ORIENTATION_LANDSCAPE);
					break;
			}
			$(this.element).append(editor);

			$(this.element).trigger(EVT_EDITORCREATE);
		},

		_init: function () {
			var self = this;

			this._style = $.extend({}, DEFAULT_STYLE, this.options.style);
			this._data = $.extend({}, {}, this.options.data);
			this._modified = false;

			if (G_MAIN_TOUCH_ENABLE) {
				this.options.magnet = Math.max(this.options.magnet, 15);
				this.options.rotateZeroLock = Math.max(this.options.rotateZeroLock, 15);
			}
			this._applyCSS();

			$(this.element).on(EVT_MOUSESTART, '.editor .object .rotater', function (e) {
				var src = $(this).parent();

				if (e.which != 1) return;

				CHECK_TOUCH(e);

				self._rotateObjectStart(src, e);

				e.preventDefault();
				e.stopPropagation();
			});


			$(this.element).on(EVT_MOUSESTART, '.editor .object .resizer', function (e) {
				var evts = CHECK_TOUCH_SWIPE(e);

				if (e.which != 1) return;

				$.each(evts, function (i, evt) {
					var src = $(evt.source).parent();
					var act = _GET_RESIZER_TYPE(evt.source);
					if (!act) return;
					self._resizeObjectStart(_GET_RESIZER_TYPE(evt.source), src, evt) ;
				});
				e.preventDefault();
				e.stopPropagation();
			});

			$(this.element).on(EVT_MOUSESTART, '.editor, .editor *', function (e) {
				var evts = CHECK_TOUCH_SWIPE(e);
				var src = $(this);
				var ret = false;

				if (e.which != 1) return;

				$.each(evts, function (i, evt) {
					ret = self._onMouseStart(src, $(self.element), evt) ? true : ret;
				});
				if (ret) {
					e.preventDefault();
					e.stopPropagation();
				}
			});

			$(this.element).on(EVT_MOUSEMOVE, function (e) {
				var evts = CHECK_TOUCH_SWIPE(e);
				var ret = false;

				if (self.options.onCustomMouseMove) {
					var editorx = e.pageX - self.element[0].offsetLeft;
					var editory = e.pageY - self.element[0].offsetTop;
					var objx = e.pageX - e.target.offsetLeft;
					var objy = e.pageY - e.target.offsetTop;
					self.options.onCustomMouseMove([editorx, editory], [objx, objy], e);
				}
				$.each(evts, function (i, evt) {
					var src = $(evt.source).parent();
					var act = _GET_RESIZER_TYPE(evt.source);
					if (!act) return;
					ret = self._resizeObjectMove(act, src, evt)  ? true : ret;
				});

				if (!ret) {
					$.each(evts, function (i, evt) {
						if ($(evt.source).hasClass('resizer')) return;
						ret = self._onMouseMove($(self.element), evt) ? true : ret;
					});
				}
				if (ret) {
					e.preventDefault();
					e.stopPropagation();
				}
			});

			$(this.element).on(EVT_MOUSESTOP, function (e) {
				var evts = CHECK_TOUCH_SWIPE(e);
				var ret = false;

				if (self.options.onCustomMouseStop) {
					var editorx = e.pageX - self.element[0].offsetLeft;
					var editory = e.pageY - self.element[0].offsetTop;
					var objx = e.pageX - e.target.offsetLeft;
					var objy = e.pageY - e.target.offsetTop;
					self.options.onCustomMouseStop([editorx, editory], [objx, objy], e);
				}

				$.each(evts, function (i, evt) {
					var src = $(evt.source).parent();
					var act = _GET_RESIZER_TYPE(evt.source);
					if (!act) return;
					ret = self._resizeObjectEnd(act, src, evt) ? true : ret;
				});

				if (!ret) {
					$.each(evts, function (i, evt) {
						if ($(evt.source).hasClass('resizer')) return;
						ret = self._onMouseStop($(self.element), evt) ? true : ret;
					});
				};
				if (ret) {
					e.preventDefault();
					e.stopPropagation();
				}
			});

			$(this.element).on(EVT_MOUSEOUT, function (e) {
				if (self.options.onCustomMouseOut) {
					self.options.onCustomMouseOut(e);
				}
			});

			$(this.element).on(EVT_CONTEXTMENU, '.editor .object', function (e) {
				CHECK_TOUCH(e);

				self._onContextMenu(e);

				e.preventDefault();
				e.stopPropagation();
			});

			$(this.element).on(EVT_OBJUPDATE, '.editor .object', function (e) {
				self._modified = true;

				self._docSizeUpdate(this);

				e.preventDefault();
				e.stopPropagation();
			});
		},

		_docSizeUpdate: function (targetObj) {
			var parent = $(targetObj).parent();
			var maxWidth = 0, maxHeight = 0;
			var self = this;
			var propScrollPos;

			if (!$(parent).hasClass('editor')) return;

			if ($(parent).prop('scrollWidth') != undefined) {
				maxWidth = $(parent).prop('scrollWidth');
				maxHeight = $(parent).prop('scrollHeight');
			} else {
				$(this.element).find('.editor > .object').each(function (idx, obj) {
					if (self.getOrientation() == ORIENTATION_LANDSCAPE) {
						var position = $(obj).position();
						var newWidth = 0;

						if ($(obj).css('left') == 'auto') return;

						newWidth += $(obj).outerWidth(true);
						newWidth += position.left;

						if (maxWidth < newWidth) maxWidth = newWidth;
					} else {
						var position = $(obj).position();
						var newHeight = 0;

						if ($(obj).css('top') == 'auto') return;

						newHeight += $(obj).outerHeight(true);
						newHeight += position.top;

						if (maxHeight < newHeight) maxHeight = newHeight;
					}
				});
			}
			if (this.getOrientation() == ORIENTATION_LANDSCAPE) {
				$(parent).width(maxWidth);
			} else {
				$(parent).height(maxHeight);
			}
		},

		destroy: function () {
			$(this.element).find('.editor > .object').each(function (idx, obj) {
				//$(obj).IObject('destroy');
				$(obj).remove();
			});

			$(this.element).removeClass(ORIENTATION_PORTRAIT);
			$(this.element).removeClass(ORIENTATION_LANDSCAPE);

			$(this.element).off(EVT_MOUSESTART, '.editor .object .resizer');
			$(this.element).off(EVT_MOUSESTART, '.editor .object .rotater');
			$(this.element).off(EVT_MOUSESTART, '.editor, .editor *');
			$(this.element).off(EVT_MOUSEMOVE);
			$(this.element).off(EVT_MOUSESTOP);
			$(this.element).off(EVT_MOUSEOUT);

			$(this.element).off(EVT_CONTEXTMENU, '.editor .object');
			$(this.element).off(EVT_OBJUPDATE, '.editor .object');

			$(this.element).off(EVT_RESIZE);

			$(this.element).empty();

			$(this.element).trigger(EVT_EDITORDESTROY);

			$.Widget.prototype.destroy.apply(this, arguments);
		},

		_onContextMenu: function (e) {
			var items = [], self = this;
			var objs = $(this.element).find('.object.selected');

			items.push({
				text: MESSAGE['CONTEXTMENU_OBJECT_REMOVE'],
				handler: function () {
					$(objs).each(function (idx, obj) {
						//$(obj).IObject('destroy');
						$(obj).remove();
					});
				}
			});
			if (objs.length == 1) {
				var lockResize = $(objs).IObject('getLockResize');
				var lockMove = $(objs).IObject('getLockMove');

				items.push('-');
				items.push({
					text: MESSAGE['CONTEXTMENU_LOCK_RESIZE'],
					checkbox: lockResize,
					handler: function () {
						$(objs).IObject('setLockResize', !(lockResize));
						controlLayoutSetData('lock-resize');
					}
				});
				items.push({
					text: MESSAGE['CONTEXTMENU_LOCK_MOVE'],
					checkbox: lockMove,
					handler: function () {
						$(objs).IObject('setLockMove', !(lockMove));
						controlLayoutSetData('lock-move');
					}
				});
			}
			$("<div></div>").ContextMenu({
				x: e.pageX,
				y: e.pageY,
				items: items
			}).appendTo('body');
		},

		_getObjId: function (prefix) {
			var ts = (new Date()).getTime();
			return ((prefix) ? prefix : 'obj') + '_' + ts;
		},

		_getNearObjectPosX: function (obj, x, isMove) {
			var object = $(obj).parent().find('> .object');
			var posList = [], parentW, retX;
			var self = this;

			retX = x;

			if (($(obj).parent().hasClass('editor') && this.options.orientation == ORIENTATION_PORTRAIT) || $(obj).parent().hasClass('object')) {
				parentW = $(obj).parent().width();
			} else {
				parentW = 0;
			}
			posList.push([0, parentW, $(self.element).find('.editor')]);

			$.each(object, function(i, data) {
				var x1 = $(data).position().left;
				var x2 = x1 + $(data).width();
				posList.push([x1, x2, $(data)]);
			});

			for (var nearX = 1; nearX <= this.options.magnet; nearX++) {
				$.each(posList, function(i, pos) {
					var x1 = pos[0];
					var x2 = pos[1];
					var target = pos[2];

					if (isMove && target.hasClass('selected')) return;

					if (x1 + nearX > x && x1 - nearX < x) retX = x1;
					else if (x2 + nearX > x && x2 - nearX < x) retX = x2;
				});
				if (retX != x) break;
			}
			if (retX == x) return false;

			return retX;
		},

		_getNearObjectPosY: function (obj, y, isMove) {
			var object = $(obj).parent().find('> .object');
			var posList = [], parentH, retY;
			var self = this;

			retY = y;

			if (($(obj).parent().hasClass('editor') && this.options.orientation == ORIENTATION_LANDSCAPE) || $(obj).parent().hasClass('object')) {
				parentH = $(obj).parent().height();
			} else {
				parentH = 0;
			}
			posList.push([0, parentH, $(self.element).find('.editor')]);

			$.each(object, function(i, data) {
				var y1 = $(data).position().top;
				var y2 = y1 + $(data).height();
				posList.push([y1, y2, $(data)]);
			});

			for (var nearY = 1; nearY <= this.options.magnet; nearY++) {
				$.each(posList, function(i, pos) {
					var y1 = pos[0];
					var y2 = pos[1];
					var target = pos[2];

					if (isMove && target.hasClass('selected')) return;

					if (y1 + nearY > y && y1 - nearY < y) retY = y1;
					else if (y2 + nearY > y && y2 - nearY < y) retY = y2;
				});
				if (retY != y) break;
			}
			if (retY == y) return false;

			return retY;
		},

		_onMouseStart: function (src, editor, e) {
			var ret = false;

			$(editor).find('.guide').remove();

			switch (_USE_TOOL) {
				case EDITOR_TOOL_BOX:
				case EDITOR_TOOL_TEXT:
				case EDITOR_TOOL_IMAGE:
				case EDITOR_TOOL_AUDIO:
				case EDITOR_TOOL_VIDEO:
					ret = this._drawGuideStart(src, editor, e);
					break;
				case EDITOR_TOOL_SELECT:
				{
					if ($(src).hasClass('editor')) {
						this.element.find('.object .data').blur();
						ret = this.unselect();
						return ret;
					} else if ($(src).hasClass('object')) {
						var isMoveObj = false;

						if ($(src).IObject('isSelected')) {
							isMoveObj = true;
						}
						if (isMoveObj) {
							//ret = this._moveObjectStart(src, ACT_OBJECT_MOVE, e);
							ret = this._moveObjectStart(src, ACT_OBJECT_SELECT_MOVE, e);
						} else {
							ret = this.select(src, e);
							if (ret) ret = this._moveObjectStart(src, ACT_OBJECT_SELECT_MOVE, e);
						}
						if ($(src).IObject('getType') == OBJECT_TYPE_TEXT) {
							$(src).find('.data').focus();
						} else {
							this.element.find('.object .data').blur();
						}
					}
					break;
				}
			}
			return ret;
		},

		_onMouseMove: function (editor, e) {
			var ret = false;
			switch (_MOUSE_ACTION) {
				case ACT_DRAW_GUIDE:
					ret = this._drawGuideResize(editor, e);
					break;
				case ACT_OBJECT_MOVE:
				case ACT_OBJECT_SELECT_MOVE:
					ret = this._moveObjectMove(e);
					break;
				case ACT_OBJECT_ROTATE:
					ret = this._rotateObjectMove(e);
					break;
				default:
					break;
			}
			return ret;
		},

		_onMouseStop: function (editor, e) {
			var ret = false;
			switch (_MOUSE_ACTION) {
				case ACT_DRAW_GUIDE:
					ret = this._drawGuideEnd(editor, e);
					break;
				case ACT_OBJECT_MOVE:
				case ACT_OBJECT_SELECT_MOVE:
					ret = this._moveObjectEnd(e);
					break;
				case ACT_OBJECT_ROTATE:
					ret = this._rotateObjectEnd(e);
					break;
				default:
					break;
			}
			return ret;
		},

		_rotateObjectStart: function (src, e) {
			if (LOCK_MOVE) return true;

			$(this.element).find('.rotate-src').removeClass('rotate-src');

			$(src).addClass('rotate-src');

			$(src).data('ROTATE_POS_X', e.pageX);
			$(src).data('ROTATE_POS_Y', e.pageY);

			_MOUSE_ACTION = ACT_OBJECT_ROTATE;

			return true;
		},

		_rotateObjectMove: function (e) {
			var self = this;
			var src, rotaterY;
			var moveY, distance;
			var parent, scrollTop;
			var minus = 0;

			if (_MOUSE_ACTION != ACT_OBJECT_ROTATE) return false;

			src = $(this.element).find('.rotate-src');
			if (src.length < 1) return;

			rotaterY = $(src).data('ROTATE_POS_Y');

			parent = $(src).parent();
			if ($(parent).hasClass('editor')) {
				scrollTop = $(this.element).scrollTop();
			} else {
				scrollTop = 0;
			}
			moveY = e.pageY - rotaterY;

			distance = moveY / 2;

			$(this.element).find('.selected').each(function (idx, el) {
				var oldAngle = $(el).IObject('css', 'transform-rotate');
				var angle = parseFloat($(el).data('BEFORE_ANGLE'));

				if (isNaN(angle)) {
					var val = $(el).IObject('css', 'transform-rotate');
					angle = parseFloat(val[0]);
					$(el).data('BEFORE_ANGLE', angle);
				}
				oldAngle = parseFloat(oldAngle[0]);

				if (oldAngle == 0 && Math.abs(distance) < self.options.rotateZeroLock) return;
				angle = (angle + (distance)) % 360;

				$(el).IObject('css', 'transform-rotate', angle, 'deg');
				$(el).trigger(EVT_ROTATING);
			});
			return true;
		},

		_rotateObjectEnd: function (e) {
			var src, self = this;

			if (_MOUSE_ACTION != ACT_OBJECT_ROTATE) return false;

			src = $(this.element).find('.rotate-src');
			if (src.length < 1) return;

			this._rotateObjectMove(e);
			_MOUSE_ACTION = ACT_NONE;

			$(src).removeClass('rotate-src');

			$(this.element).find('.selected').each(function (idx, el) {
				$(el).data('BEFORE_ANGLE', null);
				$(el).trigger(EVT_ROTATE);
			});
			return true;
		},

		//_resizeObjectStart: function (action, src, e) {
		_resizeObjectStart: function (act, src, e) {
			if (LOCK_RESIZE) return true;

			//$(this.element).find('.resize-src').removeClass('resize-src');

			//$(src).addClass('resize-src');

			$(src).data('RESIZE_POS_X-' + act, e.pageX);
			$(src).data('RESIZE_POS_Y-' + act, e.pageY);

			//_MOUSE_ACTION = action;

			return true;
		},

		_resizeObjectMove: function (act, src, e) {
			var nowX, nowY, oldX, oldY, resizeX, resizeY, endEvent;

			if (LOCK_RESIZE) {
				return true;
			}
			nowX = e.pageX;
			nowY = e.pageY;
			oldX = $(src).data('RESIZE_POS_X-' + act);
			oldY = $(src).data('RESIZE_POS_Y-' + act);

			resizeX = nowX - oldX;
			resizeY = nowY - oldY;

			endEvent = (e.type == EVT_MOUSESTOP) ? true : false;

			if (e.ctrlKey || G_MAIN_TOUCH_ENABLE) {
				var pos = src.position();
				var ow = src.width();
				var oh = src.height();
				var nearX, nearY;

				if ((nearX = this._getNearObjectPosX(src, pos.left + resizeX, true)) !== false) {
					resizeX = nearX - pos.left;
					nowX = resizeX + oldX;
				} else if ((nearX = this._getNearObjectPosX(src, pos.left + resizeX + ow, true)) !== false) {
					resizeX = nearX - pos.left - ow;
					nowX = resizeX + oldX;
				}

				if ((nearY = this._getNearObjectPosY(src, pos.top + resizeY, true)) !== false) {
					resizeY = nearY - pos.top;
					nowY = resizeY + oldY;
				} else if ((nearY = this._getNearObjectPosY(src, pos.top + resizeY + oh, true)) !== false) {
					resizeY = nearY - pos.top - oh;
					nowY = resizeY + oldY;
				}
			}
			$(src).data('RESIZE_POS_X-' + act, nowX);
			$(src).data('RESIZE_POS_Y-' + act, nowY);

			$(this.element).find('.selected').each(function (idx, el) {
				$(this).IObject('resize', act, resizeX, resizeY, endEvent);
			});
			return true;
		},

		_resizeObjectEnd: function (act, src, e) {
			this._resizeObjectMove(act, src, e);

			return true;
		},

		_moveObjectStart: function (obj, action, e) {
			if (LOCK_MOVE) return true;

			$(this.element).find('.move-src').removeClass('move-src');

			$(obj).addClass('move-src');

			$(obj).data('MOVE_POS_X', e.pageX);
			$(obj).data('MOVE_POS_Y', e.pageY);

			_MOUSE_ACTION = action;

			return true;
		},

		_moveObjectMove: function (e) {
			var nowX, nowY, oldX, oldY, moveX, moveY, endEvent;

			if (LOCK_MOVE) {
				_MOUSE_ACTION = ACT_NONE;
				return true;
			}
			nowX = e.pageX;
			nowY = e.pageY;
			oldX = $(this.element).find('.move-src').data('MOVE_POS_X');
			oldY = $(this.element).find('.move-src').data('MOVE_POS_Y');

			moveX = nowX - oldX;
			moveY = nowY - oldY;
			endEvent = (e.type == EVT_MOUSESTOP) ? true : false;

			if (_MOUSE_ACTION == ACT_OBJECT_SELECT_MOVE) {
				if (Math.abs(moveX) > 15 || Math.abs(moveY) > 15) {
					_MOUSE_ACTION = ACT_OBJECT_MOVE;
				} else {
					return true;
				}
			}

			if (e.ctrlKey || G_MAIN_TOUCH_ENABLE) {
				var obj = $(this.element).find('.move-src');
				var pos = obj.position();
				var ow = obj.width();
				var oh = obj.height();
				var nearX, nearY;

				if ((nearX = this._getNearObjectPosX(obj, pos.left + moveX, true)) !== false) {
					moveX = nearX - pos.left;
					nowX = moveX + oldX;
				} else if ((nearX = this._getNearObjectPosX(obj, pos.left + moveX + ow, true)) !== false) {
					moveX = nearX - pos.left - ow;
					nowX = moveX + oldX;
				}

				if ((nearY = this._getNearObjectPosY(obj, pos.top + moveY, true)) !== false) {
					moveY = nearY - pos.top;
					nowY = moveY + oldY;
				} else if ((nearY = this._getNearObjectPosY(obj, pos.top + moveY + oh, true)) !== false) {
					moveY = nearY - pos.top - oh;
					nowY = moveY + oldY;
				}
			}
			$(this.element).find('.move-src').data('MOVE_POS_X', nowX);
			$(this.element).find('.move-src').data('MOVE_POS_Y', nowY);

			$(this.element).find('.selected').each(function (idx, el) {
				if (e.shiftKey || editorGetTranslateMove()) {
					$(this).IObject('moveTranslate', moveX, moveY, endEvent);
				} else {
					$(this).IObject('move', moveX, moveY, endEvent);
				}
			});
			return true;
		},

		_moveObjectEnd: function (e) {
			this._moveObjectMove(e);
			_MOUSE_ACTION = ACT_NONE;

			$(this.element).find('.move-src').removeClass('move-src');

			return true;
		},

		_drawGuideStart: function (parent, editor, e) {
			var posX, posY, guide;
			var scrollTop, scrollLeft;
			var nearX, nearY;

			if (LOCK_CREATE) return true;

			// ctrl키를 누른 상태에서 객체를 생성하면 무조건 최상위 객체로 생성
			//if (e.ctrlKey) parent = $(editor).find('.editor');

			if (!$(parent).hasClass('editor') &&
				!$(parent).hasClass('box')
			) return false;

			guide = $('<div></div>');
			guide.addClass('guide');
			guide.width(0);
			guide.height(0);
			guide.appendTo(parent);

			if ($(parent).hasClass('editor')) {
				scrollTop = $(editor).scrollTop();
				scrollLeft = $(editor).scrollLeft();
			} else {
				scrollTop = scrollLeft = 0;
			}
			posX = e.pageX - _OBJ_GET_OFFSET_LEFT(guide) + scrollLeft;
			posY = e.pageY - _OBJ_GET_OFFSET_TOP(guide) + scrollTop;

			if (e.ctrlKey) {
				if ((nearX = this._getNearObjectPosX(guide, posX)) !== false) posX = nearX;
				if ((nearY = this._getNearObjectPosY(guide, posY)) !== false) posY = nearY;
			}
			guide.css('left', posX);
			guide.css('top', posY);

			guide.data('GUIDE_START_X', posX);
			guide.data('GUIDE_START_Y', posY);

			_MOUSE_ACTION = ACT_DRAW_GUIDE;

			$(editor).trigger(EVT_DRAWSTART);

			return true;
		},

		_drawGuideResize: function (editor, e) {
			var parent, posX, posY, guide;
			var scrollTop, scrollLeft;
			var sx, sy;
			var nx, ny, nw, nh;
			var nearX, nearY;

			guide = $(editor).find('.guide');
			parent = $(guide).parent();

			if (LOCK_CREATE) {
				guide.remove();
				_MOUSE_ACTION = ACT_NONE;
				return true;
			}
			if ($(parent).hasClass('editor')) {
				scrollTop = $(editor).scrollTop();
				scrollLeft = $(editor).scrollLeft();
			} else {
				scrollTop = scrollLeft = 0;
			}
			sx = parseInt(guide.data('GUIDE_START_X'));
			sy = parseInt(guide.data('GUIDE_START_Y'));

			posX = e.pageX - _OBJ_GET_OFFSET_LEFT(guide) + scrollLeft;
			posY = e.pageY - _OBJ_GET_OFFSET_TOP(guide) + scrollTop;

			if (e.ctrlKey) {
				if ((nearX = this._getNearObjectPosX(guide, posX)) !== false) posX = nearX;
				if ((nearY = this._getNearObjectPosY(guide, posY)) !== false) posY = nearY;
			}
			if (posX < 0) posX = 0;
			if (posY < 0) posY = 0;

			if (posY + 1 > guide.parent().height()) posY = guide.parent().height() - 2;
			if (!e.shiftKey) {
				if (posX > guide.parent().width()) posX = guide.parent().width() - 2;
			} else {
				var tw = (sx > posX) ? (sx - posX) : (posX - sx);
				var th = (sy > posY) ? (sy - posY) : (posY - sy);

				if (sx > posX) {
					if (sx - th < 0) {
						posX = 0;
						if (sy > posY) {
							posY = sy - (sx - posX);
						} else {
							posY = sy + (sx - posX);
						}
					}
				} else {
					if (sx + th > guide.parent().width() - 2) {
						posX = guide.parent().width() - 2;
						if (sy > posY) {
							posY = sy - (posX - sx);
						} else {
							posY = sy + (posX - sx);
						}
					}
				}
			}

			if (!e.shiftKey) {
				if (sx > posX) nx = posX; else nx = sx;
				if (sy > posY) ny = posY; else ny = sy;

				if (sx > posX) nw = sx - posX; else nw = posX - sx;
				if (sy > posY) nh = sy - posY; else nh = posY - sy;
			} else {
				if (sx > posX) nx = sx - guide.height(); else nx = sx;
				if (sy > posY) ny = posY; else ny = sy;

				nw = guide.height();
				if (sy > posY) nh = sy - posY; else nh = posY - sy;
			}
			guide.css('left', nx);
			guide.css('top', ny);
			guide.width(nw);
			guide.height(nh);

			return true;
		},

		_drawGuideEnd: function (editor, e) {
			var obj, width, height;
			var parent, guide;
			var top, left, width, height;
			var parentWidth, parentHeight;

			this._drawGuideResize(editor, e);

			if (LOCK_CREATE) return true;

			guide = $(editor).find('.guide');
			parent = $(guide).parent();
			parentWidth = $(parent).width();
			parentHeight = $(parent).height();

			_MOUSE_ACTION = ACT_NONE;

			top = parseInt($(guide).css('top'));
			left = parseInt($(guide).css('left'));
			width = $(guide).width();
			height = $(guide).height();

			guide.remove();

			if (width > 25 && height > 25) {
				var refSize;

				obj = $('<div></div>').appendTo(parent);

				$(obj).IObject({
					id: this._getObjId(),
					type: _USE_TOOL,
					editor: this
				});

				if (this.getOrientation() == ORIENTATION_LANDSCAPE) {
					refSize = parentHeight;
				} else {
					refSize = parentWidth;
				}
				obj.IObject('css', 'top', (top / refSize) * 100, '%');
				obj.IObject('css', 'left', (left / refSize) * 100, '%');
				obj.IObject('css', 'width', (width / refSize) * 100, '%');
				obj.IObject('css', 'height', (height / refSize) * 100, '%');

				$(obj).trigger(EVT_REDRAW);
				$(editor).trigger(EVT_DRAWEND);
			}
			return true;
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

			if ($.isNumeric(val)) {
				if (unit == '%') {
					val = '' + parseFloat(val).toFixed(4);
				} else {
					val = Math.round(parseFloat(val));
				}
			}
			this._style[key] = (arguments.length == 3) ? [val, unit] : [val];

			switch (arguments[0]) {
				case 'background-color':		this._applyCSSBackgroundColor(); break;
				case 'background-image':		this._applyCSSBackgroundImage(); break;
				case 'background-repeat':		this._applyCSSBackgroundRepeat(); break;
				case 'background-size':			this._applyCSSBackgroundSize(); break;
				case 'background-attachment':	this._applyCSSBackgroundAttachment(); break;
				default: break;
			}
		},

		_applyCSS: function () {
			this._applyCSSBackgroundColor();
			this._applyCSSBackgroundImage();
			this._applyCSSBackgroundRepeat();
			this._applyCSSBackgroundSize();
			this._applyCSSBackgroundAttachment();
		},

		_applyCSSBackgroundColor: function () {
			var valI = this._style['background-image'];
			var valC = this._style['background-color'];

			if (valI[0] == '') {
				if (valC[0] == 'transparent') {
					$(this.element).find('.editor').css('background-image', DEFAULT_STYLE_BACKGROUND_IMAGE);
				} else {
					$(this.element).find('.editor').css('background-image', '');
				}
			}
			$(this.element).find('.editor').css('background-color', valC[0]);
		},

		_applyCSSBackgroundAttachment: function () {
			var valA = this._style['background-attachment'];
			var valI = this._style['background-image'];

			if (valI[0] == '') {
				$(this.element).find('.editor').css('background-attachment', 'scroll');
			} else {
				$(this.element).find('.editor').css('background-attachment', valA[0]);
			}
		},

		_applyCSSBackgroundImage: function () {
			var url, val = this._style['background-image'];
			if (val[0] == '') {
				$(this.element).find('.editor').css('background-image', DEFAULT_STYLE_BACKGROUND_IMAGE);
			} else {
				url = 'url(' + pathGetImage(val[0]) + ')';
				$(this.element).find('.editor').css('background-image', url);
			}
		},

		_applyCSSBackgroundRepeat: function () {
			var valR = this._style['background-repeat'];
			var valI = this._style['background-image'];

			if (valI[0] == '') {
				$(this.element).find('.editor').css('background-repeat', DEFAULT_STYLE_BACKGROUND_REPEAT);
			} else {
				$(this.element).find('.editor').css('background-repeat', valR[0]);
			}
		},

		_applyCSSBackgroundSize: function () {
			var valS = this._style['background-size'];
			var valI = this._style['background-image'];

			if (valI[0] == '') {
				$(this.element).find('.editor').css('background-size', 'auto');
			} else {
				if (isNaN(parseFloat(valS[0]))) {
					$(this.element).find('.editor').css('background-size', valS[0]);
				} else {
					$(this.element).find('.editor').css('background-size', valS[0]+valS[1]);
				}
			}
		},

		select: function (src, e) {
			if (LOCK_SELECT) return;

			if (e) {
				if (!e.shiftKey) this.unselect();
			} else {
				this.unselect();
			}
			$(src).IObject('select');

			return true;
		},

		unselect: function () {
			if (LOCK_SELECT) return;

			if (!($(this.element).find('.editor .selected').length)) return false;

			$(this.element).find('.editor .selected').IObject('unselect');

			return true;
		},

		setTool: function (tool) {
			_USE_TOOL = tool;
		},

		getTool: function () {
			return _USE_TOOL;
		},

		setLock: function (key, val) {
			switch (key.toLocaleLowerCase()) {
			case EDITOR_LOCK_MOVE:
				LOCK_MOVE = val;
				break;
			case EDITOR_LOCK_SELECT:
				LOCK_SELECT = val;
				break;
			case EDITOR_LOCK_RESIZE:
				LOCK_RESIZE = val;
				break;
			case EDITOR_LOCK_CREATE:
				LOCK_CREATE = val;
				break;
			default:
				break;
			}
		},

		getLock: function (key) {
			var ret = false;

			switch (key.toLocaleLowerCase()) {
			case EDITOR_LOCK_MOVE:
				ret = LOCK_MOVE;
				break;
			case EDITOR_LOCK_SELECT:
				ret = LOCK_SELECT;
				break;
			case EDITOR_LOCK_RESIZE:
				ret = LOCK_RESIZE;
				break;
			case EDITOR_LOCK_CREATE:
				ret = LOCK_CREATE;
				break;
			}
			return ret;
		},

		getOrientation: function () {
			return this.options.orientation;
		},

		getModified: function () {
			return this._modified;
		},

		setModified: function (val) {
			this._modified = val;
		},

		getData: function (type) {
			if (type == undefined) return this._data;
			if (!this._data[type]) return [];
			return this._data[type];
		},

		setData: function (type, value) {
			this._data[type] = value;
		}

	});
}(jQuery));