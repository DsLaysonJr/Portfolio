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
    
    // Add touch support for mobile devices
    let touchStartY = 0;
    let touchEndY = 0;
    
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    window.addEventListener('touchmove', (e) => {
      e.preventDefault();
      touchEndY = e.touches[0].clientY;
      const deltaY = (touchStartY - touchEndY) * 2; // Multiply for more sensitivity
      this.targetY += deltaY;
      this.targetY = Math.min(Math.max(this.targetY, 0), this.maxScrollY);
      touchStartY = touchEndY;
    }, { passive: false });
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

    // Show or hide the sidebar based on scroll position and screen size
    // Only show sidebar if not in preloader and on mobile screens
    if (this.currentY >= 100 && window.innerWidth < 992 && !document.body.classList.contains('preload-active')) {
      this.sidebar.classList.add('show');
    } else if (window.innerWidth >= 992) {
      this.sidebar.classList.remove('show');
    } else {
      this.sidebar.classList.remove('show');
    }

    // Ensure the sidebar follows the screen
    this.sidebar.style.transform = `translateY(${this.currentY}px)`;

    // Parallax effect with enhanced scaling for mobile
    const parallax = document.querySelector('.parallax .bg');
    if (parallax) {
      parallax.style.transform = `translate(-50%, -50%) translateY(${this.currentY * 0.3}px)`;
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
  // Add screen size warning - updated threshold for better mobile experience
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
        
        // Remove preloader classes to allow sidebar to show
        setTimeout(() => {
          document.body.classList.remove('preload-active');
          document.querySelector('.smooth-scroll').classList.remove('preload-active');
        }, 2800); // Wait for preloader animation to complete

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

  // Navbar hover effect - only on desktop
  if (window.innerWidth >= 992) {
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

    // Logo hover effect - only on desktop
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
  }

  // Make the logo clickable to reload the page
  const logoLink = document.querySelector('.logo-link');
  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.reload();
  });
});

function checkScreenSize() {
  const warning = document.getElementById('screen-warning');
  // Removed the screen size warning as we're now making it responsive
  if (warning) {
    warning.remove();
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

// Handle orientation changes on mobile
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    window.location.reload();
  }, 500);
});

// Optimize performance for mobile devices
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  // Reduce animation complexity on mobile
  document.documentElement.style.setProperty('--animation-duration', '0.5s');
  
  // Disable parallax on mobile for better performance
  const parallaxElements = document.querySelectorAll('.parallax');
  parallaxElements.forEach(el => {
    el.style.transform = 'none';
  });
}

// Update TagCloud settings for responsive design
window.addEventListener('resize', () => {
  const sphere = document.querySelector('.Sphere');
  if (sphere && window.TagCloud) {
    // Adjust TagCloud radius based on screen size
    let radius = 325;
    if (window.innerWidth < 576) {
      radius = 150;
    } else if (window.innerWidth < 768) {
      radius = 200;
    } else if (window.innerWidth < 992) {
      radius = 250;
    }
    
    // Recreate TagCloud with new settings
    const texts = [
      'HTML', 'CSS', 'JAVASCRIPT',
      'PHOTOSHOP', 'AFTER EFFECTS', 'CANVA',
      'FIGMA', 'FILMORA',
      'C', 'C++', 'JAVA',
      'VISUAL BASIC', 'PHP', 'MYSQL', 'NOTION'
    ];
    
    sphere.innerHTML = '';
    TagCloud('.Sphere', texts, {
      radius: radius,
      maxSpeed: 'normal',
      initSpeed: 'fast',
      direction: 135,
      keep: true
    });
    
    sphere.style.color = '#FF5733';
  }
});