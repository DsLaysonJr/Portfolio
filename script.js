function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

class SmoothScroll {
  constructor(el) {
    this.el = el;
    this.currentY = 0;
    this.targetY = 0;
    this.maxScrollY = this.el.scrollHeight - window.innerHeight; // Calculate the maximum scroll value dynamically
    this.sidebar = document.querySelector('.sidebar');
    this.setup();
    this.onWindowResize();
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

  smoothScrollToSection(targetId) {
    let targetPosition = 0;

    switch (targetId) {
      case 'Home':
        targetPosition = 0;
        break;
      case 'About':
        targetPosition = 1000;
        break;
      case 'Works':
        targetPosition = 1600;
        break;
      case 'Experiences':
        targetPosition = 2400;
        break;
      default:
        return;
    }

    const startPosition = this.currentY;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const t = Math.min(progress / duration, 1);
      const ease = t * (2 - t);
      this.targetY = startPosition + distance * ease;
      if (progress < duration) {
        requestAnimationFrame(step);
      } else {
        // Ensure the final position is set correctly
        this.targetY = targetPosition;
      }
    };

    requestAnimationFrame(step);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Add screen size warning
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);

  // Preloader
  let preloaderHeight = document.querySelector(".preload");
  let preloaderHeading = document.querySelector(".loading-heading");
  let count = document.querySelector(".count");

  window.addEventListener("load", () => {
    document.body.classList.add('preload-active'); // Add class to prevent scrolling
    document.querySelector('.smooth-scroll').classList.add('preload-active'); // Add class to prevent scrolling

    let num = 0;

    let preloading = setInterval(() => {
      if (num < 100) {
        preloaderHeading.style.transform = `translateY(${0}%)`;
        preloaderHeading.style.transform = `skewY(${0}%)`;
        preloaderHeading.style.transition = "all ease 1.2s";
        num++;
        document.documentElement.style.setProperty("--preloader", num + "%");
        count.textContent = num + "%";
      } else {
        preloaderHeading.style.transform = `translateY(${-100}%)`;
        preloaderHeading.style.transition = "all ease 1s";
        preloaderHeight.style.height = "0";
        preloaderHeight.style.transition = "all  2s cubic-bezier(1,0,0,1) ";
        preloaderHeight.style.transitionDelay = "0.8s";
        count.style.opacity = "0";
        count.style.transition = "all ease 1s";

        clearInterval(preloading);
        document.body.classList.remove('preload-active'); // Remove class to allow scrolling
        document.querySelector('.smooth-scroll').classList.remove('preload-active'); // Remove class to allow scrolling

        // Initialize SmoothScroll and event listeners after preloader is finished
        const smoothScroll = new SmoothScroll(document.querySelector('.smooth-scroll'));
        smoothScroll.setup();
        smoothScroll.onWindowResize();

        document.querySelectorAll('.sidebar__link, .right_section a').forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.querySelector('span, .link_text').textContent.trim();
            smoothScroll.smoothScrollToSection(targetId);
          });
        });
      }
    }, 100);
  });

  // Disable scrolling during preloader phase
  window.addEventListener('scroll', (e) => {
    if (document.body.classList.contains('preload-active')) {
      e.preventDefault();
      window.scrollTo(0, 0);
    }
  });

  // Navbar hover effect
  const navLinks = document.querySelectorAll('.right_section a');

  navLinks.forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      link.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      link.style.transition = 'transform 0.1s ease'; // Smooth transition while moving
    });

    link.addEventListener('mouseleave', () => {
      link.style.transform = 'translate(0, 0)';
      link.style.transition = 'transform 0.5s ease'; // Smooth transition back to original place
    });
  });

  // Logo hover effect
  const logo = document.querySelector('.logo');
  const logoText = document.querySelector('.logo-text');

  logo.addEventListener('mousemove', (e) => {
    const rect = logo.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    logo.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    logo.style.transition = 'transform 0.1s ease'; // Smooth transition while moving
    logoText.style.transform = `translate(${10 + x * 0.1}px, -50%)`; // Move the text with the logo
  });

  logo.addEventListener('mouseleave', () => {
    logo.style.transform = 'translate(0, 0)';
    logo.style.transition = 'transform 0.5s ease'; // Smooth transition back to original place
    logoText.style.transform = 'translate(10px, -50%)'; // Reset the text position
  });

  logoText.addEventListener('mousemove', (e) => {
    e.stopPropagation(); // Prevent the hover effect on the text itself
  });

  // Make the logo clickable to reload the page
  const logoLink = document.querySelector('.logo-link');
  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.reload();
  });
});

function checkScreenSize() {
  const warning = document.getElementById('screen-warning');
  if (window.innerWidth < 1280) {
    if (!warning) {
      const warningDiv = document.createElement('div');
      warningDiv.id = 'screen-warning';
      warningDiv.style.position = 'fixed';
      warningDiv.style.top = '0';
      warningDiv.style.left = '0';
      warningDiv.style.width = '100%';
      warningDiv.style.height = '100%';
      warningDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      warningDiv.style.color = 'white';
      warningDiv.style.display = 'flex';
      warningDiv.style.flexDirection = 'column';
      warningDiv.style.justifyContent = 'center';
      warningDiv.style.alignItems = 'center';
      warningDiv.style.zIndex = '1000';
      warningDiv.innerHTML = `
        <h1>Oops! Your screen is a bit small</h1>
        <p>For the best experience, try using a larger screen or adjusting your window size.</p>
      `;
      document.body.appendChild(warningDiv);
    }
  } else {
    if (warning) {
      warning.remove();
    }
  }
}

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    } else {
      entry.target.classList.remove('show');
    }
  });
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));



