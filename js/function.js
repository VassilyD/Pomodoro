const MS_IN_SECONDE = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECONDE;
//const MS_IN_HOURS = 60 * MS_IN_MINUTE;

// Q1 : Est-ce propre de déclarer et initialiser ainsi 2 variables (voir plus)?
let isLooping = isPaused = false;
let dateFinChrono = 0;
let tempsRestant = 0;
let play = {};
let stop = {};
let inputs = {};
let display = {};
let staminaBar = {};
let tWork = 20 * MS_IN_MINUTE;
let tBreak = 10 * MS_IN_MINUTE;
let tStop = 30 * MS_IN_MINUTE;
let inBreak = false;
let cycle = 0;

function launchTimer() {
	tempsRestant = (dateFinChrono - Date.now());
	display.html(styleTime(tempsRestant));
	timer = setInterval(timing, MS_IN_SECONDE);
}

function styleTime(time = 0) {
	var minutes = Math.floor(time / MS_IN_MINUTE);
	if(minutes < 10 && minutes > 0) minutes = "0" + minutes;
	else if(minutes <= 0) minutes = "00";
	time -= minutes * MS_IN_MINUTE;

	var secondes = Math.floor(time / MS_IN_SECONDE);
	if(secondes < 10 && secondes > 0) secondes = "0" + secondes;
	else if(secondes <= 0) secondes = "00";

	return "" + minutes + " : " + secondes;
}

function timing() {
	// Q2 : Faut il déclarer mieux switchPhase(), qui n'est utile que dans timing(), ici ou bien en globale?
	function switchPhase(newTime = 0) {
		dateFinChrono = Date.now() + newTime;
		display.html(styleTime(newTime));
		inBreak = !inBreak;
	}
	tempsRestant = (dateFinChrono - Date.now());
	display.html(styleTime(tempsRestant));
	var tmp = (!inBreak)?tWork:(cycle < 3)?tBreak:tStop;
	tmp = 100 * tempsRestant / tmp;
	tmp = (!isLooping || tmp > 100)?100:(tmp < 0)?0:tmp;
	if (inBreak) staminaBar.animate({width: (100 - tmp)+'%'});
	else staminaBar.animate({width: tmp+'%'});

	if(tempsRestant < 0) {
		if(inBreak) {
			switchPhase(tWork)
			if(cycle < 3) cycle++;
			else cycle = 0;
		}
		else if(cycle < 3) switchPhase(tBreak);
		else switchPhase(tStop);
	}
}
