var G_CONTROL_SELECT_OBJECT;
var G_CONTROL_MULTISELECT = false;

function _onControlCommonChange(e) {
	if (!G_CONTROL_MULTISELECT && G_CONTROL_SELECT_OBJECT) {
		var style = $(this).attr('data-style');
		var id = $(this).attr('id');
		var val = $(this).val();

		switch (id) {
			case 'el-attr-common-id':
				$(G_CONTROL_SELECT_OBJECT).IObject('id', val);
				break;
		}
	}
}

function controlInit() {
	$(document).on(EVT_CHANGE, '.el-attr .el-attr-common-datafield', _onControlCommonChange);
	$(document).on(EVT_CHANGE, '.el-attr .el-attr-layout-datafield', _onControlLayoutChange);
	$(document).on(EVT_CHANGE, '.el-attr .el-attr-style-datafield', _onControlStyleChange);

	$(document).on(EVT_MOUSECLICK, '.el-attr #el-attr-style #el-attr-style-background-image-select', _onControlStyleClickBackgroundImageSelect);
	$(document).on(EVT_MOUSECLICK, '.el-attr #el-attr-style #el-attr-style-background-image-clear', _onControlStyleClickBackgroundImageClear);

	controlSetObject();
}

function controlSetObject() {
	if ($('.editor-area .object.selected').length > 1) {
		G_CONTROL_SELECT_OBJECT = $('.editor-area .object.selected');
		G_CONTROL_MULTISELECT = true;

		$('.el-attr #el-attr-common #el-attr-common-id').val(MESSAGE['G_CONTROL_MULTISELECT_OBJID']);
		$('.el-attr #el-attr-common #el-attr-common-type').val(MESSAGE['G_CONTROL_MULTISELECT_OBJID']);
		$('.el-attr .el-attr-common-datafield').attr('disabled', true);
	} else if ($('.editor-area .object.selected').length == 1) {
		G_CONTROL_SELECT_OBJECT = $('.editor-area .object.selected');
		G_CONTROL_MULTISELECT = false;

		$('.el-attr #el-attr-common #el-attr-common-id').val(G_CONTROL_SELECT_OBJECT.IObject('id'));

		switch (G_CONTROL_SELECT_OBJECT.IObject('getType')) {
			case OBJECT_TYPE_BOX:
				$('.el-attr #el-attr-common #el-attr-common-type').val(MESSAGE['OBJECT_BOX']);
				break;
			case OBJECT_TYPE_TEXT:
				$('.el-attr #el-attr-common #el-attr-common-type').val(MESSAGE['OBJECT_TEXT']);
				break;
			case OBJECT_TYPE_IMAGE:
				$('.el-attr #el-attr-common #el-attr-common-type').val(MESSAGE['OBJECT_IMAGE']);
				break;
			case OBJECT_TYPE_VIDEO:
				$('.el-attr #el-attr-common #el-attr-common-type').val(MESSAGE['OBJECT_VIDEO']);
				break;
			case OBJECT_TYPE_AUDIO:
				$('.el-attr #el-attr-common #el-attr-common-type').val(MESSAGE['OBJECT_AUDIO']);
				break;
			default:
				$('.el-attr #el-attr-common #el-attr-common-type').val('');
				break;
		}
		$('.el-attr .el-attr-common-datafield').removeAttr('disabled', true);
		$('.el-attr button').removeAttr('disabled');
	} else {
		G_CONTROL_SELECT_OBJECT = undefined;
		G_CONTROL_MULTISELECT = false;

		$('.el-attr #el-attr-common #el-attr-common-id').val('');
		$('.el-attr #el-attr-common #el-attr-common-type').val('');
		$('.el-attr .el-attr-common-datafield').attr('disabled', true);
		$('.el-attr button').attr('disabled', true);
	}
	controlLayoutSetObject();
	controlStyleSetObject();
	controlStyleResetAnimationName();
}
