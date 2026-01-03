(() => {

	// -------------------------------------------------------------------------
	// 02-Jan-2026: Session storage persists between pages, right?
	// -------------------------------------------------------------------------
	let progress = parseFloat(sessionStorage.getItem('wave-progress')) || 0;
	let scroll = null;
	
	document.documentElement.style.setProperty('--wave-progress', progress);

	window.addEventListener('scroll', () => {

		// ---------------------------------------------------------------------
    	// 02-Jan-2026: Skip first scroll event, e.g. on refresh...
		// ---------------------------------------------------------------------
		if (scroll != null)
		{
			const delta = window.scrollY - scroll;
			progress += delta / 12000.0;

			document.documentElement.style.setProperty('--wave-progress', progress);
			sessionStorage.setItem('wave-progress', progress);
		}

		scroll = window.scrollY;

	});

	// -------------------------------------------------------------------------
	// 02-Jan-2026: Reset scroll when navigating back/forward by the bfcache.
	// -------------------------------------------------------------------------
	window.addEventListener('pageshow', () => {

		scroll = null;

	});

})();