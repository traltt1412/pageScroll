Element.prototype.hasClass = function (className) {
	return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
};
Element.prototype.pageScroll = function (options) {
	const sections = this.getElementsByTagName('section');
	let active = 0,
		scrollable = true,
		top = this.scrollTop,
		scrollDuration = 400,
		touchY;
	let wheelEvent = getWheelEvent(this);
	// console.log(sections);
	let init = () => {
		for (let i = 0; i < sections.length; i++) {
			if (sections[i].offsetTop == top) {
				sections[i].classList.add('active');
				active = i;
			}
		}
		this.addEventListener(wheelEvent, (e) => {
			e.preventDefault();
			let deltaY = e.deltaY || -e.wheelDelta;
			if(deltaY*deltaY < 100) deltaY *= 100/3;
			if (scrollable) {
				let scrollTo = calcScrollTop(this, deltaY);
				if (scrollTo !== false) {
					scrollable = false;
					scrollToSectionAnimate(this, scrollTo, scrollDuration);
					setTimeout(() => {
						scrollable = true;
					}, 600);
				} else {
					setTimeout(() => {
						this.scrollTop = this.scrollTop + deltaY;
					}, 1);
				}
			}
		});

		this.addEventListener('touchstart', e => {
			touchY = e.touches[0].clientY;
		});
		this.addEventListener('touchend', e => {
			let deltaY = -(e.changedTouches[0].clientY - touchY);
			if (scrollable) {
				let scrollTo = calcScrollTop(this, deltaY);
				if (scrollTo !== false) {
					scrollable = false;
					scrollToSectionAnimate(this, scrollTo, scrollDuration);
					setTimeout(() => {
						scrollable = true;
					}, 600);
				} else {
					this.scrollTo(0, this.scrollTop + deltaY);
				}
			}
		});
	};
	init();

	function calcScrollTop(el, deltaY) {
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

	function scrollToSectionAnimate(el, scrollTo, scrollDuration) {
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
	function getWheelEvent(el) {
		if ('onwheel' in el) {
			// spec event type
			return 'wheel';
		} else if (el.onmousewheel !== undefined) {
			// legacy event type
			return 'mousewheel';
		} else {
			// older Firefox
			return 'DOMMouseScroll';
		}
	}
}
