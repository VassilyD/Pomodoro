const MS_IN_SECONDE = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECONDE;
//const MS_IN_HOURS = 60 * MS_IN_MINUTE;

// Q1 : Est-ce propre de déclarer et initialiser ainsi 2 variables (voir plus)?
let isLooping = isPaused = inBreak = false;
let dateFinChrono = 0;
let tempsRestant = 0;
let play = {};
let stop = {};
let nextStep = {};
let inputs = {};
let display = {};
let staminaBar = {};
let clocks = [];
let clocksF = [];
let tWork = 25 * MS_IN_MINUTE;
let tBreak = 5 * MS_IN_MINUTE;
let tStop = 30 * MS_IN_MINUTE;
let cycle = 0;
let notification;
let alertAudio = new Audio('audio/alert.wav');

function mainLoop() {
	clock();
	if(isLooping && !isPaused) timing();
}

function showClock() {
	for(i = 0; i < 3; i++) clocksF[i].show();
}

function hideClock() {
	for(i = 0; i < 3; i++) clocksF[i].hide();
}

function clock(time = Date.now(), clocksT = clocks) {
	var d = new Date(time);
	var h = d.getHours();
	var m = d.getMinutes();
	var s = d.getSeconds();
	var hourDeg = h * 30 + (m / 2) + (s / 120) - 180;
	var hourRun = "rotate(" + hourDeg + "deg)";
	clocksT[0].css({ "transform": hourRun});
	var minDeg = m * 6 + (s / 10) - 180;
	var minRun = "rotate(" + minDeg + "deg)";
	clocksT[1].css({ "transform" : minRun });
	var secDeg = s * 6 - 180;
	var secRun = "rotate(" + secDeg + "deg)";
	clocksT[2].css({ "transform": secRun });
}

function switchPlay() {
	alertAudio.loop = false;
	nextStep.show();
	if(!isLooping) {
		dateFinChrono = (tempsRestant == 0)?(Date.now() + tWork):(Date.now() + tempsRestant);
		timing();
		clock(dateFinChrono, clocksF);
		showClock();
		play.text('Pause');
		isLooping = true;
	}
	else if(isPaused) {
		dateFinChrono = Date.now() + tempsRestant;
		timing();
		clock(dateFinChrono, clocksF);
		showClock();
		isPaused = false;
		play.text('Pause');
	}
	else {
		timing();
		hideClock();
		isPaused = true;
		play.text('Play');
	}
}

function stopTimer() {
	isLooping = isPaused = inBreak = false;
	tempsRestant = cycle = dateFinChrono = 0;
	display.html(styleTime(tWork));
	staminaBar.css('background-color', 'green');
	staminaBar.animate({width: '100%'}, 250);
	alertAudio.loop = false;
	nextStep.show();
	play.text('Lancer');
	hideClock();
}

function switchPhase(newTime = 0) {
	tempsRestant = newTime;
	display.html(styleTime(newTime));
	inBreak = !inBreak;
}

function goNextStepPre() {
	dateFinChrono = Date.now() - MS_IN_MINUTE;
	timing();
}

function goNextStep() {
	isPaused = (isLooping)?true:false;
	play.text('Play');
	hideClock();
	
	if(inBreak) {
		switchPhase(tWork)
		if(cycle < 3) cycle++;
		else cycle = 0;
		var tmp = {body: 'Il est temps de retourner au travail!'};
	}
	else if(cycle < 3) {
		switchPhase(tBreak)
		var tmp = {body: 'Il est temps de se détendre ' + Math.floor(tBreak / MS_IN_MINUTE) + 'mn!'};
	}
	else {
		switchPhase(tStop)
		var tmp = {body: 'Il est temps de déconnecter!!!'};
	}

	if(isLooping) {
		alertAudio.play();
		alertAudio.loop = true;
		nextStep.hide();

		notification = new Notification('Yohohoho!', tmp);
		notification.onclick = function(){
			switchPlay()
			notification.close();
		}
	}

}

function styleTime(time = 0) {
	var minutes = Math.floor(time / MS_IN_MINUTE);
	minutes = (minutes<0)?0:minutes;
	minutes = ('0' + minutes).slice(-2);

	var secondes = Math.floor((time % MS_IN_MINUTE) / MS_IN_SECONDE);
	secondes = (secondes<0)?0:secondes;
	secondes = ('0' + secondes).slice(-2);

	return "" + minutes + " : " + secondes;
}

function timing() {
	tempsRestant = (dateFinChrono - Date.now());
	display.html(styleTime(tempsRestant));
	$('title').text(styleTime(tempsRestant) + ' Pomodoro');

	var tmp = (!inBreak)?tWork:(cycle < 3)?tBreak:tStop;
	tmp = 100 * tempsRestant / tmp;
	tmp = (tmp > 100)?100:(tmp < 0)?0:tmp;
	if (inBreak) staminaBar.animate({width: (100 - tmp)+'%'}, 250);
	else staminaBar.animate({width: tmp+'%'}, 250);

	if(cycle == 3 && inBreak) {
		if (tmp >= 75) staminaBar.css('background-color', 'rgb(255, ' + (128*(100-tmp)/25) + ', 0)');
		else if (tmp >= 50) staminaBar.css('background-color', 'rgb(255, ' + (128 + 100*(75-tmp)/25) + ', 0)');
		else if (tmp >= 25) staminaBar.css('background-color', 'rgb(' + (255 - 127*(50-tmp)/25) + ', ' + (228 - 100*(50-tmp)/25) + ', 0)');
		else  staminaBar.css('background-color', 'rgb(' + (128 - 128*(25-tmp)/25) + ', 128, 0)');
	}
	else switch(cycle) {
		case 0:
			if(inBreak) staminaBar.css('background-color', 'rgb(128, 128, 0)');
			else staminaBar.css('background-color', 'rgb(' + (128*(100-tmp)/100) + ', 128, 0)');
			break;

		case 1:
			if(inBreak) staminaBar.css('background-color', 'rgb(255, 228, 0)');
			else staminaBar.css('background-color', 'rgb(' + (128 + 127*(100-tmp)/100) + ', ' + (128 + 100*(100-tmp)/100) + ', 0)');
			break;

		case 2:
			if(inBreak) staminaBar.css('background-color', 'rgb(255, 128, 0)');
			else staminaBar.css('background-color', 'rgb(255, ' + (228 - 100*(100-tmp)/100) + ', 0)');
			break;

		case 3:
			staminaBar.css('background-color', 'rgb(255, ' + (128 - 128*(100-tmp)/100) + ', 0)');
			break;

		default:
			console.log('Ceci ne devrais pas arrivé!');
	}

	if(tempsRestant <= 0) {
		goNextStep();
	}
}
