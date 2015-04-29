// action
var ACT_NONE = 'none';
var ACT_DRAW_GUIDE = 'drawguide';
var ACT_OBJECT_MOVE = 'objectmove';
var ACT_OBJECT_ROTATE = 'objectrotate';
var ACT_OBJECT_SELECT_MOVE = 'objectselectmove';
var ACT_OBJECT_RESIZE_LEFT = 'objectresizeleft';
var ACT_OBJECT_RESIZE_TOP = 'objectresizetop';
var ACT_OBJECT_RESIZE_RIGHT = 'objectresizeright';
var ACT_OBJECT_RESIZE_BOTTOM = 'objectresizebottom';
var ACT_OBJECT_RESIZE_TOP_LEFT = 'objectresizetopleft';
var ACT_OBJECT_RESIZE_TOP_RIGHT = 'objectresizetopright';
var ACT_OBJECT_RESIZE_BOTTOM_LEFT = 'objectresizebottomleft';
var ACT_OBJECT_RESIZE_BOTTOM_RIGHT = 'objectresizebottomright';


// event
var EVT_MOUSECLICK = 'click';
var EVT_MOUSEDBLCLICK = 'dblclick';
var EVT_MOUSESTART = 'mousedown';
var EVT_MOUSESTOP = 'mouseup';
var EVT_MOUSEMOVE = 'mousemove';
var EVT_MOUSEOUT = 'mouseout';
var EVT_MOUSEDOWN = 'mousedown';
var EVT_MOUSEUP = 'mouseup';
var EVT_CONTEXTMENU = 'contextmenu';
var EVT_REDRAW = 'redraw';
var EVT_EDITORCREATE = 'editorcreate';
var EVT_EDITORDESTROY = 'editordestroy';
var EVT_EDITORRESIZE = 'editorresize';
var EVT_STYLECHANGE = 'stylechange';
var EVT_UPDATE = 'update';
var EVT_SELECT = 'select';
var EVT_UNSELECT = 'unselect';
var EVT_SORTUPDATE = 'sortupdate';
var EVT_OPEN = 'open';
var EVT_CLOSE = 'close';
var EVT_DRAWSTART = 'drawstart';
var EVT_DRAWEND = 'drawend';
var EVT_CHANGE = 'change';
var EVT_BUTTONCLICK = 'buttonclick';
var EVT_INPUT = 'input';
var EVT_MOVE = 'move';
var EVT_MOVING = 'moving';
var EVT_RESIZE = 'resize';
var EVT_RESIZING = 'resizing';
var EVT_ROTATE = 'rotate';
var EVT_ROTATING = 'rotating';
var EVT_LOADCOMPLETE = 'loadcomplete';
var EVT_OBJCREATE = 'objcreate';
var EVT_OBJDESTROY = 'objdestroy';
var EVT_OBJUPDATE = 'objupdate';
var EVT_TRANSITIONEND = 'transitionend';

var EVT_BEFOREUNLOAD = 'beforeunload';
var EVT_SELECTSTART = 'selectstart';
var EVT_UPLOAD_DROP = 'drop';
var EVT_UPLOAD_DRAGLEAVE = 'dragleave';
var EVT_UPLOAD_DRAGOVER = 'dragover';

var EVT_DOCUMENT_UPDATE = 'documentupdate';
var EVT_DOCUMENT_SAVED = 'documentsaved';

var EVT_TOUCHTAP = 'touchvtap';
var EVT_TOUCHDBLTAP = 'touchvdbltap';
var EVT_TOUCHMOVE = 'touchvmove';
var EVT_TOUCHDOWN = 'touchvdown';
var EVT_TOUCHUP = 'touchvup';

var EVT_COLLAPSED = 'collapsed';
var EVT_EXPAND = 'expanded';

var EVT_UNSUPPORTED = 'unsupported';


// editor
var EDITOR_TOOL_SELECT = 'select';
var EDITOR_TOOL_BOX = 'box';
var EDITOR_TOOL_TEXT = 'text';
var EDITOR_TOOL_IMAGE = 'image';
var EDITOR_TOOL_AUDIO = 'audio';
var EDITOR_TOOL_VIDEO = 'video';

var EDITOR_LOCK_MOVE = 'move';
var EDITOR_LOCK_SELECT = 'select';
var EDITOR_LOCK_RESIZE = 'resize';
var EDITOR_LOCK_CREATE = 'create';

var ORIENTATION_LANDSCAPE = 'landscape';
var ORIENTATION_PORTRAIT = 'portrait';


// object
var OBJECT_TYPE_BOX = 'box';
var OBJECT_TYPE_TEXT = 'text';
var OBJECT_TYPE_IMAGE = 'image';
var OBJECT_TYPE_AUDIO = 'audio';
var OBJECT_TYPE_VIDEO = 'video';

var OBJECT_IMAGE_ACTIONTYPE_EVENT_SCROLL = 'eventscroll';
var OBJECT_IMAGE_ACTIONTYPE_EVENT_CHANGE = 'eventchange';
var OBJECT_IMAGE_ACTIONTYPE_CLICK_SCROLL = 'clickscroll';
var OBJECT_IMAGE_ACTIONTYPE_CLICK_CHANGE = 'clickchange';
var OBJECT_IMAGE_ACTIONTYPE_SWIPE_SCROLL = 'swipe';
var OBJECT_IMAGE_ITEMTYPE_SERVER = 'server';
var OBJECT_IMAGE_ITEMTYPE_LINK = 'link';
var OBJECT_IMAGE_FILLTYPE_AUTOFIT_INNER = 'autofit-inner';
var OBJECT_IMAGE_FILLTYPE_AUTOFIT_OUTER = 'autofit-outer';
var OBJECT_IMAGE_FILLTYPE_FILL = 'fill';


// transition
var TRANSITION_TIMING_FUNC_DEFAULT = 'initial';
var TRANSITION_TIMING_FUNC_EASE = 'ease';
var TRANSITION_TIMING_FUNC_LINEAR = 'linear';
var TRANSITION_TIMING_FUNC_EASEIN = 'ease-in';
var TRANSITION_TIMING_FUNC_EASEOUT = 'ease-out';
var TRANSITION_TIMING_FUNC_EASEINOUT = 'ease-in-out';


// document
var DOCUMENT_EDITMODE_NONE = 'none';
var DOCUMENT_EDITMODE_NEW = 'new';
var DOCUMENT_EDITMODE_EDIT = 'edit';


// button action
var BTN_ADD = 'add';
var BTN_APPLY = 'apply';
var BTN_CANCEL = 'cancel';
var BTN_CLOSE = 'close';
var BTN_DELETE = 'delete';
var BTN_DETECT = 'detect';
var BTN_MODIFY = 'modify';
var BTN_OK = 'ok';
var BTN_SELECT = 'select';
var BTN_YES = 'yes';
var BTN_NO = 'no';
var BTN_SAVE = 'save';
var BTN_DONOTSAVE = 'donotsave';
var BTN_STEP = 'step';
var BTN_CONTINUE = 'continue';
var BTN_UNDO = 'undo';
var BTN_UPLOAD_FILE = 'uploadfile';
var BTN_UPLOAD_CAMERA = 'uploadcamera';

var BTN_TOOL_SELECT = 'tool-select';
var BTN_TOOL_BOX = 'tool-box';
var BTN_TOOL_TEXT = 'tool-text';
var BTN_TOOL_IMAGE = 'tool-image';
var BTN_TOOL_AUDIO = 'tool-audio';
var BTN_TOOL_VIDEO = 'tool-video';
var BTN_TOOL_DELETE = 'tool-delete';
var BTN_FUNC_NEW = 'func-new';
var BTN_FUNC_OPEN = 'func-open';
var BTN_FUNC_SAVE = 'func-save';
var BTN_FUNC_SAVEAS = 'func-save-as';
var BTN_FUNC_PREVIEW = 'func-preview';
var BTN_FUNC_DELETE = 'func-delete';
var BTN_FUNC_PUBLISH = 'func-publish';


// file browser dialog
var FILE_PATH_DATA = 'data';
var FILE_PATH_IMAGE = 'image';
var FILE_PATH_AUDIO = 'audio';
var FILE_PATH_VIDEO = 'video';


// default
var DEFAULT_OBJECT_STYLE = {
	'left':							['0', '%'],
	'top':							['0', '%'],
	'right':						['auto', '%'],
	'bottom':						['auto', '%'],
	'width':						['0', '%'],
	'height':						['0', '%'],
	'min-width':					['auto', '%'],
	'min-height':					['auto', '%'],
	'max-width':					['auto', '%'],
	'max-height':					['auto', '%'],
	'margin-top':					['0', '%'],
	'margin-right':					['0', '%'],
	'margin-bottom':				['0', '%'],
	'margin-left':					['0', '%'],
	'padding-top':					['0', '%'],
	'padding-right':				['0', '%'],
	'padding-bottom':				['0', '%'],
	'padding-left':					['0', '%'],
	'overflow-x':					['hidden'],
	'overflow-y':					['hidden'],
	'visibility':					['visible'],
	'position':						['absolute'],
	'display':						['inline-block'],
	'float':						['none'],
	'clear':						['none'],
	'z-index':						['1000'],
	'background-color':				['transparent'],
	'background-image':				[''],
	'background-repeat':			['repeat'],
	'background-size':				['auto', '%'],
	'background-attachment':		['scroll'],
	'font-family':					[''],
	'text-align':					['justify'],
	'font-size':					[10, 'px'],
	'font-weight':					['normal'],
	'font-style':					['normal'],
	'color':						['#000000'],
	'border-top-width':				['1', 'px'],
	'border-right-width':			['1', 'px'],
	'border-bottom-width':			['1', 'px'],
	'border-left-width':			['1', 'px'],
	'border-top-left-radius':		['0', 'px'],
	'border-top-right-radius':		['0', 'px'],
	'border-bottom-right-radius':	['0', 'px'],
	'border-bottom-left-radius':	['0', 'px'],
	'border-style':					['solid'],
	'border-color':					['#000000'],
	'opacity':						['1'],
	'box-shadow-vertical':			['0', 'px'],
	'box-shadow-horizontal':		['0', 'px'],
	'box-shadow-blur':				['0', 'px'],
	'transform-scale-x':			['1'],
	'transform-scale-y':			['1'],
	'transform-rotate':				['0', 'deg'],
	'transform-translate-x':		['0', '%'],
	'transform-translate-y':		['0', '%'],
	'animation-name':				[''],
	'animation-duration':			['0'],
	'animation-delay':				['0'],
	'animation-timing-function':	['linear'],
	'animation-iteration-count':	['0'],
	'animation-direction':			['normal'],
	'animation-play-state':			['running'],
};
