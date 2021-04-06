//Event Listener fürs Ausführen von Code bei der Installation des Plugins über die Runtime OnInstalled Chrome API
//Der Storage für dieses Plugin wird mit der Funktion clearStorage gelöscht und Variablen bzw. Objekte und Arrays initialisiert und über die Funktion setToStorage im Storage gespeichert
chrome.runtime.onInstalled.addListener(() => {
  clearStorage();
  let urls = {
	zeit: "18:30",
	url1: "",
	url2: "",
	url3: "",
	url4: "",
	url5: "",
	url6: "",
	url7: "",
	url8: "",
	url9: "",
	url10: ""
  };
  setToStorage("savedurls", urls);
  setToStorage("urlalarm", []);
  setToStorage("lng1", false);
});

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

//Asynchrone Funktion mit Promise für Chrome API "Storage" Sync(wird im Chrome Profil gespeichert) Clear - Daten im Storage werden gelöscht
//Bei erfolgreichem Ausführen wird die Promise Antwort "resolve" zurückgegeben.
//Wenn ein Fehler auftritt, wird die Promise Antwort "reject" zurückgegeben und der Fehler wird mit Übergabe des Fehlerstrings über die try/catch Routine zurückgegeben
async function clearStorage() {
    return new Promise((resolve, reject) => {
        try { chrome.storage.sync.clear(resolve); } catch (e) { reject("Fehler beim Leeren des Storage: " + e); }
    })
}

//Asynchrone Funktion mit Promise für Chrome API "History" Search - Einträge im Verlauf mit dem empfangenen Objekt "searchObj" durchsuchen 
//Bei erfolgreichem Ausführen wird die Promise Antwort "resolve" zurückgegeben.
//Wenn ein Fehler auftritt, wird die Promise Antwort "reject" zurückgegeben und der Fehler wird mit Übergabe des Fehlerstrings über die try/catch Routine zurückgegeben
async function searchChromeHistory(searchObj) {
    return new Promise((resolve, reject) => {
        try {
            chrome.history.search(searchObj, data => resolve(data));
        } catch (e) { reject("Fehler beim Lesen der History: " + e); }
    })
}

//Asynchrone Funktion um den erhaltenen Chrome History Verlaufseintrag zu prüfen, ob der Aufruf der Seite länger als 24 Stunden her ist inkl. Ausgabe in der Konsole
//Bei Positivem Befund (noch nie besucht oder länger als 24 Stunden her) wird die Variable lng1 (länger als 1 Tag) mit await (Rest der Coadeausführung wartet darauf) über die setToStorage Funktion auf true gesetzt sowie ein Array "ua" bzw "urlalarm" 
//mit await (Rest der Coadeausführung wartet darauf) über die getFromStorage Funktion geladen, mit await (Rest der Coadeausführung wartet darauf) und push mit der URL erweitert und mit await (Rest der Coadeausführung wartet darauf) 
//über die setToStorage Funktion wieder in den Storage geschrieben (um das Array von überall her erreichbar zu machen)
async function processVisits(url, visitItems) {
    if (Object.keys(visitItems).length !== 0) {
        console.log("Letzter Besuch von (" + url + "): " + new Date(visitItems[0].lastVisitTime).toString());
        if (Date.now() - visitItems[0].lastVisitTime > 86400000) {
            console.log(url + " - Länger als 1 Tag her");
            await setToStorage("lng1", true);
            let ua = (await getFromStorage("urlalarm")).urlalarm;
            await ua.push(url);
            await setToStorage("urlalarm", ua);
        } else {
            console.log(url + " - Weniger als 1 Tag her");
        };
    } else {
        console.log(url + " - Noch nie besucht");
        await setToStorage("lng1", true);
        let ua = (await getFromStorage("urlalarm")).urlalarm;
        await ua.push(url);
        await setToStorage("urlalarm", ua);
    };
}

//Asynchrone Funktion um eine URL gegen den Chrome Verlauf zu prüfen mit Übergabe eines Objektes und den nötigen Suchparametern (alle Verlaufseinträge, nur das neuste Resultat)
//mit await (Rest der Coadeausführung wartet darauf) wird die URL und der im Objekt "visitItems" gespeicherte Chrome History Verlaufseintrag verarbeitet
async function loadUrlVisits(url){
		let visitItems = await searchChromeHistory({text: url, startTime: 0, maxResults: 1});
		await processVisits(url, visitItems);
}

//Asynchrone Funktion um die Systemnotification zu generieren, wenn die gewählte Zeit der aktuellen Zeit entspricht, und es mind. 1 URL gibt, die noch nie oder länger als 24 Stunden her besucht wurden:
//Objekt "su" bzw. "savedurls" wird mit await geladen (der Rest des Codes wartet auf das laden), welches die vom User gespeicherten URL's 1-10 enthält
//Die aktuelle Zeit wird in Stunden und Minuten gegen die vom User gewählte Zeit (Eigenschaft "zeit" im Objekt "su") geprüft. Bei einer Übereinstimmung wird
//mit await (Rest der Coadeausführung wartet darauf) und setToStorage das array "urlalarm" im Storage initialisiert/geleert
//Bei nicht leeren URL's 1-10 wird mit await (Rest der Coadeausführung wartet darauf) die jeweilige URL der Funktion loadUrlVisits zur Verarbeitung übergeben
//Der Wert der Variable "lng1" wird mit await (Rest der Coadeausführung wartet darauf) und getFromStorage aus dem Storage gelesen
//Wenn der Wert von "lng1" auf true steht (eine der URL's wurde noch nie oder seit 24 Stunden nicht besucht) wird folgendes ausgeführt:
//Ein neues Objekt "opt" wird erstellt für die Übergabe an die Systemnotification mit den benötigten Eigenschaften wie das Bild des Icons, Typ, Art, Titel, Text, Priorität und einem Array für die Auflistung
//Ein Array "ua" bzw "urlalarm", welches die zu erinnernden URL's enthält, wird mit await (Rest der Coadeausführung wartet darauf) über die getFromStorage Funktion geladen
//Über eine For Schleife wird die EIgenschaft und Array "items" des Objektes "opt" mit den Werten aus dem Array "ua" als Objekteintrag in der Eigenschaft "message" über push erweitert
//Das Array sowie auch das Objekt "opt" werden zur Kontrolle in der Konsole ausgegeben
//Die Systemnotification wird mit dem Notifications Create Chrome API, der id 'notify1', der Übergabe vom Objekt "opt" und der optionalen Funktion mit Übergabe der notification id erstellt
//Dabei wird auch der letzte Fehler über die Runtime LastError Chrome API in der Konsole ausgegeben, dies dient zur Protokollierung über das Resultat des Erstellens der Systemnotification und zur Feheranalyse
//Der Wert der Variable "lng1" wird mit await (Rest der Coadeausführung wartet darauf) und setToStorage für die nächste Ausführung auf false zurückgesetzt
async function alarmfunktion(){
	let su = (await getFromStorage("savedurls")).savedurls;
	
	var zeit_h = su.zeit.substring(0,2);
	var zeit_m = su.zeit.substring(3,5);
	console.log("gewählte Stunde: " + zeit_h);
	console.log("gewählte Minute: " + zeit_m);
	
	if (new Date().getHours() == zeit_h && new Date().getMinutes() == zeit_m) {
		
		await setToStorage("urlalarm", []);
		
		if (su.url1 != ""){await loadUrlVisits(su.url1);};
		if (su.url2 != ""){await loadUrlVisits(su.url2);};
		if (su.url3 != ""){await loadUrlVisits(su.url3);};
		if (su.url4 != ""){await loadUrlVisits(su.url4);};
		if (su.url5 != ""){await loadUrlVisits(su.url5);};
		if (su.url6 != ""){await loadUrlVisits(su.url6);};
		if (su.url7 != ""){await loadUrlVisits(su.url7);};
		if (su.url8 != ""){await loadUrlVisits(su.url8);};
		if (su.url9 != ""){await loadUrlVisits(su.url9);};
		if (su.url10 != ""){await loadUrlVisits(su.url10);};

		let lng1 = (await getFromStorage("lng1")).lng1;	
				
		if (lng1) {
			var opt = {
			  iconUrl: "/images/surfalarm128.png",
			  type: 'list',
			  requireInteraction: true,
			  title: 'Seit 1 Tag nicht besucht (klick mich)',
			  message: 'Seit 1 Tag nicht besucht',
			  priority: 2,
			  items: []
			};
			
			let ua = (await getFromStorage("urlalarm")).urlalarm;
			let i;
			for (i = 0; i < ua.length; i++) {
			   opt.items.push({title: '', message: ua[i]});
			};
			console.log(ua);
			console.log(opt);
			
			chrome.notifications.create('notify1', opt, function(id) { console.log("Last error:", chrome.runtime.lastError); });	
			
			await setToStorage("lng1", false);
		};
	};
	console.log('Ende Alarmfunktion-------------------------');
}

//Einen Timer mit dem Namen "1min" über die Alarms Create Chrome API mit der Eigenschaft periodInMinutes:1 (jede Minute ausführen) erstellen
chrome.alarms.create("1min", {
  periodInMinutes: 1
});

//Event Listener über die Alarms OnAlarm Chrome API erstellen, welches die Ausführung von Code bei einem Alarm/Timer ermöglicht
//Das Alarmobjekt, welches bei Ausführung des Alarms/Timers in der Funktion übergeben wird, wird auf den Namen "1min" überprüft
//Wenn der Name übereinstimmt, wird die Funktion alarmfunktion ausgeführt
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "1min") {
	alarmfunktion();
  };
});

//Event Listener über die Notifications OnClicked Chrome API erstellen, welches die Ausführung von Code bei einem Klick auf die Systemnotification ermöglicht
//Die Notification Id, welche bei Ausführung in der Funktion übergeben wird, wird auf den String "notify1" überprüft
//Bei Übereinstimmung wird ein neues Chrome Tab mit der Seite "tabpopup.html" geladen
chrome.notifications.onClicked.addListener(function(notificationId, byUser) {
	if (notificationId === "notify1") {
		chrome.tabs.create({url:"tabpopup.html"});
	};
});