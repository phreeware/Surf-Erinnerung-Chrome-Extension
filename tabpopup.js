let buttonalle = document.getElementById("allelinks");

async function getFromStorage(key) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.sync.get(key, result => {
                resolve(result)
            });
        } catch (e) { reject("Fehler beim Lesen aus dem Storage: " + e); }
    })
}

const LinkKorrektur = link => {
    return link.startsWith("http://") || link.startsWith("https://") ?
      link
      : `http://${link}`;
};

async function URLsAusgeben() {
	let ua = (await getFromStorage("urlalarm")).urlalarm;
	ua.forEach(element => {
		document.getElementById("auflistung").innerHTML 
		+= `<td><a href="` + LinkKorrektur(element) + `" target="_blank">${element}</td>`;
	});
	console.log("Urls augegeben");
}

buttonalle.onclick = function() {
	let links = document.querySelectorAll("a");
	console.log(links);
	for (let i=0; i<links.length; i++){
		window.open(links[i].href);
	};
};

URLsAusgeben();