document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuButton = document.querySelector(".mobile-menu-button");
  const header = document.querySelector("header");
  const win = window;
  const availableIntersectionObserver = ("IntersectionObserver" in window);
  const mobileMenuLinks = document.querySelector(".mobile-menu-fixed");

  win.onscroll = () => {
    if (win.pageYOffset > 500) {
      header.classList.add("fix-header");
    } else {
      header.classList.remove("fix-header");
    }
  };

  const closeMenu = () => {
    mobileMenuButton.classList.remove("open");
    mobileMenuLinks.classList.remove("show-menu");
    document.removeEventListener("click", listenForPageClicks)
  }

  const listenForPageClicks = (e) => {
    if (!e.target.classList || !e.target.classList.contains("nav-link") && !e.target.classList.contains("show-menu")) {
      closeMenu();
    }
  }

  const doMobileMenu = (e) => {
    e.stopPropagation();
    mobileMenuButton.classList.toggle("open");
    if (mobileMenuButton.classList.contains("open")) {
      mobileMenuLinks.classList.add("show-menu");
      document.addEventListener("click", listenForPageClicks)
      return;
    }
    return closeMenu();
  }

  mobileMenuButton.addEventListener("click", doMobileMenu);


  if (!availableIntersectionObserver) {
    return;
  }

  const thresh = win.innerWidth > 600 ? [0.15, 0.5, 0.65] : [];
  const observerOptions = {
    root: null,
    rootMargin: "-100px",
    threshold: thresh
  };

  const watchedEls = document.querySelectorAll("[data-observing]");

  let pauseActiveLinkSetting = false;
  const setActiveHeaderLink = (linkId) => {
    const previouslyActiveLinks = document.querySelectorAll(".active");
    if (previouslyActiveLinks.length > 0 && (previouslyActiveLinks[0].dataset.linkId === linkId)) {
      return;
    }

    if (previouslyActiveLinks) {
      previouslyActiveLinks.forEach(linkEl => {
        linkEl.classList.remove("active");
      });
    }

    const newActiveLinks = document.querySelectorAll(`[data-link-id="${linkId}"]`);
    newActiveLinks.forEach(linkEl => {
      linkEl.classList.add("active");
    });
  };

  document.querySelectorAll(".nav-link").forEach(navLink => {
    navLink.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = e.target.dataset.linkId;
      const sectionEl = document.querySelector(`#${sectionId}`);

      const innerHeight = window.innerHeight;
      const sectionHeight = sectionEl.offsetHeight;
      let newScrollPosition = sectionEl.offsetTop + 50; // 50 is approx height of header

      // center sections that are smaller than the window height;
      if (sectionHeight < innerHeight) {
        const sectionHeightDifference = (innerHeight - sectionHeight) / 2;
        newScrollPosition = sectionEl.offsetTop - sectionHeightDifference;
      }

      window.scrollTo(0, newScrollPosition);
      document.querySelectorAll(".active").forEach(el => {
        el.classList.remove("active");
      });

      e.target.classList.add("active");
      setActiveHeaderLink(sectionId);
      
      pauseActiveLinkSetting = true; // prevent the intersection observer from flashing active links while scrolling
      setTimeout(() => {
        pauseActiveLinkSetting = false;
      },500);
    });
  });



  const onObservation = (entries, observer) => {
    entries.forEach(entry => {
      const entryTarget = entry.target;
      const sectionId = entryTarget.dataset.sectionId;
      const windowWidth = window.innerWidth;

      if (sectionId && entry.isIntersecting && !pauseActiveLinkSetting) {
        return setActiveHeaderLink(sectionId);
      }

      if (!entry.isIntersecting || sectionId) {
        return;
      }

      const entryClasses = entryTarget.classList;

      if (entryClasses.contains("resolved")) {
        return;
      }
      if (entryClasses.contains("opacity-0")) {
        entry.target.classList.add("opacity-1");
      }
      if (entryClasses.contains("fade-up")) {
        entry.target.classList.add("init-fade-up");
      }
      entry.target.classList.add("resolved");
      if (!sectionId) {
        observer.unobserve(entry.target);
      }
    });
  };
  const observer = new IntersectionObserver(onObservation, observerOptions);
  watchedEls.forEach(el => {
    observer.observe(el);
  });
});
