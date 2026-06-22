/* ===== NAVBAR SCROLL EFFECT ===== */
(function () {
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 30) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }
})();

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
        var targetId = link.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            var offset = 80;
            var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    });
});

/* ===== SCROLL REVEAL ===== */
(function () {
    if (!('IntersectionObserver' in window)) return;
    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.feature-card, .visual-card, .spec-row, .section-header')
        .forEach(function (el) {
            el.classList.add('reveal');
            revealObserver.observe(el);
        });
})();

/* ===== CONTACT FORM ===== */
(function () {
    var contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = new FormData(contactForm);
        var subject = encodeURIComponent('[Flamo Grill] ' + data.get('subject'));
        var body = encodeURIComponent(
            'Name: ' + data.get('name') + '\n' +
            'E-Mail: ' + data.get('email') + '\n\n' +
            'Nachricht:\n' + data.get('message')
        );
        window.location.href = 'mailto:Flammogrill@gmail.com?subject=' + subject + '&body=' + body;
    });
})();

/* ===== 3D GRILL VIEWER ===== */
(function () {
    var canvasContainer = document.getElementById('canvas-3d');
    if (!canvasContainer) return;

    if (typeof THREE === 'undefined') {
        canvasContainer.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100%;padding:40px;text-align:center;color:#888;font-size:14px;">' +
            '3D-Bibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen.' +
            '</div>';
        return;
    }

    var scene, camera, renderer, controls, grillGroup;
    var currentColor = '#1a1a1a';
    var currentMaterial = 'metal';
    var autoRotate = true;
    var bodyMeshes = [];

    function createBodyMaterial(color, type) {
        var c = new THREE.Color(color);
        if (type === 'metal') {
            return new THREE.MeshStandardMaterial({
                color: c, metalness: 0.85, roughness: 0.28
            });
        }
        if (type === 'matte') {
            return new THREE.MeshStandardMaterial({
                color: c, metalness: 0.15, roughness: 0.9
            });
        }
        return new THREE.MeshStandardMaterial({
            color: c, metalness: 0.55, roughness: 0.08
        });
    }

    function buildGrill() {
        grillGroup = new THREE.Group();
        bodyMeshes = [];

        var bodyMat = createBodyMaterial(currentColor, currentMaterial);
        var darkMetal = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.4 });
        var accentMetal = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.9, roughness: 0.25 });
        var grateMetal = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.95, roughness: 0.3 });
        var rubberMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.1, roughness: 0.95 });

        // ===== LEGS =====
        var legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.95, 14);
        var legPositions = [
            [ 0.7, 0.45,  0.45],
            [-0.7, 0.45,  0.45],
            [ 0.7, 0.45, -0.45],
            [-0.7, 0.45, -0.45]
        ];
        legPositions.forEach(function (pos) {
            var leg = new THREE.Mesh(legGeo, darkMetal);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            grillGroup.add(leg);

            // Foot pad
            var footGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16);
            var foot = new THREE.Mesh(footGeo, rubberMat);
            foot.position.set(pos[0], 0.02, pos[2]);
            foot.castShadow = true;
            grillGroup.add(foot);
        });

        // Cross bars (X pattern under grill)
        var crossGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.55, 10);
        var crossA = new THREE.Mesh(crossGeo, darkMetal);
        crossA.position.set(0, 0.25, 0);
        crossA.rotation.y = Math.PI / 5;
        crossA.rotation.z = Math.PI / 2;
        crossA.castShadow = true;
        grillGroup.add(crossA);

        var crossB = new THREE.Mesh(crossGeo, darkMetal);
        crossB.position.set(0, 0.25, 0);
        crossB.rotation.y = -Math.PI / 5;
        crossB.rotation.z = Math.PI / 2;
        crossB.castShadow = true;
        grillGroup.add(crossB);

        // ===== MAIN BODY (kettle shape) =====
        // Bottom hemisphere
        var bodyBottomGeo = new THREE.SphereGeometry(0.62, 64, 32, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
        var bodyBottom = new THREE.Mesh(bodyBottomGeo, bodyMat);
        bodyBottom.scale.set(1, 0.85, 0.85);
        bodyBottom.position.y = 1.0;
        bodyBottom.castShadow = true;
        bodyBottom.receiveShadow = true;
        grillGroup.add(bodyBottom);
        bodyMeshes.push(bodyBottom);

        // Rim
        var rimGeo = new THREE.TorusGeometry(0.62, 0.028, 14, 64);
        var rim = new THREE.Mesh(rimGeo, accentMetal);
        rim.rotation.x = Math.PI / 2;
        rim.scale.set(1, 0.85, 1);
        rim.position.y = 1.0;
        rim.castShadow = true;
        grillGroup.add(rim);

        // ===== CHARCOAL BED =====
        var charGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32);
        var charMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1, metalness: 0 });
        var charcoal = new THREE.Mesh(charGeo, charMat);
        charcoal.position.y = 0.95;
        charcoal.scale.set(1, 1, 0.85);
        grillGroup.add(charcoal);

        // Glowing embers (decorative)
        for (var i = 0; i < 18; i++) {
            var emberGeo = new THREE.SphereGeometry(0.045, 10, 10);
            var emberHue = 0.04 + Math.random() * 0.06;
            var emberMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(emberHue, 1, 0.45 + Math.random() * 0.3)
            });
            var ember = new THREE.Mesh(emberGeo, emberMat);
            var ang = Math.random() * Math.PI * 2;
            var rad = Math.random() * 0.42;
            ember.position.set(
                Math.cos(ang) * rad,
                0.98,
                Math.sin(ang) * rad * 0.85
            );
            ember.scale.setScalar(0.4 + Math.random() * 0.9);
            grillGroup.add(ember);
        }

        // Subtle ember point light
        var emberLight = new THREE.PointLight(0xff5522, 1.4, 2.5);
        emberLight.position.set(0, 1.05, 0);
        grillGroup.add(emberLight);

        // ===== GRILL GRATE =====
        var grateGroup = new THREE.Group();
        var grateY = 1.08;
        var grateRadius = 0.52;

        // Parallel bars
        var numBars = 13;
        for (var b = 0; b < numBars; b++) {
            var t = b / (numBars - 1);
            var offset = (t - 0.5) * grateRadius * 2 * 0.85;
            var halfChord = Math.sqrt(Math.max(0, grateRadius * grateRadius - (offset / 0.85) * (offset / 0.85))) * 0.95;
            if (halfChord < 0.05) continue;
            var barGeo = new THREE.CylinderGeometry(0.014, 0.014, halfChord * 2, 10);
            var bar = new THREE.Mesh(barGeo, grateMetal);
            bar.rotation.z = Math.PI / 2;
            bar.position.set(0, grateY, offset);
            bar.castShadow = true;
            grateGroup.add(bar);
        }
        // Perpendicular support
        var supportGeo = new THREE.CylinderGeometry(0.015, 0.015, grateRadius * 2 * 0.85, 10);
        var support1 = new THREE.Mesh(supportGeo, grateMetal);
        support1.position.set(0, grateY - 0.018, 0);
        support1.castShadow = true;
        grateGroup.add(support1);

        // Outer ring
        var grateRingGeo = new THREE.TorusGeometry(grateRadius, 0.02, 10, 56);
        var grateRing = new THREE.Mesh(grateRingGeo, grateMetal);
        grateRing.rotation.x = Math.PI / 2;
        grateRing.scale.set(1, 0.85, 1);
        grateRing.position.y = grateY;
        grateRing.castShadow = true;
        grateGroup.add(grateRing);
        grillGroup.add(grateGroup);

        // ===== LID =====
        var lidGroup = new THREE.Group();
        var lidGeo = new THREE.SphereGeometry(0.62, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
        var lid = new THREE.Mesh(lidGeo, bodyMat);
        lid.scale.set(1, 0.7, 0.85);
        lid.castShadow = true;
        lid.receiveShadow = true;
        lidGroup.add(lid);
        bodyMeshes.push(lid);

        // Lid rim
        var lidRim = new THREE.Mesh(rimGeo.clone(), accentMetal);
        lidRim.rotation.x = Math.PI / 2;
        lidRim.scale.set(1, 0.85, 1);
        lidGroup.add(lidRim);

        // Lid handle base
        var handleBaseGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.1, 16);
        var handleBase = new THREE.Mesh(handleBaseGeo, accentMetal);
        handleBase.position.y = 0.43;
        handleBase.castShadow = true;
        lidGroup.add(handleBase);

        // Lid handle knob
        var knobGeo = new THREE.SphereGeometry(0.09, 24, 24);
        var knob = new THREE.Mesh(knobGeo, darkMetal);
        knob.position.y = 0.55;
        knob.castShadow = true;
        lidGroup.add(knob);

        // Vent holes on lid
        var ventGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.05, 12);
        var ventMat = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0.5, roughness: 0.6 });
        for (var v = 0; v < 6; v++) {
            var vAng = (v / 6) * Math.PI * 2;
            var vent = new THREE.Mesh(ventGeo, ventMat);
            var vRad = 0.22;
            vent.position.set(
                Math.cos(vAng) * vRad,
                0.4,
                Math.sin(vAng) * vRad * 0.85
            );
            // Orient vent normal outward from sphere
            vent.lookAt(vent.position.x * 2, vent.position.y * 2, vent.position.z * 2);
            vent.rotateX(Math.PI / 2);
            lidGroup.add(vent);
        }

        lidGroup.position.y = 1.0;
        // Tilt the lid back slightly (open)
        lidGroup.rotation.x = -0.35;
        // Pivot so it hinges at the back
        lidGroup.position.z = -0.05;
        grillGroup.add(lidGroup);

        // ===== SIDE CARRY HANDLES =====
        var handleArc = new THREE.TorusGeometry(0.11, 0.025, 10, 24, Math.PI);
        var sideHandleL = new THREE.Mesh(handleArc, darkMetal);
        sideHandleL.position.set(-0.78, 1.0, 0);
        sideHandleL.rotation.set(0, 0, -Math.PI / 2);
        sideHandleL.castShadow = true;
        grillGroup.add(sideHandleL);

        var sideHandleR = new THREE.Mesh(handleArc, darkMetal);
        sideHandleR.position.set(0.78, 1.0, 0);
        sideHandleR.rotation.set(0, Math.PI, -Math.PI / 2);
        sideHandleR.castShadow = true;
        grillGroup.add(sideHandleR);

        // Wood grips on side handles
        var gripGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.18, 16);
        var woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.7, metalness: 0.05 });
        var gripL = new THREE.Mesh(gripGeo, woodMat);
        gripL.position.set(-0.89, 1.0, 0);
        gripL.castShadow = true;
        grillGroup.add(gripL);
        var gripR = new THREE.Mesh(gripGeo, woodMat);
        gripR.position.set(0.89, 1.0, 0);
        gripR.castShadow = true;
        grillGroup.add(gripR);

        // ===== BRAND PLATE =====
        var plateGeo = new THREE.BoxGeometry(0.32, 0.075, 0.006);
        var plateMat = new THREE.MeshStandardMaterial({
            color: 0xffb627,
            metalness: 0.85,
            roughness: 0.2,
            emissive: 0xff6b35,
            emissiveIntensity: 0.25
        });
        var plate = new THREE.Mesh(plateGeo, plateMat);
        plate.position.set(0, 0.82, 0.5);
        grillGroup.add(plate);

        // ===== ASH CATCHER =====
        var ashGeo = new THREE.CylinderGeometry(0.28, 0.2, 0.2, 28);
        var ash = new THREE.Mesh(ashGeo, bodyMat);
        ash.position.y = 0.7;
        ash.castShadow = true;
        ash.receiveShadow = true;
        grillGroup.add(ash);
        bodyMeshes.push(ash);

        var ashTrim = new THREE.Mesh(
            new THREE.TorusGeometry(0.28, 0.012, 8, 32),
            accentMetal
        );
        ashTrim.rotation.x = Math.PI / 2;
        ashTrim.position.y = 0.795;
        grillGroup.add(ashTrim);

        // Center & ground the model
        grillGroup.position.y = 0;
        scene.add(grillGroup);
    }

    function updateMaterials() {
        bodyMeshes.forEach(function (mesh) {
            if (mesh.material) mesh.material.dispose();
            mesh.material = createBodyMaterial(currentColor, currentMaterial);
        });
    }

    function init3D() {
        var width = canvasContainer.clientWidth;
        var height = canvasContainer.clientHeight || 520;

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0a0a0a, 9, 28);

        camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        camera.position.set(3.5, 2.6, 4.5);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        if (THREE.ACESFilmicToneMapping) {
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.15;
        }
        if (THREE.sRGBEncoding) {
            renderer.outputEncoding = THREE.sRGBEncoding;
        }
        canvasContainer.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.35));

        var key = new THREE.DirectionalLight(0xffffff, 1.3);
        key.position.set(5, 8, 5);
        key.castShadow = true;
        key.shadow.mapSize.set(2048, 2048);
        key.shadow.camera.near = 0.5;
        key.shadow.camera.far = 30;
        key.shadow.camera.left = -5;
        key.shadow.camera.right = 5;
        key.shadow.camera.top = 5;
        key.shadow.camera.bottom = -5;
        scene.add(key);

        var fill = new THREE.DirectionalLight(0xffb060, 0.5);
        fill.position.set(-5, 3, -3);
        scene.add(fill);

        var rim = new THREE.PointLight(0xff6b35, 1.4, 14);
        rim.position.set(-2, 2, -3);
        scene.add(rim);

        // Ground
        var floorGeo = new THREE.CircleGeometry(8, 64);
        var floorMat = new THREE.MeshStandardMaterial({
            color: 0x080808, roughness: 0.85, metalness: 0.15
        });
        var floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        scene.add(floor);

        // Grill
        buildGrill();

        // Controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 2.5;
        controls.maxDistance = 10;
        controls.minPolarAngle = Math.PI * 0.12;
        controls.maxPolarAngle = Math.PI * 0.5;
        controls.target.set(0, 0.9, 0);
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 1.2;
        controls.enablePan = false;

        // Resize
        var resizeObserver;
        if (window.ResizeObserver) {
            resizeObserver = new ResizeObserver(onResize);
            resizeObserver.observe(canvasContainer);
        }
        window.addEventListener('resize', onResize);

        animate();
    }

    function onResize() {
        if (!camera || !renderer) return;
        var width = canvasContainer.clientWidth;
        var height = canvasContainer.clientHeight || 520;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function animate() {
        requestAnimationFrame(animate);
        if (controls) controls.update();
        if (renderer && scene && camera) renderer.render(scene, camera);
    }

    // ===== UI CONTROLS =====
    document.querySelectorAll('.color-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.color-option').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            currentColor = btn.dataset.color;
            updateMaterials();
        });
    });

    document.querySelectorAll('.material-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.material-option').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            currentMaterial = btn.dataset.material;
            updateMaterials();
        });
    });

    var toggleRotateBtn = document.getElementById('toggleRotate');
    if (toggleRotateBtn) {
        toggleRotateBtn.classList.add('active');
        toggleRotateBtn.addEventListener('click', function () {
            autoRotate = !autoRotate;
            if (controls) controls.autoRotate = autoRotate;
            toggleRotateBtn.classList.toggle('active', autoRotate);
        });
    }

    var resetViewBtn = document.getElementById('resetView');
    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', function () {
            if (!camera || !controls) return;
            camera.position.set(3.5, 2.6, 4.5);
            controls.target.set(0, 0.9, 0);
            controls.update();
        });
    }

    // Init when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init3D);
    } else {
        init3D();
    }
})();

/* ===== CHECKOUT MODAL ===== */
(function () {
    var modal = document.getElementById('checkoutModal');
    if (!modal) return;

    var currentStep = 1;

    function openCheckout() {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('checkout-open');
        goToStep(1);
    }

    function closeCheckout() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('checkout-open');
    }

    function goToStep(n) {
        currentStep = n;
        // Show/hide step content
        modal.querySelectorAll('.checkout-step').forEach(function (el) {
            el.classList.toggle('active', parseInt(el.dataset.step, 10) === n);
        });
        // Update stepper
        modal.querySelectorAll('.step').forEach(function (el) {
            var s = parseInt(el.dataset.stepIndicator, 10);
            el.classList.remove('active', 'done');
            if (s < n) el.classList.add('done');
            else if (s === n) el.classList.add('active');
        });
        var main = modal.querySelector('.checkout-main');
        if (main) main.scrollTop = 0;
    }

    // Open triggers
    document.querySelectorAll('[data-open-checkout]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            openCheckout();
        });
    });

    // Close triggers
    modal.querySelectorAll('[data-close-checkout]').forEach(function (btn) {
        btn.addEventListener('click', function () { closeCheckout(); });
    });

    // Esc to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeCheckout();
    });

    // Step 1 → 2: Validate shipping
    var nextBtn = modal.querySelector('[data-next-step]');
    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            var required = ['co-firstname', 'co-lastname', 'co-email', 'co-street', 'co-zip', 'co-city'];
            var allOk = true;
            for (var i = 0; i < required.length; i++) {
                var el = document.getElementById(required[i]);
                if (!el.value.trim()) {
                    el.style.borderColor = '#e74c3c';
                    allOk = false;
                } else {
                    el.style.borderColor = '';
                }
            }
            var emailEl = document.getElementById('co-email');
            if (allOk && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
                emailEl.style.borderColor = '#e74c3c';
                allOk = false;
            }
            if (allOk) goToStep(2);
        });
    }

    // Back
    var prevBtn = modal.querySelector('[data-prev-step]');
    if (prevBtn) prevBtn.addEventListener('click', function () { goToStep(1); });

    // Payment method switcher
    modal.querySelectorAll('.payment-method').forEach(function (label) {
        label.addEventListener('click', function () {
            modal.querySelectorAll('.payment-method').forEach(function (l) { l.classList.remove('active'); });
            label.classList.add('active');
            var value = label.querySelector('input').value;
            modal.querySelectorAll('.payment-form').forEach(function (f) {
                f.classList.toggle('active', f.dataset.pmForm === value);
            });
        });
    });

    // Credit card formatting
    var ccNumber = document.getElementById('co-cc-number');
    var ccDisplay = document.getElementById('cc-display-number');
    if (ccNumber) {
        ccNumber.addEventListener('input', function () {
            var v = ccNumber.value.replace(/\D/g, '').substring(0, 16);
            var formatted = v.replace(/(.{4})/g, '$1 ').trim();
            ccNumber.value = formatted;
            ccDisplay.textContent = formatted.padEnd(19, '•').replace(/•{4}(?=•)/g, '•••• ').replace(/(.{4}) (.{4}) (.{4}) (.{4}).*/, '$1 $2 $3 $4');
            var pad = formatted.replace(/ /g, '');
            while (pad.length < 16) pad += '•';
            ccDisplay.textContent = pad.replace(/(.{4})/g, '$1 ').trim();
        });
    }

    var ccName = document.getElementById('co-cc-name');
    var ccNameDisplay = document.getElementById('cc-display-name');
    if (ccName) {
        ccName.addEventListener('input', function () {
            ccNameDisplay.textContent = (ccName.value || 'VORNAME NACHNAME').toUpperCase();
        });
    }

    var ccExpiry = document.getElementById('co-cc-expiry');
    var ccExpiryDisplay = document.getElementById('cc-display-expiry');
    if (ccExpiry) {
        ccExpiry.addEventListener('input', function () {
            var v = ccExpiry.value.replace(/\D/g, '').substring(0, 4);
            if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
            ccExpiry.value = v;
            ccExpiryDisplay.textContent = v.length ? v : 'MM/JJ';
        });
    }

    var ccCvv = document.getElementById('co-cc-cvv');
    if (ccCvv) {
        ccCvv.addEventListener('input', function () {
            ccCvv.value = ccCvv.value.replace(/\D/g, '').substring(0, 4);
        });
    }

    // Submit order
    var submitBtn = modal.querySelector('[data-submit-order]');
    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            // Light validation depending on payment method
            var active = modal.querySelector('.payment-method.active input');
            var method = active ? active.value : 'card';
            if (method === 'card') {
                var num = (document.getElementById('co-cc-number').value || '').replace(/\s/g, '');
                var exp = document.getElementById('co-cc-expiry').value || '';
                var cvv = document.getElementById('co-cc-cvv').value || '';
                var name = document.getElementById('co-cc-name').value || '';
                var ok = num.length >= 13 && exp.length === 5 && cvv.length >= 3 && name.trim().length > 1;
                if (!ok) {
                    [['co-cc-number', num.length >= 13], ['co-cc-expiry', exp.length === 5], ['co-cc-cvv', cvv.length >= 3], ['co-cc-name', name.trim().length > 1]]
                        .forEach(function (pair) {
                            var el = document.getElementById(pair[0]);
                            el.style.borderColor = pair[1] ? '' : '#e74c3c';
                        });
                    return;
                }
            }

            // Loading state
            submitBtn.classList.add('loading');
            var orig = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Zahlung wird verarbeitet';

            setTimeout(function () {
                submitBtn.classList.remove('loading');
                submitBtn.innerHTML = orig;

                // Build order number
                var n = 'FG-' + Math.floor(100000 + Math.random() * 900000);
                document.getElementById('orderNumber').textContent = n;
                var email = document.getElementById('co-email').value || '—';
                document.getElementById('orderEmail').textContent = email;
                goToStep(3);
            }, 1800);
        });
    }
})();
