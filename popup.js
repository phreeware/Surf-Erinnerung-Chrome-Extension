//Objekt für "Speichern" Button holen
let buttonok = document.getElementById("buttonok");

//Zeitfeld Wert auf 18:00 (nicht wie im background initialisiert auf 18:30) setzen, welches wieder durch das Laden überschrieben wird, dient zur Initialisierung und auch zur Fehlerbehebung
document.getElementById("zeit").value = "18:00"

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

//Asynchrone Funktion mit Promise für Chrome API "Storage" Sync(wird im Chrome Profil gespeichert) Set - Daten mit den empfangenen "key" und "value" in den Storage schreiben, wobei "value" alles mögliche von String bis Objekt sein kann
//Bei erfolgreichem Ausführen wird die Promise Antwort "resolve" zurückgegeben.
//Wenn ein Fehler auftritt, wird die Promise Antwort "reject" zurückgegeben und der Fehler wird mit Übergabe des Fehlerstrings über die try/catch Routine zurückgegeben
async function setToStorage(key, value) {
    return new Promise((resolve, reject) => {
        try {
            let obj = {};
            obj[key] = value;
            chrome.storage.sync.set(obj, resolve);
        } catch (e) { reject("Fehler beim Schreiben in den Storage: " + e); }
    })
}

//Asynchrone Funktion, um die im Storage gespeicherte Zeit und die URL's 1-10 im Popup anzuzeigen
//Objekt "su" bzw. "savedurls" wird mit await geladen (der Rest des Codes wartet auf das laden), welches die vom User gespeicherten URL's 1-10 enthält
//Wert des Zeitfeldes auf der Seite setzen, welcher aus der Eigenschaft "zeit" aus dem Objekt "su" gelesen wird
//Werte der Textfelder für URL's 1-10 auf der Seite setzen, welche aus den Eigenschaften "url1"-"url10" aus dem Objekt "su" gelesen werden
async function URLsLaden() {
	let su = (await getFromStorage("savedurls")).savedurls;
	document.getElementById("zeit").value = su.zeit;
	document.getElementById("url1").value = su.url1;
	document.getElementById("url2").value = su.url2;
	document.getElementById("url3").value = su.url3;
	document.getElementById("url4").value = su.url4;
	document.getElementById("url5").value = su.url5;
	document.getElementById("url6").value = su.url6;
	document.getElementById("url7").value = su.url7;
	document.getElementById("url8").value = su.url8;
	document.getElementById("url9").value = su.url9;
	document.getElementById("url10").value = su.url10;
}

//Verwendung des Button OnClick Events, um beim Klick auf den "Speichern" Button Code auszuführen, wobei eine Übergabe des Button Elementes über die Funktion stattfindet
//Objekt "urls" definieren, mit den Eigenschaften "zeit", welche den Wert des Zeitfeldes auf der Seite bekommet, und den Eigenschaften "url1"-"url10", welche den jeweiligen Inhalt der gleichnamigen URL Textfeldern bekommen
//Mit der setToStorage Funktion, wird das Objekt "urls" als "savedurls" im Storage gespeichert
//Der Text "Gespeichert." wird über die Eigenschaft textContent in die HTML Tabellenzeile geschrieben, sodass der vorhandene Button durch diesen Text überschrieben wird
buttonok.onclick = function(element) {
	let urls = {
		zeit: document.getElementById("zeit").value,
		url1: document.getElementById("url1").value,
		url2: document.getElementById("url2").value,
		url3: document.getElementById("url3").value,
		url4: document.getElementById("url4").value,
		url5: document.getElementById("url5").value,
		url6: document.getElementById("url6").value,
		url7: document.getElementById("url7").value,
		url8: document.getElementById("url8").value,
		url9: document.getElementById("url9").value,
		url10: document.getElementById("url10").value
	};
	setToStorage("savedurls", urls);
	document.getElementById("saved").textContent = "Gespeichert.";
}

//Funktionsaufruf für die Anzeige der gespeicherten Zeit und URL's auf der Seite
URLsLaden();