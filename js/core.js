$(document).ready(function(){
	play = $('#play');
	stop = $('#stop');
	display = $('#time');
	inputs = $('input');
	staminaBar = $('#staminaBar');
	inputs[0].value = Math.floor(tWork / MS_IN_MINUTE);;
	inputs[1].value = Math.floor(tBreak / MS_IN_MINUTE);;
	inputs[2].value = Math.floor(tStop / MS_IN_MINUTE);;
	display.html(styleTime(tWork));


	if (!('Notification' in window)){
		alert('This browser don\'t support Desktop Notifications.');
	} else if (Notification.permission !== 'denied'){
		Notification.requestPermission(function(permission){
			Notification.permission = permission;
		});
	}


	play.click(switchPlay);

	stop.click(stopTimer);
	
	$('input:first').change(function(){
		if(!inBreak && isLooping) {
			if(isPaused) dateFinChrono = Date.now() + tempsRestant;
			dateFinChrono += inputs[0].value * MS_IN_MINUTE - tWork;
			tWork = inputs[0].value * MS_IN_MINUTE;
			timing();
		}
		else {
			tWork = inputs[0].value * MS_IN_MINUTE;
			if(!inBreak) display.html(styleTime(tWork));
		}
	});
	$('input:nth-child(3)').change(function(){
		if(inBreak && cycle < 3) {
			if(isPaused) dateFinChrono = Date.now() + tempsRestant;
			dateFinChrono += inputs[1].value * MS_IN_MINUTE - tBreak;
			tBreak = inputs[1].value * MS_IN_MINUTE;
			timing();
		}
		else tBreak = inputs[1].value * MS_IN_MINUTE;
	});
	$('input:last').change(function(){
		if(inBreak && cycle == 3) {
			if(isPaused) dateFinChrono = Date.now() + tempsRestant;
			dateFinChrono += inputs[2].value * MS_IN_MINUTE - tStop;
			tStop = inputs[2].value * MS_IN_MINUTE;
			timing();
		}
		else tStop = inputs[2].value * MS_IN_MINUTE;
	});

	$('body').keypress(function(event){
		if(event.which == 32) {
			clearInterval(timer);
			switchPlay();
		}
	});
});