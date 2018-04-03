export default class pageScroll {
	constructor(el) {
		Element.prototype.hasClass = function (className) {
			return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
		};

		const sections = el.querySelectorAll('section');
		let active = 0,
			scrollable = true,
			top = el.scrollTop,
			scrollDuration = 400,
			touchY;
		let init = e => {
			for (let i = 0; i < sections.length; i++) {
				if (sections[i].offsetTop == top) {
					sections[i].classList.add('active');
					active = i;
				}
			}
			el.addEventListener(wheelEvent, (e) => {
				e.preventDefault();
				let deltaY = e.deltaY || -e.wheelDelta;
				console.log(deltaY);
				if (scrollable) {
					let scrollTo = calcScrollTop(deltaY);
					if (scrollTo !== false) {
						scrollable = false;
						scrollToSectionAnimate(scrollTo, scrollDuration);
						setTimeout(() => {
							scrollable = true;
						}, 600);
					} else {
						setTimeout(() => {
							el.scrollTop = el.scrollTop + deltaY;
						},1);
					}
				}
			});

			el.addEventListener('touchstart', e => {
				touchY = e.touches[0].clientY;
			});
			el.addEventListener('touchend', e => {
				let deltaY = -(e.changedTouches[0].clientY - touchY);
				if (scrollable) {
					let scrollTo = calcScrollTop(deltaY);
					if (scrollTo !== false) {
						scrollable = false;
						scrollToSectionAnimate(scrollTo, scrollDuration);
						setTimeout(() => {
							scrollable = true;
						}, 600);
					} else {
						el.scrollTo(0, el.scrollTop + deltaY);
					}
				}
			});
		};
		init();

		let calcScrollTop = deltaY => {
			if (active > 0 && el.scrollTop + deltaY < sections[active].offsetTop) {
				el.getElementsByClassName('active')[0].classList.remove('active');
				sections[--active].classList.add('active');
				return sections[active].offsetTop + sections[active].offsetHeight - el.offsetHeight;
			}
			if (active < sections.length - 1 && el.scrollTop + deltaY > sections[active].offsetTop + sections[active].offsetHeight - el.offsetHeight) {
				el.getElementsByClassName('active')[0].classList.remove('active');
				sections[++active].classList.add('active');
				return sections[active].offsetTop;
			}
			return false;
		}

		let scrollToSectionAnimate = (scrollTo, scrollDuration) => {
			const scrollHeight = el.scrollTop - scrollTo,
				scrollStep = Math.PI / (scrollDuration / 15),
				cosParameter = scrollHeight / 2;
			var scrollCount = 0,
				scrollMargin,
				scrollInterval = setInterval(function () {
					if ((el.scrollTop != scrollTo) && (Math.abs(el.scrollTop - scrollTo) > 10)) {
						scrollCount = scrollCount + 1;
						scrollMargin = cosParameter - cosParameter * Math.cos(scrollCount * scrollStep);
						el.scrollTop = scrollTo + scrollHeight - scrollMargin;
					}
					else {
						el.scrollTop = scrollTo;
						clearInterval(scrollInterval);
					}
				}, 15);
		}

		// detect available wheel event
		let wheelEvent = () => {
			if ('onwheel' in el) {
				// spec event type
				wheelEvent = 'wheel';
			} else if (el.onmousewheel !== undefined) {
				// legacy event type
				wheelEvent = 'mousewheel';
			} else {
				// older Firefox
				wheelEvent = 'DOMMouseScroll';
			}
			return wheelEvent;
		}
	}

}