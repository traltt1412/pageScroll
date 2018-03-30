export default class pageScroll {
	constructor(el) {
		Element.prototype.hasClass = function(className) {
			return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
		};
		const sections = el.querySelectorAll('section');
		let current;
		let scrollable = true;
		let top = el.scrollTop;
		for (let i = 0; i < sections.length; i++) {
			if (sections[i].offsetTop == top) {
				sections[i].classList.add('active');
			}
		}

		el.addEventListener('scroll', (e) => {
			if (scrollable) {
				// if (e.deltaY > 0) {
				// 	if (current == sections.length - 1) {
				// 		return false;
				// 	}
				// 	current++;
				// 	this.scrollToSectionAnimate(el, sections[current].offsetTop);
				// } else {
				// 	if (current == 0) {
				// 		return false;
				// 	}
				// 	current--;
				// 	this.scrollToSectionAnimate(el, sections[current].offsetTop);
				// }
				let scrollTo = this.checkNearestSection(sections, el.offsetHeight, el.scrollTop);
				if (scrollTo) {
					this.scrollToSectionAnimate(el, scrollTo.offsetTop);
					console.log(el.querySelector('section.active'));
					el.querySelector('section.active').classList.remove('active');
					scrollTo.classList.add('active');
					scrollable = false;
					setTimeout(() => {
						scrollable = true;
					}, 600);
				}
			}
			// e.preventDefault();
		});

		
	}
	scrollToSection(el, top) {
		el.scrollTo(0, top);
	}

	scrollToSectionAnimate(el, scrollTo, scrollDuration = 400) {
		const scrollHeight = el.scrollTop - scrollTo,
			scrollStep = Math.PI / (scrollDuration / 15),
			cosParameter = scrollHeight / 2;
		var scrollCount = 0,
			scrollMargin,
			scrollInterval = setInterval(function () {
				if ((el.scrollTop != scrollTo) && (Math.abs(el.scrollTop - scrollTo) > 10)) {
					scrollCount = scrollCount + 1;
					scrollMargin = cosParameter - cosParameter * Math.cos(scrollCount * scrollStep);
					el.scrollTo(0, (scrollTo + scrollHeight - scrollMargin));
				}
				else {
					el.scrollTo(0, scrollTo);
					clearInterval(scrollInterval);
				}
			}, 15);
	}
	checkNearestSection(sections, vh, scrollTop) {
		for (let i=0;i<sections.length;i++) {
			if (Math.abs(sections[i].offsetTop - scrollTop) < vh && !sections[i].hasClass('active')) {
				return sections[i];
			}
		}
		return false;
	}
}