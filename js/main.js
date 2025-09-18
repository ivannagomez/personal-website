// Add click listeners for keycap images
document.addEventListener('DOMContentLoaded', () => {
  const keycaps = document.querySelectorAll('.keycap');
  keycaps.forEach(keycap => {
    keycap.addEventListener('click', handleKeycapClick);
    // Add touch support for better mobile responsiveness
    keycap.addEventListener('touchend', handleKeycapClick);
  });

  // Add click listeners for keycap wrappers
  const wrappers = document.querySelectorAll('.keycap-wrapper');
  wrappers.forEach(wrapper => {
    wrapper.addEventListener('click', handleKeycapClick);
    // Add touch support for better mobile responsiveness
    wrapper.addEventListener('touchend', handleKeycapClick);
  });

  // Initialize sticky navigation
  initStickyNav();

  // Initialize GSAP scroll animations
  initScrollAnimations();

  // Initialize mobile menu
  initMobileMenu();
});

function initStickyNav() {
  const stickyNav = document.getElementById('stickyNav');
  const landingContainer = document.querySelector('.landing-container');
  const contentContainer = document.querySelector('.content-container');
  const navLinks = document.querySelectorAll('.nav-list a');

  // Add click listeners to nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      showSection(sectionId);
      updateActiveNavLink(sectionId);
    });
  });

  // Scroll listener for showing/hiding nav
  let isInContentArea = false;
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');

  window.addEventListener('scroll', () => {
    const contentRect = contentContainer.getBoundingClientRect();

    // Show nav only when we're actually inside the content container area
    // Check if content container is visible and we've scrolled past its top
    const shouldShowNav = contentRect.top <= 100 && contentRect.bottom > 200;
    const isMobile = window.innerWidth <= 768;

    if (shouldShowNav && !isInContentArea) {
      isInContentArea = true;

      // Only add visible class on desktop
      if (!isMobile) {
        stickyNav.classList.add('visible');
      }

      // Show hamburger button on mobile
      if (mobileMenuToggle) {
        mobileMenuToggle.style.display = isMobile ? 'block' : 'none';
      }
    } else if (!shouldShowNav && isInContentArea) {
      isInContentArea = false;

      // Remove visible class on desktop
      if (!isMobile) {
        stickyNav.classList.remove('visible');
      }

      // Hide hamburger button when scrolling up
      if (mobileMenuToggle) {
        mobileMenuToggle.style.display = 'none';
        // Also close the menu if it's open
        if (isMobile && stickyNav.classList.contains('mobile-open')) {
          mobileMenuToggle.classList.remove('active');
          stickyNav.classList.remove('mobile-open');
        }
      }
    }
  });
}

function updateActiveNavLink(activeSection) {
  const navLinks = document.querySelectorAll('.nav-list a');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === activeSection) {
      link.classList.add('active');
    }
  });
}

function handleKeycapClick(event) {
  // Prevent default behavior and stop propagation
  event.preventDefault();
  event.stopPropagation();

  // Prevent duplicate events from both click and touchend
  if (event.type === 'touchend') {
    // For touch events, prevent the subsequent click event
    event.target.style.pointerEvents = 'none';
    setTimeout(() => {
      event.target.style.pointerEvents = 'auto';
    }, 300);
  }

  // Find the closest wrapper element if clicking on an image inside a wrapper
  const wrapper = event.target.closest('.keycap-wrapper');

  // Use wrapper if found, otherwise use the target itself (for standalone keycaps)
  const element = wrapper || event.target;
  const className = element.className;
  let sectionId = null;

  // Map keycap classes to section IDs
  if (className.includes('top-about')) {
    sectionId = 'about';
  } else if (className.includes('top-projects')) {
    sectionId = 'projects';
  } else if (className.includes('mid-experience')) {
    sectionId = 'experience';
  } else if (className.includes('bottom-contact')) {
    sectionId = 'contact';
  }

  if (sectionId) {
    showSection(sectionId);
  }
}

function showSection(sectionId) {
  // Hide all sections first
  const allSections = document.querySelectorAll('.content-block');
  allSections.forEach(section => {
    section.style.display = 'none';
  });

  // Show the selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'flex';

    // Update active nav link
    updateActiveNavLink(sectionId);

    // Use GSAP for much smoother, slower scrolling
    setTimeout(() => {
      gsap.to(window, {
        duration: 2.5,
        scrollTo: {
          y: targetSection,
          offsetY: 0
        },
        ease: "power2.inOut"
      });
      // Trigger animations for the newly shown section
      animateSection(targetSection);
    }, 100);
  }
}

function initScrollAnimations() {
  // Register ScrollTrigger and ScrollTo plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Parallax effect for landing container
  gsap.to('.landing-container', {
    yPercent: -20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.landing-container',
      start: 'top top',
      end: 'bottom top',
      scrub: 2
    }
  });

  // Animate content blocks on scroll
  const contentBlocks = document.querySelectorAll('.content-block');
  contentBlocks.forEach((block) => {
    // Only animate if block is visible
    if (block.style.display !== 'none') {
      animateSection(block);
    }
  });

  // Scroll-triggered fade for nav
  ScrollTrigger.create({
    trigger: '.content-container',
    start: 'top 80%',
    onEnter: () => {
      gsap.to('.sticky-nav', {
        opacity: 1,
        x: 0,
        duration: 1.0,
        ease: 'power1.out'
      });
    },
    onLeaveBack: () => {
      gsap.to('.sticky-nav', {
        opacity: 0,
        x: -20,
        duration: 0.8,
        ease: 'power1.in'
      });
    }
  });
}

function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const stickyNav = document.getElementById('stickyNav');
  const navLinks = document.querySelectorAll('.nav-list a');

  if (!mobileMenuToggle) return;

  // Ensure hamburger is visible on mobile immediately if in content area
  if (window.innerWidth <= 768) {
    const contentContainer = document.querySelector('.content-container');
    if (contentContainer) {
      const contentRect = contentContainer.getBoundingClientRect();
      const shouldShowNav = contentRect.top <= 100 && contentRect.bottom > 200;
      if (shouldShowNav) {
        mobileMenuToggle.style.display = 'block';
      }
    }
  }

  // Toggle mobile menu
  mobileMenuToggle.addEventListener('click', () => {
    const isOpen = mobileMenuToggle.classList.contains('active');

    if (isOpen) {
      mobileMenuToggle.classList.remove('active');
      stickyNav.classList.remove('mobile-open');
    } else {
      mobileMenuToggle.classList.add('active');
      stickyNav.classList.add('mobile-open');
    }
  });

  // Close menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        mobileMenuToggle.classList.remove('active');
        stickyNav.classList.remove('mobile-open');
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      if (!stickyNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mobileMenuToggle.classList.remove('active');
        stickyNav.classList.remove('mobile-open');
      }
    }
  });

  // Handle resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) {
        // Switching to desktop
        mobileMenuToggle.classList.remove('active');
        stickyNav.classList.remove('mobile-open');
        mobileMenuToggle.style.display = 'none';
      } else {
        // Switching to mobile - ensure menu is closed
        mobileMenuToggle.classList.remove('active');
        stickyNav.classList.remove('mobile-open');
      }
    }, 250);
  });
}

function animateSection(section) {
  // Animate the content block itself
  gsap.to(section, {
    opacity: 1,
    y: 0,
    duration: 1.5,
    ease: 'power1.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 85%',
      once: true
    }
  });

  // Animate title
  const title = section.querySelector('.content-title');
  if (title) {
    gsap.to(title, {
      opacity: 1,
      y: 0,
      duration: 1.8,
      delay: 0.3,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        once: true
      }
    });
  }

  // Animate text blocks with stagger
  const textBlocks = section.querySelectorAll('.content-text-block');
  if (textBlocks.length > 0) {
    gsap.to(textBlocks, {
      opacity: 1,
      y: 0,
      duration: 2,
      delay: 0.6,
      stagger: 0.3,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        once: true
      }
    });
  }
}