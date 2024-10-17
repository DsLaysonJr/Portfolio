const observer = new IntersectionObserver((entries) => {
   entries.forEach((entry) => { 
      console.log(entry)
      if (entry.isIntersecting) {
         entry.target.classList.add('show');        
      }
      else {
        entry.target.classList.remove('show');
      }
   });
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));


let preloaderHeight = document.querySelector(".container");
let preloaderHeading = document.querySelector(".loading-heading");
let count = document.querySelector(".count");

window.addEventListener("load", () => {
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
    }
  }, 100);
});


