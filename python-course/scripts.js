// cache the navigation links 
var $navigationLinks = document.querySelectorAll('ul.py-nav > li > a');
// cache (in reversed order) the sections
var $sections = document.getElementsByTagName('section');

// map each section id to their corresponding navigation link
var sectionIdTonavigationLink = {};
for (var i = $sections.length - 1; i >= 0; i--) {
	var id = $sections[i].id;
    var selector = 'ul.py-nav > li > a[href="#' + id + '"]';
	var $link = sectionIdTonavigationLink[id] = document.querySelectorAll(selector) || null;
    if ($link[0]) {
        $link[0].onclick = function(event) {
			event.stopPropagation();
            for (var $id in sectionIdTonavigationLink) {
                if (sectionIdTonavigationLink.hasOwnProperty($id) && sectionIdTonavigationLink[$id][0]) {
                    sectionIdTonavigationLink[$id][0].className = '';
                }
            }
            event.target.className = (event.target.className || '').concat(' py-clicked');
        };
	}
}

// throttle function, enforces a minimum time interval
function throttle(fn, interval) {
	var lastCall, timeoutId;
	return function () {
		var now = new Date().getTime();
		if (lastCall && now < (lastCall + interval) ) {
			// if we are inside the interval we wait
			clearTimeout(timeoutId);
			timeoutId = setTimeout(function () {
				lastCall = now;
				fn.call();
			}, interval - (now - lastCall) );
		} else {
			// otherwise, we directly call the function 
			lastCall = now;
			fn.call();
		}
	};
}

function getOffset( el ) {
	var _x = 0;
	var _y = 0;
	while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
		_x += el.offsetLeft - el.scrollLeft;
		_y += el.offsetTop - el.scrollTop;
		el = el.offsetParent;
	}
	return { top: _y, left: _x };
}

function highlightNavigation() {
	// get the current vertical position of the scroll bar
	var scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

	// iterate the sections
	for (var i = $sections.length-1; i >= 0; i--) {
		var currentSection = $sections[i];
		// get the position of the section
		var sectionTop = getOffset(currentSection).top;
		// get the section id
		var id = currentSection.id;
		// get the corresponding navigation link
		var $navigationLink = sectionIdTonavigationLink[id];

		if (/py-clicked/i.test($navigationLink[0].className || '')) {
            // remove .py-clicked class from anchor link
			$navigationLink[0].className = '';
			// remove .py-active class from all the links
			for (i = 0; i < $navigationLinks.length; i++) {
				$navigationLinks[i].parentNode.className = '';
			}
			// add .py-active class to the clicked link
			$navigationLink[0].parentNode.className += (' py-active');
			// return false to exit the each loop
			return false;
        } else {
			if ((window.innerHeight + scrollPosition) >= document.body.scrollHeight) {
				for (i = 0, l = $navigationLinks.length; i < l; i++) {
					$navigationLinks[i].parentNode.className += (l - 1 === i ? '' : ' py-active');
				}
				// return false to exit the each loop
				return false;
			}
		}
		
		// if the user has scrolled over the top of the section  
		if (scrollPosition >= sectionTop - 190 + 30) {
			// if the link is not active
			if (typeof $navigationLink[0] !== 'undefined') {
				if (!$navigationLink[0].parentNode.classList.contains('py-active')) {
					// remove .py-active class from all the links
					for (i = 0; i < $navigationLinks.length; i++) {
						$navigationLinks[i].parentNode.className = $navigationLinks[i].parentNode.className.replace(/ py-active/, '');
					}
					// add .py-active class to the current link
					$navigationLink[0].parentNode.className += (' py-active');
				}
			} else {
					// remove .py-active class from all the links
					for (i = 0; i < $navigationLinks.length; i++) {
						$navigationLinks[i].parentNode.className = $navigationLinks[i].parentNode.className.replace(/ py-active/, '');
					}
			}
			// we have found our section, so we return false to exit the each loop
			return false;
		}
	}
}

window.addEventListener('scroll', throttle(highlightNavigation, 150));
