var G_WAITBAR_REF = 0;
var G_WAITBAR_TIMER_ID;
var G_WAITBAR_TIMEOUT = 60000; // 2분

function waitbarShow() {
	try {
		if (G_WAITBAR_TIMER_ID) clearTimeout(G_WAITBAR_TIMER_ID);
		G_WAITBAR_TIMER_ID = setTimeout('waitbarTimeout()', G_WAITBAR_TIMEOUT);
		G_WAITBAR_REF++;
	} catch (e) {}
	if (G_WAITBAR_REF == 1) $.loader();
}

function waitbarSetContent(msg) {
	$.loader('setContent', msg);
}

function waitbarHide() {
	G_WAITBAR_REF--;
	if (G_WAITBAR_REF < 1) {
		G_WAITBAR_REF = 0;
		$.loader('setContent', '');
		$.loader('close');
		if (G_WAITBAR_TIMER_ID) clearTimeout(G_WAITBAR_TIMER_ID);
	}
}

function waitbarTimeout() {
	waitbarHide();
	alert(MESSAGE['G_WAITBAR_TIMEOUT']);
}
