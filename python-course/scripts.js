(function(w, d) {
	// cache the top navigation bar
	var $topNavigationBar = d.querySelectorAll('.top-navigation');
	// cache the navigation links 
	var $navigationLinks = d.querySelectorAll('ul.py-nav > li > a');
	// cache (in reversed order) the sections
	var $sections = d.getElementsByTagName('section');
	// cache datacamp IDE boxes
	var $ideBoxes = d.querySelectorAll('[data-datacamp-exercise]');

	// iterate all ide boxes pre-pending fullscreen view link button
	for (var i = 0; i < $ideBoxes.length; i++) {
		var $ideFullscreenLnk = d.createElement('a');
		$ideFullscreenLnk.appendChild(d.createTextNode('fullscreen'));
		$ideFullscreenLnk.title = 'fullscreen';
		$ideFullscreenLnk.className = 'py-screenfull';
		$ideFullscreenLnk.onclick = (function(el) {
			return function(event) {
				if (typeof picoModal === 'function') {
					var ed = el.querySelectorAll('[id^="ace-code-editor-"]');
					var id = ed[0].id || '';
					var editor = ace.edit(id);
					var code = editor.getSession().getValue();
					var width = w.innerWidth || d.documentElement.clientWidth || d.body.clientWidth;
					var height = w.innerHeight || d.documentElement.clientHeight || d.body.clientHeight;
					if (!!code && typeof(initAddedDCLightExercises) === 'function') {
						picoModal(
							'<div style="width: ' + Math.floor(width * 0.90) + 'px; padding: 2% 0">' +
							'<div data-datacamp-exercise data-lang="python">' +
							'<code data-type="sample-code">' +
							'</code>' +
							'</div>' +
							'</div>'
						).afterCreate(function(modal) {
							var lines = code.split(/\r\n|\r|\n/);
							for (var j = 0; j < lines.length; j++)
								modal.modalElem().getElementsByTagName("code")[0]
								.appendChild(d.createTextNode(lines[j] + '\n'));
							initAddedDCLightExercises();
							w.scrollTo(w.pageXOffset, w.pageYOffset - 1);
							w.scrollTo(w.pageXOffset, w.pageYOffset + 1);
							//modal.modalElem().getElementsByTagName("code")[0].appendChild(d.createTextNode(code));
						}).show();
					}
				}
			};
		})($ideBoxes[i]);
		var $ideWrapper = d.createElement('div');
		$ideBoxes[i].parentNode.insertBefore($ideWrapper, $ideBoxes[i]);
		$ideWrapper.appendChild($ideBoxes[i]);
		if ($ideWrapper.firstChild)
			$ideWrapper.insertBefore($ideFullscreenLnk, $ideWrapper.firstChild);
		else
			$ideWrapper.appendChild($ideFullscreenLnk);
	}

	// map each section id to their corresponding navigation link
	var sectionIdTonavigationLink = {};
	for (var i = $sections.length - 1; i >= 0; i--) {
		var id = $sections[i].id;
		var selector = 'ul.py-nav > li > a[href="#' + id + '"]';
		var $link = sectionIdTonavigationLink[id] = d.querySelectorAll(selector) || null;
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
		var hasActiveClass = function(node) {
			return -1 < node.parentNode.className.indexOf('py-active');
		};

		var addActiveClass = function(node) {
			node.parentNode.className += ' py-active';
		};

		var removeActiveClass = function(node) {
			node.parentNode.className = node.parentNode.className.replace(/ py-active/, '');
		};
		
		// get the current vertical position of the scroll bar
		var scrollPosition = w.pageYOffset || d.documentElement.scrollTop;

		$topNavigationBar[0].className = 'top-navigation ' + ((scrollPosition !== 0) ? ' slide-up' : ' slide-down');

		// remove (preventively) .py-active class from all the links
		for (var i = 0; i < $navigationLinks.length; i++) {
			removeActiveClass($navigationLinks[i]);
		}

		// iterate the sections
		for (var i = $sections.length - 1; i >= 0; i--) {
			var currentSection = $sections[i];
			// get the position of the section
			var sectionTop = getOffset(currentSection).top;
			// get the section id
			var id = currentSection.id;
			// get the corresponding navigation link
			var $navigationLink = sectionIdTonavigationLink[id];

			if (typeof $navigationLink[0] !== 'undefined' &&
				/py-clicked/i.test($navigationLink[0].className || '')) {
				// remove .py-clicked class from anchor link
				$navigationLink[0].className = '';
				// add .py-active class to the clicked link
				$navigationLink[0].parentNode.className += (' py-active');
				// return false to exit the each loop
				return false;
			} else {
				var j = $navigationLinks.length - 1;
				if ((w.innerHeight + scrollPosition) >= d.body.scrollHeight) {
					addActiveClass($navigationLinks[j]);
					// return false to exit the each loop
					return false;
				} else {
					removeActiveClass($navigationLinks[j]);
				}
			}
					
			// if the user has scrolled over the top of the section  
			if (scrollPosition >= sectionTop - 190 + 30) {
				// if the link is not active
				if (typeof $navigationLink[0] !== 'undefined') {
					if (!$navigationLink[0].parentNode.classList.contains('py-active')) {
						// remove .py-active class from all the links
						for (i = 0; i < $navigationLinks.length; i++) {
							removeActiveClass($navigationLinks[i]);
						}
						// add .py-active class to the current link
						addActiveClass($navigationLink[0]);
					}
				} else {
					// remove .py-active class from all the links
					for (i = 0; i < $navigationLinks.length; i++) {
						removeActiveClass($navigationLinks[i]);
					}
				}
				// we have found our section, so we return false to exit the each loop
				return false;
			}
		}
	}

	w.addEventListener('scroll', throttle(highlightNavigation, 150));
})(window, document);