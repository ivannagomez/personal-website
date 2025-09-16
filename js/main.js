// Add click listeners for keycap images
document.addEventListener('DOMContentLoaded', () => {
  const keycaps = document.querySelectorAll('.keycap');
  keycaps.forEach(keycap => {
    keycap.addEventListener('click', handleKeycapClick);
  });

  // Add click listeners for keycap wrappers
  const wrappers = document.querySelectorAll('.keycap-wrapper');
  wrappers.forEach(wrapper => {
    wrapper.addEventListener('click', handleKeycapClick);
  });

  // Initialize sticky navigation
  initStickyNav();

  // Initialize GSAP scroll animations
  initScrollAnimations();
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
  
  window.addEventListener('scroll', () => {
    const contentRect = contentContainer.getBoundingClientRect();
    
    // Show nav only when we're actually inside the content container area
    // Check if content container is visible and we've scrolled past its top
    const shouldShowNav = contentRect.top <= 100 && contentRect.bottom > 200;
    
    if (shouldShowNav && !isInContentArea) {
      isInContentArea = true;
      stickyNav.classList.add('visible');
    } else if (!shouldShowNav && isInContentArea) {
      isInContentArea = false;
      stickyNav.classList.remove('visible');
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

  // Keyboard keys subtle floating animation
  gsap.utils.toArray('.keycap, .keycap-wrapper').forEach((keycap, index) => {
    gsap.to(keycap, {
      y: Math.random() * 6 - 3,
      duration: 6 + Math.random() * 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: index * 0.25
    });
  });

  // Scroll-triggered fade for nav
  ScrollTrigger.create({
    trigger: '.content-container',
    start: 'top 80%',
    onEnter: () => {
      gsap.to('.sticky-nav', {
        opacity: 1,
        x: 0,
        duration: 1.2,
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