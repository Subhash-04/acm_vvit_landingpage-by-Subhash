// Preloader
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    setTimeout(function() {
        preloader.classList.add('hidden');
    }, 1500);
});

// Mobile Menu Toggle
const mobileMenu = document.querySelector('.mobile-menu');
const mobileNav = document.querySelector('.mobile-nav');
const closeMenu = document.querySelector('.close-menu');
const overlay = document.querySelector('.overlay');
const navLinks = document.querySelectorAll('.mobile-nav a');

mobileMenu.addEventListener('click', () => {
    mobileNav.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeMenu.addEventListener('click', () => {
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

overlay.addEventListener('click', () => {
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Fade-in Animation on Scroll
const fadeElems = document.querySelectorAll('.fade-in');

const fadeInOnScroll = () => {
    fadeElems.forEach(elem => {
        const elementTop = elem.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            elem.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', fadeInOnScroll);
window.addEventListener('load', fadeInOnScroll);

// ThreeJS Animation
const canvasContainer = document.getElementById('canvas-container');

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Enhanced renderer with post-processing capability
const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

// Add ambient light for overall scene brightness
const ambientLight = new THREE.AmbientLight(0x111122, 1);
scene.add(ambientLight);

// Add directional light for subtle shadows and highlights
const directionalLight = new THREE.DirectionalLight(0x4682B4, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Add a point light to make the logo pop
const pointLight = new THREE.PointLight(0x00AAFF, 1, 100);
pointLight.position.set(0, 0, 20);
scene.add(pointLight);

// Create a glow effect for the circle
const createGlow = (radius, color, intensity) => {
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(color) },
            viewVector: { value: camera.position }
        },
        vertexShader: `
            uniform vec3 viewVector;
            varying float intensity;
            void main() {
                vec3 vNormal = normalize(normalMatrix * normal);
                vec3 vNormel = normalize(normalMatrix * viewVector);
                intensity = pow(0.9 - dot(vNormal, vNormel), 1.5);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying float intensity;
            void main() {
                vec3 glow = color * intensity * ${intensity};
                gl_FragColor = vec4(glow, 1.0);
            }
        `,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    const glowGeometry = new THREE.TorusGeometry(radius, radius * 0.08, 16, 100);
    return new THREE.Mesh(glowGeometry, glowMaterial);
};

// Create the glowing blue circle
const createGlowingCircle = () => {
    const group = new THREE.Group();
    
    // Main neon circle
    const circleGeometry = new THREE.TorusGeometry(12, 0.2, 16, 100); // Reduced size from 15 to 12
    const circleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00AAFF,
        transparent: true,
        opacity: 0.9
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    group.add(circle);
    
    // Inner glow effect
    const innerGlow = createGlow(12, 0x00AAFF, 1.8); // Reduced size
    group.add(innerGlow);
    
    // Outer glow effect
    const outerGlow = createGlow(12.5, 0x00AAFF, 1.2); // Reduced size
    group.add(outerGlow);
    
    // Small particle system around the circle
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100; // Reduced from 200
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 12 + (Math.random() - 0.5) * 3; // Reduced size
        posArray[i * 3] = Math.cos(angle) * radius;
        posArray[i * 3 + 1] = Math.sin(angle) * radius;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.15, // Reduced size from 0.2
        color: 0x00AAFF,
        transparent: true,
        opacity: 0.7 // Reduced opacity from 0.8
    });
    
    const particles = new THREE.Points(particlesGeometry, particleMaterial);
    group.add(particles);
    
    // Position the entire group (moved to left side)
    group.position.set(-20, 0, -15); // Adjusted position for better visibility
    group.rotation.x = 0.1;
    
    return group;
};

// Create ACM logo using the actual logo image and making it dark circular background
const createACMLogo = () => {
    const group = new THREE.Group();
    
    // Load the actual logo image as a texture
    const textureLoader = new THREE.TextureLoader();
    
    // Create a double-sided plane for the logo but with a circular frame
    const createLogoPlane = (texture) => {
        // Create a canvas to manipulate the texture
        const canvas = document.createElement('canvas');
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw the loaded texture to canvas
        ctx.drawImage(texture.image, 0, 0, size, size);
        
        // Get the image data
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        // Replace white/light background with dark color (navy blue)
        for (let i = 0; i < data.length; i += 4) {
            // Check if pixel is white or very light (threshold can be adjusted)
            if (data[i] > 200 && data[i+1] > 200 && data[i+2] > 200) {
                // Set to dark navy blue
                data[i] = 15;     // R
                data[i+1] = 15;   // G
                data[i+2] = 40;   // B
                // Keep the original alpha
            }
        }
        
        // Put the modified image data back
        ctx.putImageData(imageData, 0, 0);
        
        // Create new texture from canvas
        const modifiedTexture = new THREE.CanvasTexture(canvas);
        
        // Create material with the modified texture
        const material = new THREE.MeshBasicMaterial({
            map: modifiedTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        // Create a circular plane for the logo
        const geometry = new THREE.CircleGeometry(6, 64);
        return new THREE.Mesh(geometry, material);
    };
    
    // Load the logo texture and process it when loaded
    textureLoader.load('acm logo.jpeg', (texture) => {
        const logoPlane = createLogoPlane(texture);
        group.add(logoPlane);
        
        // Add a circular shadow plane behind the logo for depth
        const shadowGeometry = new THREE.CircleGeometry(6.5, 64);
        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadow.position.z = -0.5;
        group.add(shadow);
        
        // Add a blue glow effect around the logo (circular)
        const glowGeometry = new THREE.CircleGeometry(7, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00AAFF,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.z = -0.3;
        group.add(glow);
    });
    
    // Create additional 3D elements to enhance the logo
    
    // Add decorative frame around the logo area (circular)
    const frameGeometry = new THREE.TorusGeometry(7, 0.15, 16, 64);
    const frameMaterial = new THREE.MeshBasicMaterial({
        color: 0x00AAFF,
        transparent: true,
        opacity: 0.6 // Reduced opacity from 0.7
    });
    
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.rotation.x = Math.PI / 2;
    group.add(frame);
    
    // Add an outer ring to emphasize the circular shape
    const outerRingGeometry = new THREE.TorusGeometry(8, 0.08, 16, 64);
    const outerRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x41B6E6,
        transparent: true,
        opacity: 0.4 // Reduced opacity from 0.5
    });
    
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
    outerRing.rotation.x = Math.PI / 2;
    group.add(outerRing);
    
    // Add small accent dots around the logo
    const addAccentDot = (angle) => {
        const dotGeometry = new THREE.SphereGeometry(0.2, 12, 12);
        const dotMaterial = new THREE.MeshPhongMaterial({
            color: 0x0072CE,
            transparent: true,
            opacity: 0.9,
            emissive: 0x0072CE,
            emissiveIntensity: 0.3
        });
        
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        const radius = 9; // Reduced from 14
        dot.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0.5
        );
        group.add(dot);
        return dot;
    };
    
    // Add accent dots evenly around the circle
    const dots = [];
    const numDots = 6; // Reduced from 8 
    for (let i = 0; i < numDots; i++) {
        const angle = (i / numDots) * Math.PI * 2;
        dots.push(addAccentDot(angle));
    }
    
    // Add particle effect around the logo for more visual interest
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 50; // Reduced from 80
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        // Create a circular distribution of particles around the logo
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 5; // Reduced from 7+8 to 5+5
        posArray[i * 3] = Math.cos(angle) * radius;
        posArray[i * 3 + 1] = Math.sin(angle) * radius;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 3; // Reduced from 5 to 3
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.15, // Reduced from 0.25
        color: 0x41B6E6,
        transparent: true,
        opacity: 0.7 // Reduced from 0.8
    });
    
    const particles = new THREE.Points(particlesGeometry, particleMaterial);
    group.add(particles);
    
    // Position the group in the center of the scene
    group.position.set(10, 5, 10);
    
    return group;
};

// Create particles for the background (reduced)
const createParticleSystem = () => {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000; // Reduced from 2000
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 80; // Reduced spread from 100 to 80
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08, // Reduced from 0.1
        color: 0x4682B4,
        transparent: true,
        opacity: 0.6, // Reduced from 0.7
        sizeAttenuation: true
    });
    
    return new THREE.Points(particlesGeometry, particlesMaterial);
};

// Create tech lines connecting random points (reduced)
const createTechLines = (count) => {
    const group = new THREE.Group();
    
    for (let i = 0; i < count; i++) {
        const lineGeometry = new THREE.BufferGeometry();
        const points = [];
        
        // Random starting point
        const startPoint = new THREE.Vector3(
            (Math.random() - 0.5) * 70, // Reduced from 80
            (Math.random() - 0.5) * 70, // Reduced from 80
            (Math.random() - 0.5) * 70  // Reduced from 80
        );
        
        // Generate a path with multiple segments
        points.push(startPoint);
        
        // Add 2-3 connected points
        const segments = Math.floor(Math.random() * 2) + 2; // Reduced max segments from 3 to 2
        let currentPoint = startPoint.clone();
        
        for (let j = 0; j < segments; j++) {
            // Create a path that flows outward from the center
            const direction = currentPoint.clone().normalize();
            const randomOffset = new THREE.Vector3(
                (Math.random() - 0.5) * 10, // Reduced from 15
                (Math.random() - 0.5) * 10, // Reduced from 15
                (Math.random() - 0.5) * 10  // Reduced from 15
            );
            
            currentPoint = currentPoint.clone().add(randomOffset);
            points.push(currentPoint);
        }
        
        lineGeometry.setFromPoints(points);
        
        // Use different colors for variety
        const colors = [0x0066AA, 0x0088CC, 0x00AAFF];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const lineMaterial = new THREE.LineBasicMaterial({
            color: randomColor,
            transparent: true,
            opacity: 0.25 + Math.random() * 0.25, // Reduced from 0.3+0.3
            linewidth: 1
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        group.add(line);
    }
    
    return group;
};

// Create a digital grid floor (reduced)
const createGrid = () => {
    const gridSize = 80; // Reduced from 100
    const gridDivisions = 16; // Reduced from 20
    const gridMaterial = new THREE.LineBasicMaterial({ 
        color: 0x0066AA,
        transparent: true,
        opacity: 0.1 // Reduced from 0.15
    });
    
    const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x0066AA, 0x003366);
    grid.material = gridMaterial;
    grid.position.y = -15;
    grid.rotation.x = Math.PI / 2;
    
    return grid;
};

// Create a secondary glow circle (reduced)
const createSecondaryCircle = () => {
    const geometry = new THREE.TorusGeometry(10, 0.15, 16, 100); // Reduced from 12/0.2 to 10/0.15
    const material = new THREE.MeshBasicMaterial({
        color: 0x00AAFF,
        transparent: true,
        opacity: 0.6 // Reduced from 0.7
    });
    
    const circle = new THREE.Mesh(geometry, material);
    
    // Add partial arc effect as seen in the screenshot
    const arcGeometry = new THREE.TorusGeometry(10, 0.2, 16, 100, Math.PI * 0.75);
    const arcMaterial = new THREE.MeshBasicMaterial({
        color: 0x00AAFF,
        transparent: true,
        opacity: 0.8 // Reduced from 0.9
    });
    
    const arc = new THREE.Mesh(arcGeometry, arcMaterial);
    arc.rotation.z = Math.PI / 2;
    
    const group = new THREE.Group();
    group.add(circle);
    group.add(arc);
    group.position.set(20, 0, -15); // Reduced from 25 to 20
    group.rotation.x = Math.PI / 6;
    
    return group;
};

// Add fog to the scene for depth
scene.fog = new THREE.FogExp2(0x0A0A1A, 0.010); // Increased fog density from 0.008 to 0.010

// Create and add all scene elements
const particlesMesh = createParticleSystem();
const glowingCircle = createGlowingCircle();
const acmLogo = createACMLogo();
const techLines = createTechLines(25); // Reduced from 35
const grid = createGrid();
const secondaryCircle = createSecondaryCircle();

scene.add(particlesMesh);
scene.add(glowingCircle);
scene.add(acmLogo);
scene.add(secondaryCircle);
scene.add(techLines);
scene.add(grid);

// Add some abstract spheres in the background for depth (reduced)
const spheres = [];
for (let i = 0; i < 5; i++) { // Reduced from 8 to 5
    const geometry = new THREE.SphereGeometry(Math.random() * 2 + 0.5, 12, 12); // Reduced size from 3+1 to 2+0.5 and lower geometry detail
    const material = new THREE.MeshStandardMaterial({
        color: 0x0A0A1A,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.6 // Reduced from 0.7
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(
        (Math.random() - 0.5) * 50, // Reduced from 60
        (Math.random() - 0.5) * 30, // Reduced from 40
        (Math.random() - 0.5) * 20 - 20 // Reduced from 30-20
    );
    
    // Add subtle blue highlight to some spheres
    if (Math.random() > 0.5) {
        const glowGeometry = new THREE.SphereGeometry(sphere.geometry.parameters.radius * 1.2, 12, 12);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x0066AA,
            transparent: true,
            opacity: 0.15, // Reduced from 0.2
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        sphere.add(glow);
    }
    
    spheres.push(sphere);
    scene.add(sphere);
}

// Function to animate the logo in a more 3D and prominent way
const animateLogo = (logo, time) => {
    // Gentle floating animation
    logo.position.y = 5 + Math.sin(time * 0.4) * 0.8; // Reduced from 0.5*1.2 to 0.4*0.8
    
    // Slow rotation for 3D effect - reduced
    logo.rotation.y = Math.sin(time * 0.2) * 0.1; // Reduced from 0.3*0.15 to 0.2*0.1
    logo.rotation.x = Math.sin(time * 0.15) * 0.05; // Reduced from 0.2*0.08 to 0.15*0.05
    
    // Animate the frame with a different rotation
    if (logo.children.length > 3) { // Check if frame exists
        logo.children[3].rotation.z = time * 0.15; // Reduced from 0.2 to 0.15
    }
    
    // Animate outer ring if it exists
    if (logo.children.length > 4) {
        logo.children[4].rotation.z = -time * 0.1; // Reduced from 0.15 to 0.1
    }
    
    // Animate particles
    if (logo.children.length > 10) { // Adjusted for fewer dots
        const particles = logo.children[logo.children.length - 1];
        particles.rotation.z = time * 0.03; // Reduced from 0.05 to 0.03
    }
    
    // Animate accent dots if they exist
    for (let i = 5; i < 11; i++) { // Adjusted for 6 dots instead of 8
        if (logo.children.length > i) {
            // Make dots pulse
            const scale = 1 + 0.2 * Math.sin(time * 1.5 + i); // Reduced from 0.3*2 to 0.2*1.5
            logo.children[i].scale.set(scale, scale, scale);
            
            // Make dots move slightly in and out
            const dot = logo.children[i];
            const baseRadius = 9; // Reduced from 14
            const angle = (i - 5) / 6 * Math.PI * 2; // Adjusted for 6 dots
            const radiusOffset = Math.sin(time * 1.2 + i * 0.6) * 0.3; // Reduced from 1.5*0.7*0.5 to 1.2*0.6*0.3
            
            dot.position.x = Math.cos(angle) * (baseRadius + radiusOffset);
            dot.position.y = Math.sin(angle) * (baseRadius + radiusOffset);
        }
    }
};

// Animation
function animate() {
    requestAnimationFrame(animate);
    
    // Time-based animations
    const time = performance.now() * 0.0005;
    
    // Animate particle system
    particlesMesh.rotation.x += 0.00005; // Reduced from 0.0001
    particlesMesh.rotation.y += 0.0001;  // Reduced from 0.0002
    
    // Animate the glowing circle
    glowingCircle.rotation.z += 0.0008; // Reduced from 0.001
    glowingCircle.rotation.x = Math.sin(time * 0.25) * 0.03; // Reduced from 0.3*0.05 to 0.25*0.03
    glowingCircle.children[0].material.opacity = 0.7 + Math.sin(time * 1.5) * 0.15; // Reduced from 2*0.2 to 1.5*0.15
    
    // Animate the ACM logo with the new enhanced function
    animateLogo(acmLogo, time);
    
    // Animate the secondary circle
    secondaryCircle.rotation.z += 0.0015; // Reduced from 0.002
    secondaryCircle.children[1].rotation.z += 0.002; // Reduced from 0.003
    
    // Animate the tech lines
    techLines.rotation.y += 0.0002; // Reduced from 0.0003
    
    // Animate background spheres
    spheres.forEach((sphere, i) => {
        sphere.position.y += Math.sin(time * (0.4 + i * 0.08)) * 0.01; // Reduced from 0.5*0.1*0.02 to 0.4*0.08*0.01
        sphere.rotation.y += 0.003; // Reduced from 0.005
    });
    
    // Mouse move effect with improved responsiveness but reduced movement
    if (mouseMoveEnabled && mouseX !== null && mouseY !== null) {
        // Subtle camera movements based on mouse position
        camera.position.x += (mouseX * 0.005 - camera.position.x) * 0.03; // Reduced from 0.01*0.05 to 0.005*0.03
        camera.position.y += (-mouseY * 0.005 - camera.position.y) * 0.03; // Reduced from 0.01*0.05 to 0.005*0.03
        camera.lookAt(scene.position);
        
        // Make the glowing circle follow the mouse slightly
        glowingCircle.rotation.y += (mouseX * 0.000003); // Reduced from 0.000005
        glowingCircle.rotation.x += (mouseY * 0.000003); // Reduced from 0.000005
        
        // Make the logo respond more prominently to mouse movement
        acmLogo.rotation.y += (mouseX * 0.000005); // Reduced from 0.000008
        acmLogo.rotation.x += (mouseY * 0.000003); // Reduced from 0.000005
    }
    
    renderer.render(scene, camera);
}

// Mouse tracking for interactive effect
let mouseX = null;
let mouseY = null;
let mouseMoveEnabled = true;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Disable mouse tracking on mobile
if (window.innerWidth < 768) {
    mouseMoveEnabled = false;
}

// Start animation
animate();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll indicator click
const scrollIndicator = document.querySelector('.scroll-indicator');
scrollIndicator.addEventListener('click', () => {
    document.querySelector('#features').scrollIntoView({ behavior: 'smooth' });
});

// Contact form submission handler
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent actual form submission
    
    // Get form elements
    const form = this;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Change button text while processing
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate processing (remove this setTimeout in production)
    setTimeout(function() {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'alert-success';
        messageDiv.style.padding = '1rem';
        messageDiv.style.marginTop = '1rem';
        messageDiv.style.backgroundColor = 'rgba(65, 182, 230, 0.1)';
        messageDiv.style.color = '#41B6E6';
        messageDiv.style.borderRadius = '10px';
        messageDiv.style.borderLeft = '3px solid #41B6E6';
        messageDiv.innerHTML = '<i class="fas fa-check-circle"></i> Your message has been received. We\'ll get back to you soon!';
        
        // Insert message after form
        form.appendChild(messageDiv);
        
        // Reset form fields
        form.reset();
        
        // Restore button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => messageDiv.remove(), 500);
        }, 5000);
    }, 1500);
    
    return false; // Prevent form submission
});