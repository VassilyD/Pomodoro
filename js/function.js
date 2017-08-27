const MS_IN_SECONDE = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECONDE;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const ANIM_SPEED = 250;

// Q1 : Est-ce propre de déclarer et initialiser ainsi 2 variables (voir plus)?
let isLooping = isPaused = inBreak = false;
let dateFinChrono = 0;
let tempsRestant = 0;
let play = {};
let stop = {};
let nextStep = {};
let timeSet = {};
let display = {};
let staminaBar = {};
let headTitle = {};
let phaseShower = {};
let menuIcon = {};
let menu = {};
let clockDiv = {};
let clocks = [];
let clocksF = [];
let tNow = Date.now();
let tWork = 25 * MS_IN_MINUTE;
let tBreak = 5 * MS_IN_MINUTE;
let tStop = 30 * MS_IN_MINUTE;
let cycle = 0;
let notification;
let alertAudio = new Audio('audio/good_job.mp3');
let srcAudio = ['audio/good_job.mp3', 'audio/chewbacca.mp3', 'audio/servietsky.mp3'];
let colorBar = [[0, 128, 0], [128, 128, 0], [255, 228, 0], [255, 128, 0], [255, 0, 0]];

// La seule vrai boucle ^^
function mainLoop() {
	tNow = Date.now();
	clock(tNow, clocks);
	if(isLooping && !isPaused) {
		timing(tNow);
		clock(dateFinChrono - tNow - MS_IN_HOUR, clocksF);
	}
}

// Affiche l'horloge de fin de compteur
function showClock() {
	for(i = 0; i < 3; i++) clocksF[i].show();
}

// Cache l'horloge de fin de compteur
function hideClock() {
	for(i = 0; i < 3; i++) clocksF[i].hide();
}

// Affiche / cache le menu
function menuToggle() {
	menu.toggle();
	menuIcon.attr('class', (menuIcon.attr('class') == 'fa fa-info-circle')?'fa fa-times-circle':'fa fa-info-circle');
}

function clockSize() {
	if($(window).width() > $(window).height()) {
		clockDiv.css({height: '40vh', width: '40vh', left: 'calc(50vw - 20vh)'});
	}
	else {
		clockDiv.css({height: '40vw', width: '40vw', left: '30vw'});
	}
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
		glowingPhase();
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
	headTitle.text(' Pomodoro');
	hideClock();
	unGlowing();
}

function glowingPhase() {
	unGlowing();
	if(!inBreak) {
		phaseShower.css('top', 'var(--workSetTop)');
	}
	else if(cycle < 3) {
		phaseShower.css('top', 'var(--breakSetTop)');
	}
	else {
		phaseShower.css('top', 'var(--chillSetTop)');
	}
	phaseShower.show();
}

function unGlowing() {
	phaseShower.hide();
}

function selectPhase(phase) {
	isPaused = (isLooping)?true:false;
	play.html('<i class="fa fa-play">');
	hideClock();
	alertAudio.loop = false;

	switch(phase) {
		case 'work':
			inBreak = true;
			switchPhase(tWork);
			staminaBar.css('background-color', 'rgb('+colorBar[cycle][0]+', '+colorBar[cycle][1]+', '+colorBar[cycle][2]+')');
			staminaBar.animate({width: '100%'}, 250);
			break;

		case 'break':
			inBreak = false;
			if(cycle == 3) cycle = 2;
			switchPhase(tBreak);
			staminaBar.animate({width: '0%'}, 250);
			break;

		case 'chill':
			inBreak = false;
			cycle = 3;
			switchPhase(tStop);
			staminaBar.animate({width: '0%'}, 250);
			break;

		default:
	}
}

function switchPhase(newTime = 0) {
	tempsRestant = newTime;
	display.html(styleTime(newTime));
	inBreak = !inBreak;
	glowingPhase();
}

function goNextStepPre() {
	dateFinChrono = Date.now() - MS_IN_MINUTE;
	timing();
}

// Fais passer à l'étape suivante et le notifie
function goNextStep() {
	alertAudio.loop = false;
	var tmpSon;
	if(inBreak) {
		switchPhase(tWork);
		tmpSon = srcAudio[1];
		if(cycle < 3) cycle++;
		else cycle = 0;
		var tmp = {body: 'Il est temps de retourner au travail!'};
	}
	else if(cycle < 3) {
		switchPhase(tBreak);
		tmpSon = srcAudio[0];
		var tmp = {body: 'Il est temps de se détendre ' + Math.floor(tBreak / MS_IN_MINUTE) + 'mn!'};
	}
	else {
		switchPhase(tStop);
		tmpSon = srcAudio[2];
		var tmp = {body: 'Il est temps de déconnecter!!!'};
	}

	if(isLooping && !isPaused) {
		alertAudio = new Audio(tmpSon);
		alertAudio.play();
		alertAudio.loop = true;
		nextStep.hide();

		notification = new Notification('Yohohoho!', tmp);
		notification.onclick = function(){
			switchPlay()
			notification.close();
		}
	}

	isPaused = (isLooping)?true:false;
	play.html('<i class="fa fa-play">');
	hideClock();
}

// Renvoie une chaine de caractère du type 'MM : SS'
function styleTime(time = 0) {
	var d = new Date(time);
	var secondes = ('00' + d.getSeconds()).slice(-2);
	var minutes = d.getMinutes() + 60 * (d.getHours() - 1);
	
	return "" + ((minutes >= 10)?minutes:('0'+minutes)) + " : " + secondes;
}

// Change la couleur de la barre en fonction du % de temps et du nombre de cycle écoulé
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
	else if(inBreak) ProgressBarColor(tmp, colorBar[cycle+1], colorBar[cycle+1]);
	else ProgressBarColor(tmp, colorBar[cycle], colorBar[cycle+1]);
}

// Actualise le temps restant et la barre de progression
function timing(tNow = Date.now()) {
	tempsRestant = (dateFinChrono - tNow);
	display.html(styleTime(tempsRestant));
	headTitle.text(styleTime(tempsRestant) + ' Pomodoro');

	// tmp = pourcentage de temps restant
	var tmp =  Math.min(100, Math.max(0, 100 * tempsRestant / ((!inBreak)?tWork:(cycle < 3)?tBreak:tStop)));

	staminaBar.animate({width: (100*inBreak + ((-1)**inBreak)*tmp)+'%'}, ANIM_SPEED);

	setProgressBarColor(tmp);

	if(tempsRestant <= 0) {
		goNextStep();
	}
}
