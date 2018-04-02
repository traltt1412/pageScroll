export default class pageScroll {
	constructor(el) {
		Element.prototype.hasClass = function(className) {
			return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
		};
		const sections = el.querySelectorAll('section');
		let active = 0,
			scrollable = true,
			top = el.scrollTop,
			scrollDuration = 400;
		let init = e => {
			for (let i = 0; i < sections.length; i++) {
				if (sections[i].offsetTop == top) {
					sections[i].classList.add('active');
					active = i;
				}
			}
			el.addEventListener('wheel', (e) => {
				e.preventDefault();
				let deltaY = e.deltaY;
				if (scrollable) {
					let scrollTo = calcScrollTop(deltaY);
					if (scrollTo !== false){
						scrollable = false;
						scrollToSectionAnimate(scrollTo, scrollDuration);
						setTimeout(() => {
							scrollable = true;
						}, 600);
					}else{
						el.scrollTo(0, el.scrollTop + deltaY);
					}
				}
			});
		};
		init();

		let calcScrollTop = deltaY => {
			if(active > 0 && el.scrollTop + deltaY < sections[active].offsetTop){
				active--;
				document.querySelector('section.active').classList.remove('active');
				sections[active].classList.add('active');
				return sections[active].offsetTop + sections[active].offsetHeight - el.offsetHeight;
			}
			if(active < sections.length - 1 && el.scrollTop + deltaY > sections[active].offsetTop + sections[active].offsetHeight - el.offsetHeight){
				active++;
				document.querySelector('section.active').classList.remove('active');
				sections[active].classList.add('active');
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
						el.scrollTo(0, (scrollTo + scrollHeight - scrollMargin));
					}
					else {
						el.scrollTo(0, scrollTo);
						clearInterval(scrollInterval);
					}
				}, 15);
		}	
	}

}