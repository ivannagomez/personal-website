// Add click listeners for keycap images
document.addEventListener('DOMContentLoaded', () => {
  const keycaps = document.querySelectorAll('.keycap');
  keycaps.forEach(keycap => {
    keycap.addEventListener('click', handleKeycapClick);
  });

  // Initialize sticky navigation
  initStickyNav();
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
  const className = event.target.className;
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
    
    // Smooth scroll to the section
    setTimeout(() => {
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }
}