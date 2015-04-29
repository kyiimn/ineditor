(function ($, undefined) {
	$.namespace('inews.property.domtree');

	var _OBJ2NODEDATA = function (obj) {
		var nodeData = false;

		if ($(obj).hasClass('object')) {
			nodeData = {
				id: $(obj).IObject('id'),
				uid: $(obj).IObject('uid'),
				type: $(obj).IObject('getType'),
				path: $(obj).IObject('getPath'),
				children: {},
				object: $(obj),
				opened: false
			};
		} else if ($(obj).hasClass('editor')) {
			nodeData = {
				id: 'body',
				uid: 'body',
				type: 'body',
				path: [],
				children: {},
				object: $(obj),
				opened: false
			};
		}
		return nodeData;
	};

	inews.property.domtree.Domtree = function (options) {
		var self = this;

		this._parentEl = options.parent;
		this._drawable = false;
		this._dom = false;

		$(document).on(EVT_EDITORCREATE, '.editor-area', function (e) {
			self._createNode();
		});
		$(document).on(EVT_EDITORDESTROY, '.editor-area', function (e) {
			self._destroyNode();
		});
		$(document).on(EVENT(EVT_OBJCREATE, EVT_OBJUPDATE), '.editor-area .object', function (e) {
			self._addNode($(this));
		});
		$(document).on(EVT_OBJDESTROY, '.editor-area .object', function (e) {
			self._removeNode($(this));
		});
	};
	inews.property.domtree.Domtree.instance = false;

	inews.property.domtree.Domtree.create = function (parent) {
		var instance = inews.property.domtree.Domtree.instance;
		var div, ul, select;

		if (!instance) {
			inews.property.domtree.Domtree.instance = instance = new inews.property.domtree.Domtree({
				parent: parent
			});
		}
		$(instance._parentEl).empty();

		// title
		$('<div></div>').addClass('ia-domtree-title').addClass('title').html(MESSAGE['IA_DOMTREE']).appendTo(instance._parentEl);

		$('<div></div>').addClass('field').appendTo(instance._parentEl); // empty

		div = $('<div></div>').addClass('ia-domtree-tree').appendTo(instance._parentEl);
		$('<ul></ul>').appendTo(div);

		$(instance._parentEl).on(EVT_RESIZE, instance._onResize);
		$(instance._parentEl).on(EVT_MOUSECLICK, '.ia-domtree-tree li.no-leaf > .node-body > .tab span:last-child', function (e) {
			var node = $(this).parent().parent().parent();
			var nodeData = $(node).data('data');

			if (nodeData.opened) {
				nodeData.opened = false;
				$(node).removeClass('opened');
			} else {
				nodeData.opened = true;
				$(node).addClass('opened');
			}
		});
		$(instance._parentEl).on(EVT_MOUSECLICK, '.ia-domtree-tree li label, .ia-domtree-tree li .icon', function (e) {
			var node = $(this).parent().parent();
			var objid;

			$(instance._parentEl).find('.ia-domtree-tree li').removeClass('selected');
			$('.editor-area').IEditor('unselect');

			objuid = $(node).attr('data-uid');
			if (objuid == 'body') return;

			$(node).addClass('selected');
			$('.editor .object[data-uid="'+objuid+'"]').IObject('select');
		});

		$(instance._parentEl).on(EVT_SELECT, function (e) {
			$(instance._parentEl).find('.ia-domtree-tree li').removeClass('selected');

			$('.editor .object.selected').each(function (i, obj) {
				instance._selectNode(obj);
			});
		});
		$('.editor .object.selected').each(function (i, obj) {
			instance._selectNode(obj);
		});
		instance._drawable = true;

		instance._draw(instance._dom);
	};

	inews.property.domtree.Domtree.destroy = function () {
		var instance = inews.property.domtree.Domtree.instance;

		if (!instance) return;

		instance._drawable = false;

		$(instance._parentEl).off(EVT_SELECT);
		$(instance._parentEl).off(EVT_RESIZE);
		$(instance._parentEl).off(EVT_MOUSECLICK, '.ia-domtree-tree li.no-leaf > .node-body > .tab span:last-child');
		$(instance._parentEl).off(EVT_MOUSECLICK, '.ia-domtree-tree li label, .ia-domtree-tree li .icon');
		$(instance._parentEl).empty();
	};

	inews.property.domtree.Domtree.prototype._onResize = function (e) {
		$(this).find('.ia-domtree-tree').css('min-height', $(this).height() - 22 - 5);

		e.preventDefault();
		e.stopPropagation();
	};

	inews.property.domtree.Domtree.prototype._clearNode = function () {
		if (!this._drawable) return;
		$(this._parentEl).find('.ia-domtree-tree > ul').empty();
	};

	inews.property.domtree.Domtree.prototype._createNode = function () {
		this._dom = _OBJ2NODEDATA($('.editor'));

		this._clearNode();
		this._draw(this._dom);
	};

	inews.property.domtree.Domtree.prototype._destroyNode = function () {
		this._dom = false;

		this._clearNode();
	};

	inews.property.domtree.Domtree.prototype._getParentNode = function (nodeData) {
		var tree = $(this._parentEl).find('.ia-domtree-tree');
		var parent;

		if (nodeData.type == 'body') return tree;

		parent = nodeData.path[1];

		return $(tree).find('.node[data-uid="'+parent.uid+'"]');
	};

	inews.property.domtree.Domtree.prototype._getParentData = function (nodeData) {
		var parentData = this._dom;

		if (nodeData.type == 'body') return false;

		for (var i = nodeData.path.length - 2; i > 0; i--) {
			var tmp = parentData.children[nodeData.path[i].uid];
			if (!tmp) return false;
			parentData = tmp;
		}
		return parentData;
	};

	inews.property.domtree.Domtree.prototype._addNode = function (obj) {
		var nodeData = _OBJ2NODEDATA(obj);
		var parentData;

		parentData = this._getParentData(nodeData);
		if (parentData.children[nodeData.uid]) {
			parentData.children[nodeData.uid].id = nodeData.id;
			// more ....
		} else {
			parentData.children[nodeData.uid] = nodeData;
		}
		this._draw(parentData.children[nodeData.uid]);
	};

	inews.property.domtree.Domtree.prototype._removeNode = function (obj) {
		var nodeData = _OBJ2NODEDATA(obj);
		var parentData;

		parentData = this._getParentData(nodeData);
		delete parentData.children[nodeData.uid];

		if (this._drawable) {
			var tree = $(this._parentEl).find('.ia-domtree-tree');
			var node = $(tree).find('.node[data-uid="'+nodeData.uid+'"]');
			node.remove();
		}
	};

	inews.property.domtree.Domtree.prototype._reset = function () {
		var body = $('.editor');
		var self = this;

		var _getChildren = function (nodeData) {
			var parent = $(nodeData.object);
			$(parent).find('> .object').each(function (idx, obj) {
				var childData = _OBJ2NODEDATA(obj);
				nodeData.children[childData.uid] = childData;
				_getChildren(childData);
			});
		};
		if (body.length < 1) {
			this._dom = false;
			return;
		}
		this._dom = _OBJ2NODEDATA(body);
		_getChildren(this._dom);
	};

	inews.property.domtree.Domtree.prototype._draw = function (nodeData) {
		var tree = $(this._parentEl).find('.ia-domtree-tree');
		var node, self = this;

		if (!this._drawable) return;
		if (!nodeData) return;

		node = $(tree).find('.node[data-uid="'+nodeData.uid+'"]');
		if (node.length < 1) {
			var parent, tab;

			node = $('<li></li>');
			node.data('data', nodeData);
			if (nodeData.type == 'body') {
				node.addClass('root');
				node.addClass('opened');
			} else {
				node.addClass('child');
				if (nodeData.opened) node.addClass('opened');
			}
			node.addClass('node');
			node.attr('data-uid', nodeData.uid);

			nodeBody = $('<div></div>').addClass('node-body').appendTo(node);

			tab = $('<div></div>').addClass('tab').appendTo(nodeBody);

			for (var i = 0; i < nodeData.path.length; i++) {
				$('<span></span>').addClass('depth').appendTo(tab);
			}
			switch (nodeData.type) {
				case 'body':			$('<span></span>').addClass('icon').addClass('body').appendTo(nodeBody);	break;
				case OBJECT_TYPE_TEXT:	$('<span></span>').addClass('icon').addClass('text').appendTo(nodeBody);	break;
				case OBJECT_TYPE_IMAGE:	$('<span></span>').addClass('icon').addClass('image').appendTo(nodeBody);	break;
				case OBJECT_TYPE_AUDIO:	$('<span></span>').addClass('icon').addClass('audio').appendTo(nodeBody);	break;
				case OBJECT_TYPE_VIDEO:	$('<span></span>').addClass('icon').addClass('video').appendTo(nodeBody);	break;
				case OBJECT_TYPE_BOX:
				default:				$('<span></span>').addClass('icon').addClass('box').appendTo(nodeBody);		break;
			}
			$('<label></label>').html(nodeData.id).appendTo(nodeBody);

			$('<ul></ul>').appendTo(node);

			parent = this._getParentNode(nodeData);
			parent.addClass('no-leaf');
			parent.find('> ul').append(node);
		} else {
			$(node).find('> .node-body > label').html(nodeData.id);
		}
		$.each(nodeData.children, function (i, child) {
			self._draw(child);
		});
	};

	inews.property.domtree.Domtree.prototype._selectNode = function (obj) {
		var tree = $(this._parentEl).find('.ia-domtree-tree');
		var self = this;

		var node = $(tree).find('.node[data-uid="'+$(obj).IObject('uid')+'"]');
		var parent = node.parent();

		do {
			if (parent.length < 1) break;
			if (parent.hasClass('root')) break;
			if (parent.hasClass('node')) {
				var parentData = $(parent).data('data');
				parentData.opened = true;
				parent.addClass('opened');
			}
			parent = parent.parent();
		} while(true);

		$(node).addClass('selected');
	};

	G_PROPERTY_LIST.push({
		id: 'ia-domtree',
		name: 'DomTree',
		'class': inews.property.domtree.Domtree,
		icon: 'images/property/domtree/icon.png'
	});
}(jQuery));