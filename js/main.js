//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
// ✅ Add GSAP for animation
import gsap from "https://cdn.skypack.dev/gsap@3.12.2";

//Create a Three.JS Scene
const scene = new THREE.Scene();
//create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

//Keep track of the mouse position, so we can make the eye move
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

//Keep the 3D object on a global variable so we can access it later
let object;

//OrbitControls allow the camera to move around the scene
let controls;

//Set which object to render
let objToRender = 'eye2';

//Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

//Load the file
loader.load(
  `./models/${objToRender}/keyboard2.gltf`,
  function(gltf) {
    //If the file is loaded, add it to the scene
    object = gltf.scene;
    object.scale.set(150, 150, 150); // You can tweak this number
    scene.add(object);

    // ✅ Ensure all aboutxxx text meshes have unique materials that support emissive
    object.traverse(child => {
      if (child.isMesh && child.name.startsWith("about")) {
        // Clone material to make it unique per object
        const original = child.material;
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xffffff),
          metalness: 0.2,
          roughness: 0.8,
          emissive: new THREE.Color(0x000000),
          emissiveIntensity: 1
        });
        child.material = mat;
        //child.material = new THREE.MeshBasicMaterial({ color: 0x000 });
      }
      console.log(child.isMesh);
      console.log(child.material);
      if (child.isMesh && child.material) {
        console.log('SLAY')
        child.material.roughness = 0.8;
        child.material.color.multiplyScalar(1.05); // fix pastel washout
      }
    });
  },
  function(xhr) {
    //While it is loading, log the progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function(error) {
    //If there is an error, log it
    console.error(error);
  }
);

//Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); //Alpha: true allows for the transparent background
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

//renderer.toneMapping = THREE.ACESFilmicToneMapping;
//renderer.toneMappingExposure = 0.9;

//Add the renderer to the DOM
//document.getElementById("container3D").appendChild(renderer.domElement);

//renderer.toneMapping = THREE.NoToneMapping;
//renderer.outputEncoding = THREE.sRGBEncoding;
//renderer.toneMapping = THREE.LinearToneMapping;
//renderer.toneMappingExposure = 0.9;
//renderer.toneMapping = THREE.LinearToneMapping;

//Set how far the camera will be from the 3D model
camera.position.z = 500;

// Ambient light for general illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambientLight);

// Directional light to simulate sunlight
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.35);
directionalLight.position.set(100, 200, 400);
scene.add(directionalLight);

// Hemisphere light for subtle sky and ground lighting
const hemisphereLight = new THREE.HemisphereLight(0xffeeb1, 0xf5dfe9, 0.5);
scene.add(hemisphereLight);

// Raycasting setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let hoveredKey = null;
let originalTextEmissive = new THREE.Color(); // stores original

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

window.addEventListener("click", onClick, false);

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  if (!object) {
    console.log("Model not loaded yet.");
    return;
  }

  // Check all descendants
  const allDescendants = [];
  object.traverse((child) => {
    if (child.isMesh) allDescendants.push(child);
  });

  const intersects = raycaster.intersectObjects(allDescendants, true);

  if (intersects.length === 0) {
    console.log("No intersection found");
    return;
  }

  const clickedObj = intersects[0].object;
  console.log("Clicked object:", clickedObj.name);

  // Climb up the parent chain to find 'key-combo'
  let parentKey = clickedObj;
  while (parentKey && !parentKey.name.startsWith("key-combo")) {
    parentKey = parentKey.parent;
  }

  if (parentKey) {
    console.log("Key combo group found:", parentKey.name);

    const originalY = parentKey.position.y;

    gsap.to(parentKey.position, {
      y: originalY - 0.069,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut"
    });
  } else {
    console.log("Clicked object not inside a 'key-combo' group.");
  }
}

// Mousemove hover logic
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (!object) return;

  raycaster.setFromCamera(mouse, camera);

  const intersectables = [];
  object.traverse(child => {
    if (child.isMesh) intersectables.push(child);
  });

  const intersects = raycaster.intersectObjects(intersectables, true);

  if (intersects.length > 0) {
    const hit = intersects[0].object;

    let keyGroup = hit;
    while (keyGroup && !keyGroup.name.startsWith("key-combo")) {
      keyGroup = keyGroup.parent;
    }

    if (keyGroup && keyGroup !== hoveredKey) {
      if (hoveredKey) resetTextGlow(hoveredKey);
      hoveredKey = keyGroup;
      glowTextInGroup(hoveredKey);
    }
  } else {
    if (hoveredKey) {
      resetTextGlow(hoveredKey);
      hoveredKey = null;
    }
  }
});

// Glow & reset functions
function glowTextInGroup(keyGroup) {
  keyGroup.traverse(child => {
    if (child.isMesh && child.name.startsWith("about")) {
      const mat = child.material;
      if (mat && mat.emissive) {
        originalTextEmissive.copy(mat.emissive);
        mat.emissive.setHex(0xffe6cc); // pastel peach
        mat.emissiveIntensity = 0.6;
      }
    }
  });
}

function resetTextGlow(keyGroup) {
  keyGroup.traverse(child => {
    if (child.isMesh && child.name.startsWith("about")) {
      const mat = child.material;
      if (mat && mat.emissive) {
        mat.emissive.copy(originalTextEmissive);
        mat.emissiveIntensity = 1;
      }
    }
  });
}

//Render the scene
function animate() {
  requestAnimationFrame(animate);
  //Here we could add some code to update the scene, adding some automatic movement

  //object.rotation.x = 1.5;
  renderer.render(scene, camera);
}

//Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//add mouse position listener, so we can make the eye move
document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

//Start the 3D rendering
animate();