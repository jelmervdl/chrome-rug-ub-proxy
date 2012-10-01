var URL = function(url)
{
	if (url)
		this.parse(url);
}

URL.prototype.pattern = /^(?:(.+?)\:\/\/)?([^\/]+)(\/[^?]+)?(\?.+?)?$/;

URL.prototype.parse = function(url)
{
	var parts = url.match(this.pattern);

	if (!parts)
		throw "Could not parse url: " + url;

	this.protocol = parts[1] || 'http';
	this.hostname = parts[2] || '';
	this.pathname = parts[3] || '/';
	this.search = parts[4] || '';
}

URL.prototype.toString = function()
{
	return this.protocol + '://' + this.hostname + this.pathname + this.search;
}

function checkForValidUrl(tabId, changeInfo, tab)
{
	try {
		var url = new URL(tab.url);
	
		if (url.hostname.indexOf('.proxy-ub.rug.nl') == -1)
			chrome.pageAction.show(tabId);
	} catch(e) {
		console.log(e);
	}
}

function switchToProxy(tab)
{
	var url = new URL(tab.url);
	console.log(url.toString());
	url.hostname += '.proxy-ub.rug.nl';
	console.log(url.toString());
	chrome.tabs.update(tab.id, {url: url.toString()});
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(switchToProxy);
