var URL = function(url)
{
	if (url)
		this.parse(url);
}

URL.prototype.pattern = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;

URL.prototype.parse = function(url)
{
	var parts = url.match(this.pattern);

	if (!parts)
		throw "Could not parse url: " + url;

	this.protocol = parts[4] || 'http:';
	this.hostname = parts[11] || '';
	this.pathname = (parts[13] + (parts[16] !== undefined ? parts[16] : '')) || '/';
	this.search = parts[18] || '';
}

URL.prototype.toString = function()
{
	return this.protocol + '//' + this.hostname + this.pathname + this.search;
}

function isProxyable(url)
{
	return /^https?:$/.test(url.protocol);
}

function isProxyEnabled(url)
{
	return /\.proxy-ub\.rug\.nl$/.test(url.hostname)
}

function checkForValidUrl(tabId, changeInfo, tab)
{
	try {
		var url = new URL(tab.url);
		
		if (isProxyable(url)) {
			chrome.pageAction.show(tabId);
			chrome.pageAction.setIcon({
				'tabId': tabId,
				'path': isProxyEnabled(url) 
					? {'19': 'logo-19.png', '38': 'logo-38.png'}
					: {'19': 'logo-19-grey.png', '38': 'logo-38-grey.png'}
			});
		}
		else {
			chrome.pageAction.hide(tabId);
		}
	} catch(e) {
		console.error(e);
	}
}

function addProxy(url) {
	if (url.protocol === 'https:')
		url.hostname = url.hostname.replace(/\./g, '-')

	url.hostname += '.proxy-ub.rug.nl';
}

function removeProxy(url) {
	url.hostname = url.hostname.replace(/\.proxy-ub\.rug\.nl$/, '');

	if (url.protocol === 'https:')
		url.hostname = url.hostname.replace(/-/g, '.');
}

function switchToProxy(tab)
{
	var url = new URL(tab.url);

	if (isProxyEnabled(url))
		removeProxy(url);
	else
		addProxy(url);

	chrome.tabs.update(tab.id, {url: url.toString()});
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(switchToProxy);
