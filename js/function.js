const MS_IN_SECONDE = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECONDE;
const ANIM_SPEED = 250;

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
let colorBar = [[0, 128, 0], [128, 128, 0], [255, 228, 0], [255, 128, 0], [255, 0, 0]];

// La seule vrai boucle ^^
function mainLoop() {
	clock();
	if(isLooping && !isPaused) timing();
}

// Affiche l'horloge de fin de compteur
function showClock() {
	for(i = 0; i < 3; i++) clocksF[i].show();
}

// Cache l'horloge de fin de compteur
function hideClock() {
	for(i = 0; i < 3; i++) clocksF[i].hide();
}

// positionne les aiguilles de l'horloge selectionné en fonction de la date entrée
// Merci Roxane!
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

// Switch entre décompte et pause. Sers aussi pour le lancement initiale
function switchPlay() {
	alertAudio.loop = false;
	nextStep.show();
	if(!isLooping) {
		dateFinChrono = (tempsRestant == 0)?(Date.now() + tWork):(Date.now() + tempsRestant);
		timing();
		clock(dateFinChrono, clocksF);
		showClock();
		play.html('<i class="fa fa-pause">');
		isLooping = true;
	}
	else if(isPaused) {
		dateFinChrono = Date.now() + tempsRestant;
		timing();
		clock(dateFinChrono, clocksF);
		showClock();
		isPaused = false;
		play.html('<i class="fa fa-pause">');
	}
	else {
		timing();
		hideClock();
		isPaused = true;
		play.html('<i class="fa fa-play">');
	}
}

// Arrete tout et réinitialise les variables
function stopTimer() {
	isLooping = isPaused = inBreak = false;
	tempsRestant = cycle = dateFinChrono = 0;
	display.html(styleTime(tWork));
	staminaBar.css('background-color', 'green');
	staminaBar.animate({width: '100%'}, 250);
	alertAudio.loop = false;
	nextStep.show();
	play.html('<i class="fa fa-play">');
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

// Fais passer à l'étape suivante et le notifie
function goNextStep() {
	isPaused = (isLooping)?true:false;
	play.html('<i class="fa fa-play">');
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

// Renvoie une chaine de caractère du type 'MM : SS'
function styleTime(time = 0) {
	var minutes = Math.floor(time / MS_IN_MINUTE);
	minutes = (minutes<0)?0:(minutes>=10)?minutes:('0' + minutes).slice(-2);

	var secondes = Math.floor((time % MS_IN_MINUTE) / MS_IN_SECONDE);
	secondes = (secondes<0)?0:('0' + secondes).slice(-2);

	return "" + minutes + " : " + secondes;
}
function ProgressBarColor(tmp, colorD = [0, 0, 0], colorF = [0, 0, 0]) {
	var red = (colorD[0] == colorF[0])?colorD[0]:(colorD[0] + (colorF[0] - colorD[0]) * (100 - tmp) / 100);
	var green = (colorD[1] == colorF[1])?colorD[1]:(colorD[1] + (colorF[1] - colorD[1]) * (100 - tmp) / 100);
	var blue = (colorD[2] == colorF[2])?colorD[2]:(colorD[2] + (colorF[2] - colorD[2]) * (100 - tmp) / 100);
	staminaBar.css('background-color', 'rgb(' + red + ', ' + green + ', ' + blue + ')');
}

// modifie la couleur de la barre de progression en fonction de l'avancement du chrono et du cycle
function setProgressBarColor(tmp) {
	if(cycle == 3 && inBreak) {
		var etape = Math.min(3, Math.floor(tmp/25));
		ProgressBarColor((tmp-25*etape)*4, colorBar[etape+1], colorBar[etape]);
	}
	else ProgressBarColor(tmp, colorBar[cycle], colorBar[cycle+1]);
}

// Actualise le temps restant et la barre de progression
function timing() {
	tempsRestant = (dateFinChrono - Date.now());
	display.html(styleTime(tempsRestant));
	$('title').text(styleTime(tempsRestant) + ' Pomodoro');

	var tmp = (!inBreak)?tWork:(cycle < 3)?tBreak:tStop;
	tmp = 100 * tempsRestant / tmp;
	tmp = (tmp > 100)?100:(tmp < 0)?0:tmp;
	if (inBreak) staminaBar.animate({width: (100 - tmp)+'%'}, ANIM_SPEED);
	else staminaBar.animate({width: tmp+'%'}, ANIM_SPEED);

	setProgressBarColor(tmp);

	if(tempsRestant <= 0) {
		goNextStep();
	}
}
