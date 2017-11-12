class URL {
	constructor(url) {
		if (url)
			this.parse(url);
	}
	
	parse(url) {
		const parts = url.match(/^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/);

		if (!parts)
			throw "Could not parse url: " + url;

		this.protocol = parts[4] || 'http:';
		this.hostname = parts[11] || '';
		this.pathname = (parts[13] + (parts[16] !== undefined ? parts[16] : '')) || '/';
		this.search = parts[18] || '';
	}

	toString() {
		return this.protocol + '//' + this.hostname + this.pathname + this.search;
	}
}

function isProxyable(url) {
	return /^https?:$/.test(url.protocol);
}

function isProxyEnabled(url) {
	return /\.proxy-ub\.rug\.nl$/.test(url.hostname)
}

function checkForValidUrl(tabId, changeInfo, tab) {
	try {
		var url = new URL(tab.url);
		
		if (isProxyable(url)) {
			const enabled = isProxyEnabled(url);

			chrome.pageAction.show(tabId);
			chrome.pageAction.setIcon({
				'tabId': tabId,
				'path': enabled
					? {'19': 'logo-19.png', '38': 'logo-38.png'}
					: {'19': 'logo-19-grey.png', '38': 'logo-38-grey.png'}
			});
			chrome.pageAction.setTitle({
				'tabId': tabId,
				'title': enabled
					? 'Disable RUG UB Proxy'
					: 'Enable RUG UB Proxy'
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

function switchToProxy(tab) {
	const url = new URL(tab.url);

	if (isProxyEnabled(url))
		removeProxy(url);
	else
		addProxy(url);

	chrome.tabs.update(tab.id, {url: url.toString()});
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(switchToProxy);
