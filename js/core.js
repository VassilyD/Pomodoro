$(document).ready(function(){
	play = $('#play');
	stop = $('#stop');
	nextStep = $('#next');
	display = $('#time');
	headTitle = $('title');
	timeSet = {
		work: $('#workSet input'),
		break: $('#breakSet input'),
		chill: $('#stopSet input'),
		selectWork: $('#selectWork'),
		selectBreak: $('#selectBreak'),
		selectChill: $('#selectChill')
	};
	phaseShower = $('#phaseShower');
	staminaBar = $('#staminaBar');
	menuIcon = $('#menuSwitch');
	menu = $('#menu');
	clockDiv = $('.clock');
	clocks = [$('#hour'), $('#min'), $('#sec')];
	clocksF = [$('#hourF'), $('#minF'), $('#secF')];

	timeSet.work.val(Math.floor(tWork / MS_IN_MINUTE));
	timeSet.break.val(Math.floor(tBreak / MS_IN_MINUTE));
	timeSet.chill.val(Math.floor(tStop / MS_IN_MINUTE));
	display.html(styleTime(tWork));
	//clockSize();

	if (!('Notification' in window)){
		alert('This browser don\'t support Desktop Notifications.');
	} else if (Notification.permission !== 'denied'){
		Notification.requestPermission(function(permission){
			Notification.permission = permission;
		});
	}

	hideClock();
	for(i = 0; i < 3; i++) clocks[i].css({'height': '-=2%'});
	setTimeout(function(){setInterval(mainLoop, 1000)}, Date.now() % (MS_IN_SECONDE+1));
	
	play.click(switchPlay);
	stop.click(stopTimer);
	nextStep.click(goNextStepPre);
	menuIcon.click(menuToggle);
	timeSet.selectWork.click(function(){selectPhase('work')});
	timeSet.selectBreak.click(function(){selectPhase('break')});
	timeSet.selectChill.click(function(){selectPhase('chill')});

	// Gestion des différents chronos
	timeSet.work.change(function(){
		if(!inBreak && isLooping) {
			if(isPaused) dateFinChrono = Date.now() + tempsRestant;
			dateFinChrono += this.value * MS_IN_MINUTE - tWork;
			tWork = this.value * MS_IN_MINUTE;
			timing();
			clock(dateFinChrono, clocksF);
		}
		else {
			tWork = this.value * MS_IN_MINUTE;
			if(!inBreak) display.html(styleTime(tWork));
		}
	});
	timeSet.break.change(function(){
		if(inBreak && cycle < 3) {
			if(isPaused || !isLooping) dateFinChrono = Date.now() + tempsRestant;
			dateFinChrono += this.value * MS_IN_MINUTE - tBreak;
			tBreak = this.value * MS_IN_MINUTE;
			timing();
			clock(dateFinChrono, clocksF);
		}
		else tBreak = this.value * MS_IN_MINUTE;
	});
	timeSet.chill.change(function(){
		if(inBreak && cycle == 3) {
			if(isPaused || !isLooping) dateFinChrono = Date.now() + tempsRestant;
			dateFinChrono += this.value * MS_IN_MINUTE - tStop;
			tStop = this.value * MS_IN_MINUTE;
			timing();
			clock(dateFinChrono, clocksF);
		}
		else tStop = this.value * MS_IN_MINUTE;
	});

	// Gestion des raccourcis clavier
	$(window).keydown(function(event){
		switch(event.which) {
			case 32: // espace
			case 80: // p
				switchPlay();
				break;

			case 77: // m
				menuToggle()
				break;

			case 78: // n
				goNextStepPre();
				break;

			case 83: // s
				stopTimer();
				break;

			case 87: // w
				selectPhase('work');
				break;

			case 66: // b
				selectPhase('break');
				break;

			case 67: // c
				selectPhase('chill');
				break;

			default:
		}
	});

	//$(window).resize(clockSize);
});