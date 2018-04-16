export default class pageScroll {
	constructor(el) {
		Element.prototype.hasClass = function (className) {
			return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
		};
		this.sections = el.children;
		this.active = 0;
		this.scrollable = true;
		this.top = el.scrollTop;
		this.scrollDuration = 400;
		this.touchY;
		let wheelEvent = this.getWheelEvent(el);
		let init = e => {
			for (let i = 0; i < this.sections.length; i++) {
				if (this.sections[i].offsetTop == this.top) {
					this.sections[i].classList.add('active');
					this.active = i;
				}
			}
			el.addEventListener(wheelEvent, (e) => {
				e.preventDefault();
				let deltaY = e.deltaY || -e.wheelDelta;
				if (this.scrollable) {
				let scrollTo = this.calcScrollTop(el, deltaY);
					if (scrollTo !== false) {
					this.scrollable = false;
						this.scrollToSectionAnimate(el, scrollTo, this.scrollDuration);
						setTimeout(() => {
						this.scrollable = true;
						}, 600);
					} else {
						setTimeout(() => {
							el.scrollTop = el.scrollTop + deltaY;
						}, 1);
					}
				}
			});

			el.addEventListener('touchstart', e => {
				this.touchY = e.touches[0].clientY;
			});
			el.addEventListener('touchend', e => {
				let deltaY = -(e.changedTouches[0].clientY -this.touchY);
				if (this.scrollable) {
				let scrollTo = this.calcScrollTop(el, deltaY);
					if (scrollTo !== false) {
					this.scrollable = false;
						this.scrollToSectionAnimate(el, scrollTo, this.scrollDuration);
						setTimeout(() => {
						this.scrollable = true;
						}, 600);
					} else {
						el.scrollTo(0, el.scrollTop + deltaY);
					}
				}
			});
		};
		init();
	}
	
	scrollToSectionAnimate(el, scrollTo, scrollDuration) {
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

	calcScrollTop(el, deltaY) {
		if (this.active > 0 && el.scrollTop + deltaY < this.sections[this.active].offsetTop) {
			el.getElementsByClassName('active')[0].classList.remove('active');
			this.sections[--this.active].classList.add('active');
			return this.sections[this.active].offsetTop + this.sections[this.active].offsetHeight - el.offsetHeight;
		}
		if (this.active < this.sections.length - 1 && el.scrollTop + deltaY > this.sections[this.active].offsetTop + this.sections[this.active].offsetHeight - el.offsetHeight) {
			el.getElementsByClassName('active')[0].classList.remove('active');
			this.sections[++this.active].classList.add('active');
			return this.sections[this.active].offsetTop;
		}
		return false;
	}

	// detect available wheel event
	getWheelEvent(el) {
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
