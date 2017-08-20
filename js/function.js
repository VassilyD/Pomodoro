const MS_IN_SECONDE = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECONDE;
//const MS_IN_HOURS = 60 * MS_IN_MINUTE;

// Q1 : Est-ce propre de déclarer et initialiser ainsi 2 variables (voir plus)?
let isLooping = isPaused = false;
let dateFinChrono = 0;
let tempsRestant = 0;
let timer = 0;
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
let notification;
let alertAudio = new Audio('audio/alert.wav');


function switchPlay(){
	if(!isLooping) {
		dateFinChrono = Date.now() + tWork;
		timing();
		play.text('Pause');
		timer = setTimeout(launchTimer, tempsRestant % MS_IN_SECONDE);
		isLooping = true;
	}
	else if(isPaused) {
		dateFinChrono = Date.now() + tempsRestant;
		timing();
		timer = setTimeout(launchTimer, tempsRestant % MS_IN_SECONDE);
		isPaused = false;
		play.text('Pause');
	}
	else {
		clearInterval(timer);
		timing();
		isPaused = true;
		play.text('Play');
	}
}

function stopTimer(){
	clearInterval(timer);
	isLooping = isPaused = inBreak = false;
	tempsRestant = cycle = dateFinChrono = 0;
	display.html(styleTime(0));
	staminaBar.css('width', '100%');
	play.text('Lancer');
}

function launchTimer() {
	tempsRestant = (dateFinChrono - Date.now());
	display.html(styleTime(tempsRestant));
	timer = setInterval(timing, MS_IN_SECONDE);
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
	// Q2 : Faut il déclarer mieux switchPhase(), qui n'est utile que dans timing(), ici ou bien en globale?
	function switchPhase(newTime = 0) {
		tempsRestant = newTime;
		display.html(styleTime(newTime));
		inBreak = !inBreak;
		//timer = setTimeout(launchTimer, newTime % MS_IN_SECONDE);
		//isPaused = false;
		//play.text('Pause');
	}
	tempsRestant = (dateFinChrono - Date.now());
	display.html(styleTime(tempsRestant));
	$('title').text(styleTime(tempsRestant) + ' Pomodoro');

	var tmp = (!inBreak)?tWork:(cycle < 3)?tBreak:tStop;
	tmp = 100 * tempsRestant / tmp;
	tmp = (!isLooping || tmp > 100)?100:(tmp < 0)?0:tmp;
	if (inBreak) staminaBar.animate({width: (100 - tmp)+'%'}, 250);
	else staminaBar.animate({width: tmp+'%'}, 250);

	if(cycle == 3 && inBreak) staminaBar.css('background-color', 'rgb(' + (255*tmp/100) + ', ' + (128*(100-tmp)/100) + ', 0)');
	else switch(cycle) {
		case 0:
			if(inBreak) staminaBar.css('background-color', 'rgb(128, 128, 0)');
			else staminaBar.css('background-color', 'rgb(' + (128*(100-tmp)/100) + ', 128, 0)');
			break;

		case 1:
			if(inBreak) staminaBar.css('background-color', 'rgb(255, 255, 0)');
			else staminaBar.css('background-color', 'rgb(' + (128 + 128*(100-tmp)/100) + ', ' + (128 + 128*(100-tmp)/100) + ', 0)');
			break;

		case 2:
			if(inBreak) staminaBar.css('background-color', 'rgb(255, 128, 0)');
			else staminaBar.css('background-color', 'rgb(255, ' + (255 - 128*(100-tmp)/100) + ', 0)');
			break;

		case 3:
			staminaBar.css('background-color', 'rgb(255, ' + (128 - 128*(100-tmp)/100) + ', 0)');
			break;

		default:
			console.log('Ceci ne devrais pas arrivé!');
	}

	if(tempsRestant < 0) {
		clearInterval(timer);
		isPaused = true;
		play.text('Play');
		alertAudio.play();
		if(inBreak) {
			switchPhase(tWork)
			if(cycle < 3) cycle++;
			else cycle = 0;
			notification = new Notification('Yohohoho!', {body: 'Il est temps de retourner au travail!'});
			notification.onclick = function(){
				switchPlay()
				notification.close();
			}
		}
		else if(cycle < 3) {
			switchPhase(tBreak)
			var notification = new Notification('Yohohoho!', {body: 'Il est temps de se détendre ' + Math.floor(tBreak / MS_IN_MINUTE) + 'mn!'});
			notification.onclick = function(){
				switchPlay()
				notification.close();
			}
		}
		else {
			switchPhase(tStop)
			var notification = new Notification('Yohohoho!', {body: 'Il est temps de déconnecter!!!'});
			notification.onclick = function(){
				switchPlay()
				notification.close();
			}
		}
	}
}
