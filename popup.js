let buttonok = document.getElementById("buttonok");
document.getElementById("zeit").value = "18:00"

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

URLsLaden();