(function () {
	$.fn.exists = function () {
		return this.length !== 0;
	};

	window.hbn = {};

	var classNames = {
		mobile: 'mobile',
		tablet: 'tablet',

		hbnToScroll: 'hbn-to-scroll',
		btnDownScroll: 'btn-down-scroll',
		hbnLines: 'hbn-lines',
		btnMail: 'btn-mail',
		clickable: 'clickable',

		hbnImagesSection: 'hbn-images-section',
		hbnImage: 'hbn-image',
		hbnParallaxImageContainer: 'hbn-parallax-image__container',

		hbnSectionSlide: 'hbn-section-slide',
		hbnRightSideControl: 'hbn-right-side-control',

		noActive: 'no-active',
		active: 'active',
		prev: 'prev'
	};

	var ids = {};

	var buildSelectors = function (selectors, source, characterToPrependWith) {
		$.each(source, function (propertyName, value) {
			selectors[propertyName] = characterToPrependWith + value;
		});
	};

	hbn.buildSelectors = function (classNames, ids) {
		var selectors = {};
		if (classNames) {
			buildSelectors(selectors, classNames, ".");
		}
		if (ids) {
			buildSelectors(selectors, ids, "#");
		}
		return selectors;
	};

	var selectors = hbn.buildSelectors(classNames, ids);

	var isBlockedScroll = false;

	var numberShowingBlock = 0;

	var scrollSections = function (delta, index) {
		var $hbnSectionSlideActive = $([selectors.hbnSectionSlide, selectors.active].join(''));
		var $hbnSectionSlideNext = $hbnSectionSlideActive.next();
		var $hbnSectionSlidePrev = $hbnSectionSlideActive.prev();
		var $hbnSectionSlideNewActive;
		var $hbnLines = $(selectors.hbnLines);
		var $hbnRightSideControl = $(selectors.hbnRightSideControl);
		var $btnMail = $(selectors.btnMail);
		var $liActive;
		var $dataActive;

		if (isBlockedScroll) {
			return;
		}

		if (typeof index == 'undefined') {
			if (delta > 0) {
				numberShowingBlock = numberShowingBlock > 3 ? 4 : numberShowingBlock + 1;
			} else {
				numberShowingBlock = numberShowingBlock > 0 ? numberShowingBlock - 1 : 0;
			}
		}
		else {
			numberShowingBlock = index;
		}

		$dataActive = $('[data-active-id="' + numberShowingBlock + '"]');

		if ($dataActive.hasClass(classNames.active) && (numberShowingBlock + 1 > 4 || numberShowingBlock <= 0)) {
			return;
		}

		if ($hbnSectionSlideNext.exists() && delta > 0) {
			$hbnSectionSlideNext.addClass(classNames.active);
			$hbnSectionSlideActive.removeClass(classNames.active);
		} else if (numberShowingBlock === 0 && $hbnSectionSlidePrev.exists() && delta < 0) {
			$hbnSectionSlidePrev.addClass(classNames.active);
			$hbnSectionSlideActive.removeClass(classNames.active);
		}

		$('[data-active-id]').removeClass(classNames.active);
		$dataActive.addClass(classNames.active);
		$dataActive.prev().addClass(classNames.prev);
		$dataActive.removeClass(classNames.prev);
		$dataActive.next().removeClass(classNames.prev);

		isBlockedScroll = true;

		$liActive = $hbnLines.find('li.active');

		if (!$liActive.exists()) {
			$hbnRightSideControl.addClass(classNames.noActive);
			$btnMail.addClass(classNames.active);
		} else {
			$hbnRightSideControl.removeClass(classNames.noActive);
			$btnMail.removeClass(classNames.active);
		}

		$hbnSectionSlideNewActive = $([selectors.hbnSectionSlide, selectors.active].join(''));

		$hbnSectionSlideNewActive.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
			isBlockedScroll = false;
		});
	};

	$(document).on('click', selectors.btnDownScroll, function (e) {
		if ($(selectors.noActive).exists()) {
			scrollSections(-1);
		} else {
			scrollSections(1);
		}

		e.preventDefault();
		e.stopPropagation();
		return false;
	});

	$(document).on('click', selectors.hbnToScroll, function (e) {
		scrollSections(1);

		e.preventDefault();
		e.stopPropagation();
		return false;
	});


	$(document).on('keydown', function (e) {
		var keyCode = e.keyCode || e.charCode;
		if (keyCode === 40) {
			scrollSections(1);
		}

		if (keyCode === 38) {
			scrollSections(-1);
		}
	});

	var mobileScrollInit = function () {
		var $html = $('html');
		var hammertime = new Hammer(document);
		hammertime.on('panup pandown', function (ev) {
			if ($html.hasClass(classNames.mobile) || $html.hasClass(classNames.tablet)) {
				if (ev.type === 'panup') {
					scrollSections(1);
				}

				if (ev.type === 'pandown') {
					scrollSections(-1);
				}
			}
		});


		if (document.addEventListener) {
			if ('onwheel' in document) {
				// IE9+, FF17+, Ch31+
				document.addEventListener('wheel', onWheel);
			} else if ('onmousewheel' in document) {
				// устаревший вариант события
				document.addEventListener('mousewheel', onWheel);
			} else {
				// Firefox < 17
				document.addEventListener('MozMousePixelScroll', onWheel);
			}
		} else { // IE8-
			document.attachEvent('onmousewheel', onWheel);
		}

		function onWheel(e) {
			e = e || window.event;

			var delta = ((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1;

			if ($html.hasClass(classNames.mobile) || $html.hasClass(classNames.tablet)) {
				return;
			}

			scrollSections(delta);

			e.preventDefault ? e.preventDefault() : (e.returnValue = false);
		}
	};


	var desktopScroll = {
		vars: {
			lethargy: undefined,
			isAnimationEnd: true
		},
		init: function () {
			this.vars.lethargy = this.createInstanceOfLethargy();
			$(document).on('mousewheel DOMMouseScroll wheel MozMousePixelScroll scroll', this.mouseWheelHandler.bind(this));
		},
		mouseWheelHandler: function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (this.vars.isAnimationEnd && this.vars.lethargy.check(e) !== false) {
				this.vars.isAnimationEnd = false;
				if (this.isMouseWhellUp(e)) {
					scrollSections(-1);
				}
				else {
					scrollSections(1);
				}
				setTimeout(function () {
					this.vars.isAnimationEnd = true;
				}.bind(this), 1500)
			}
		},
		isMouseWhellUp: function (e) {
			if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 || e.originalEvent.deltaY < 0) {
				return true
			} else {
				return false
			}
		},
		createInstanceOfLethargy: function (isForce) {
			if (!this.vars.lethargy || typeof isForce !== 'undefined') {
				this.vars.lethargy = new Lethargy();
				//return new Lethargy(7, 100, 0.05);
			}
			return this.vars.lethargy;
		},
	};


	var isMobile = function () {
		var $html = $('html');
		return $html.hasClass(classNames.mobile) || $html.hasClass(classNames.tablet);
	};

	$.fn.imageMove = function() {
		var mouseX = 0;//, limitX = 150-10;

		$(window).mousemove(function(e){
			var offset = $('.hbn-images-section').offset();
			var limitX = $(document).width();
			var centerX = limitX / 2;
			var pageX = e.pageX >= centerX ? (e.pageX /4) : ((e.pageX - centerX) / 2);

			mouseX = (Math.min(pageX - offset.left, limitX) / 2);
		});

		var follower = $(this);
		var xp = 0, yp = 0;
		var loop = setInterval(function(){
			xp += (mouseX - xp) / 20;
			follower.css({left: xp / 10});
		}, 10);
	};

	$(function () {
		var $html = $('html');
		var hammertime = new Hammer(document);
		hammertime.on('panup pandown', function (ev) {
			if ($html.hasClass(classNames.mobile) || $html.hasClass(classNames.tablet)) {
				if (ev.type === 'panup') {
					scrollSections(1);
				}

				if (ev.type === 'pandown') {
					scrollSections(-1);
				}
			}
		});

		if (isMobile()) {
			mobileScrollInit();
		} else {
			desktopScroll.init();
		}
	});

	$(document).on('click', selectors.clickable, function (e) {
		// console.log($(e.currentTarget).data('active-id'));
		scrollSections(1, $(e.currentTarget).data('active-id'));
	});

	$(window).on('load', function(){
		$(selectors.hbnParallaxImageContainer).imageMove();
	});
})();



