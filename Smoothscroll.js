function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

class SmoothScroll {
  constructor(el) {
    this.el = el;
    console.log(el);
    this.currentY = 0;
    this.targetY = 0;
    this.maxScrollY = this.el.scrollHeight - window.innerHeight; // Calculate the maximum scroll value dynamically
    this.sidebar = document.querySelector('.sidebar');
    this.animate();
  }

  setup() {
    document.body.style.height = `${this.el.scrollHeight}px`;
    window.addEventListener('scroll', this.onScroll.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: false }); // Prevent default scroll behavior
  }

  onScroll() {
    window.scrollTo(0, 0); // Keep the body scroll position at the top
  }

  onWheel(e) {
    e.preventDefault(); // Prevent default scroll behavior
    this.targetY += e.deltaY;
    this.targetY = Math.min(Math.max(this.targetY, 0), this.maxScrollY); // Limit the targetY value
  }

  onWindowResize() {
    window.addEventListener('resize', () => {
      this.maxScrollY = this.el.scrollHeight - window.innerHeight; // Recalculate the maximum scroll value on resize
      document.body.style.height = `${this.el.scrollHeight}px`;
    });
  }

  animate() {
    this.currentY = lerp(this.currentY, this.targetY, 0.075);
    this.currentY = Math.min(Math.max(this.currentY, 0), this.maxScrollY); // Limit the translate3d value
    this.el.style.transform = `translate3d(0, -${this.currentY}px, 0)`;

    // Show or hide the sidebar based on scroll position
    if (this.currentY >= 100) {
      this.sidebar.classList.add('show');
    } else {
      this.sidebar.classList.remove('show');
    }

    // Ensure the sidebar follows the screen
    this.sidebar.style.transform = `translateY(${this.currentY}px)`;

    // Parallax effect
    const parallax = document.querySelector('.parallax .bg');
    if (parallax) {
      parallax.style.transform = `translateY(${this.currentY * 0.3}px)`; // Adjust the speed here
    }

    requestAnimationFrame(this.animate.bind(this));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const smoothScroll = new SmoothScroll(document.querySelector('.smooth-scroll'));

  window.addEventListener('load', () => {
    setTimeout(() => {
      smoothScroll.setup();
      smoothScroll.onWindowResize();
    }, 13000); // Delay to ensure preloader is finished
  });
});
