$(document).ready(function(){
	play = $('#play');
	stop = $('#stop');
	nextStep = $('#next');
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

	clocks = [$('#hour'), $('#min'), $('#sec')];
	clocksF = [$('#hourF'), $('#minF'), $('#secF')];
	hideClock();
	for(i = 0; i < 3; i++) clocks[i].css({'height': '-=5%', 'width': '+=1px'});
	setTimeout(function(){setInterval(mainLoop, 1000)}, Date.now() % (MS_IN_SECONDE+1));
	
	play.click(switchPlay);
	stop.click(stopTimer);
	nextStep.click(goNextStepPre);

	$('input:first').change(function(){
		if(!inBreak && isLooping) {
			if(isPaused) dateFinChrono = Date.now() + tempsRestant;
			dateFinChrono += inputs[0].value * MS_IN_MINUTE - tWork;
			tWork = inputs[0].value * MS_IN_MINUTE;
			timing();
			clock(dateFinChrono, clocksF);
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
			clock(dateFinChrono, clocksF);
		}
		else tBreak = inputs[1].value * MS_IN_MINUTE;
	});
	$('input:last').change(function(){
		if(inBreak && cycle == 3) {
			if(isPaused) dateFinChrono = Date.now() + tempsRestant;
			dateFinChrono += inputs[2].value * MS_IN_MINUTE - tStop;
			tStop = inputs[2].value * MS_IN_MINUTE;
			timing();
			clock(dateFinChrono, clocksF);
		}
		else tStop = inputs[2].value * MS_IN_MINUTE;
	});

	$('body').keydown(function(event){
		if(event.which == 32 || event.which == 80) switchPlay();
		else if(event.which == 78) goNextStepPre();
		else if(event.which == 83) stopTimer();
	});

});