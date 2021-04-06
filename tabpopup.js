//Objekt für "Alle Öffnen" Button holen
let buttonalle = document.getElementById("allelinks");

//Asynchrone Funktion mit Promise für Chrome API "Storage" Sync(wird im Chrome Profil gespeichert) Get - Daten mit dem empfangenen "key" aus dem Storage holen
//Bei erfolgreichem Ausführen wird die Promise Antwort "resolve" zurückgegeben.
//Wenn ein Fehler auftritt, wird die Promise Antwort "reject" zurückgegeben und der Fehler wird mit Übergabe des Fehlerstrings über die try/catch Routine zurückgegeben
async function getFromStorage(key) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get(key, result => {
                resolve(result)
            });
        } catch (e) { reject("Fehler beim Lesen aus dem Storage: " + e); }
    })
}

//Funktion um den Anfang des erhaltenen Strings auf "http://" und/oder "https://" zu prüfen und wenn dies nicht vorhanden ist, den Anfang des Strings mit "http://" erweitern
function LinkKorrektur (link) {
    if (link.startsWith("http://") || link.startsWith("https://")) {
	} else {
      link = `http://${link}`;
	}
	return link;
};

//Asynchrone Funktion, welche die zu erinnernden URL's auf der Seite ausgibt
//Ein Array "ua" bzw "urlalarm", welches die zu erinnernden URL's enthält, wird mit await (Rest der Coadeausführung wartet darauf) über die getFromStorage Funktion geladen
//Mit der forEach Methode werden alle sich im Array befindlichen Elemente in Form von HTML Links (Ziel=neues Tab) als Tabellenzeilen im HTML Element "auflistung" ausgegeben
//Dabei werden die URL's jeweils mit der Funktion LinkKorrektur in gültige Links korrigiert, sodass sich diese auch richtig öffnen lassen
async function URLsAusgeben() {
	let ua = (await getFromStorage("urlalarm")).urlalarm;
	ua.forEach(element => {
		document.getElementById("auflistung").innerHTML 
		+= `<td><a href="` + LinkKorrektur(element) + `" target="_blank">${element}</td>`;
	});
	console.log("Urls augegeben");
}

//Verwendung des Button OnClick Events, um beim Klick auf den "Alle Öffnen" Button Code auszuführen
//Alle Link Elemente mit der Methode querySelectorAll aus dem aktuellen Dokument (tabpopup.html) in "links" einlesen
//Alle Link Elemente in einer For Schlaufe mit der window.open Methode jeweils in neuen Tabs öffnen
buttonalle.onclick = function() {
	let links = document.querySelectorAll("a");
	console.log(links);
	for (let i=0; i<links.length; i++){
		window.open(links[i].href);
	};
};

//Funktionsaufruf für die Ausgabe bzw. Auflistung der URL's auf der Seite
URLsAusgeben();