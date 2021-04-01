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

async function getFromStorage(key) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get(key, result => {
                resolve(result)
            });
        } catch (e) { reject("Fehler beim Lesen aus dem Storage: " + e); }
    })
}
 
async function setToStorage(key, value) {
    return new Promise((resolve, reject) => {
        try {
            let obj = {};
            obj[key] = value;
            chrome.storage.sync.set(obj, resolve);
        } catch (e) { reject("Fehler beim Schreiben in den Storage: " + e); }
    })
}
 
async function clearStorage() {
    return new Promise((resolve, reject) => {
        try { chrome.storage.sync.clear(resolve); } catch (e) { reject("Fehler beim Leeren des Storage: " + e); }
    })
}
 
async function searchChromeHistory(searchObj) {
    return new Promise((resolve, reject) => {
        try {
            chrome.history.search(searchObj, data => resolve(data));
        } catch (e) { reject("Fehler beim Lesen der History: " + e); }
    })
}

async function loadUrlVisits(url){
		let visitItems = await searchChromeHistory({text: url, startTime: 0, maxResults: 1});
		await processVisits(url, visitItems);
}

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

chrome.alarms.create("1min", {
  periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "1min") {
	alarmfunktion();
  };
});

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

chrome.notifications.onClicked.addListener(function(notificationId, byUser) {
	if (notificationId === "notify1") {
		chrome.tabs.create({url:"tabpopup.html"});
	};
});