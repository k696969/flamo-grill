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

/* ===== AI CHAT BOT ===== */
(function () {
    var widget = document.getElementById('chatWidget');
    if (!widget) return;

    var toggle = document.getElementById('chatToggle');
    var minBtn = document.getElementById('chatMin');
    var panel = document.getElementById('chatPanel');
    var messages = document.getElementById('chatMessages');
    var form = document.getElementById('chatForm');
    var input = document.getElementById('chatInput');
    var suggestions = document.getElementById('chatSuggestions');
    var firstOpen = true;
    var conversationCount = 0;

    /* === KNOWLEDGE BASE (Intent matching) === */
    var intents = [
        {
            keywords: ['hallo', 'hi', 'hey', 'moin', 'guten tag', 'guten morgen', 'guten abend', 'servus', 'grüß', 'na du'],
            responses: [
                "Hallo! 👋 Ich bin der <strong>Flamo AI Assistent</strong>. Wie kann ich dir helfen?",
                "Hi! Schön, dass du da bist. Frag mich alles rund um den Flamo Grill!",
                "Hey! 🔥 Ich kenn jedes Detail zum Flamo Grill – worüber willst du was wissen?"
            ]
        },
        {
            keywords: ['kosten', 'preis', 'euro', 'eur', '€', 'teuer', 'wieviel', 'wie viel', 'bezahlen', 'wert'],
            responses: [
                "Der <strong>Flamo Grill kostet 80€</strong>. Versand ist innerhalb Deutschlands <strong>kostenlos</strong>. Und das Beste: 10€ davon gehen direkt an Hilfsorganisationen. ❤️",
                "Ein Flamo Grill ist für <strong>80€</strong> zu haben – inkl. 5 Jahre Garantie, kostenlosem Versand und 10€ Spende an Krisenhilfsprojekte."
            ]
        },
        {
            keywords: ['gewicht', 'schwer', 'kg', 'kilo', 'leicht', 'wieviel wiegt'],
            responses: [
                "Der Grill wiegt nur <strong>3,2 kg</strong> – perfekt zum Tragen über lange Strecken. Inklusive Schultergurt ist er ideal für unwegsames Gelände in Hilfsgebieten."
            ]
        },
        {
            keywords: ['größe', 'maße', 'masse', 'größen', 'abmessung', 'dimension', 'klein', 'kompakt', 'transport'],
            responses: [
                "Zusammengeklappt: <strong>32 × 22 × 8 cm</strong> – passt in jeden Rucksack. Aufgebaut: <strong>45 × 30 × 35 cm</strong>. Der Aufbau dauert nur 5 Minuten ohne Werkzeug!"
            ]
        },
        {
            keywords: ['material', 'edelstahl', 'woraus', 'stahl', 'metall', 'qualität'],
            responses: [
                "Der Grill ist aus <strong>304 Edelstahl</strong> gefertigt – korrosionsbeständig und hält Temperaturen bis <strong>700°C</strong> stand. Hergestellt zu 100% in Süddeutschland mit Ökostrom. 🌱"
            ]
        },
        {
            keywords: ['versand', 'lieferung', 'liefer', 'wann da', 'wie lange', 'dauer', 'versenden', 'verschickt'],
            responses: [
                "Lieferzeit: <strong>3–5 Werktage</strong> innerhalb Deutschlands. Versand ist <strong>kostenlos</strong>. Nach Österreich/Schweiz dauert es 5–7 Tage."
            ]
        },
        {
            keywords: ['zahlung', 'bezahl', 'bezahle', 'paypal', 'kreditkarte', 'klarna', 'sofort', 'rechnung', 'überweisung'],
            responses: [
                "Du kannst per <strong>Kreditkarte</strong>, <strong>PayPal</strong>, <strong>Klarna (Rechnung)</strong> oder <strong>Sofortüberweisung</strong> bezahlen. Alles SSL-verschlüsselt – einfach auf 'Jetzt kaufen' klicken!"
            ]
        },
        {
            keywords: ['hilfsgebiet', 'hilfe', 'spende', 'ngo', 'krisen', 'flüchtling', 'katastrophen', 'humanitär', 'wofür', 'sinn', 'zweck'],
            responses: [
                "Der Flamo Grill wurde speziell für <strong>Hilfsgebiete</strong> entwickelt – Flüchtlingscamps, Erdbebenregionen, Krisenzonen. Er ist robust, leicht und braucht kein Gas, sondern Holz, Kohle oder sogar Pflanzenmaterial. <strong>10€ pro Verkauf</strong> gehen an unsere NGO-Partner. ❤️"
            ]
        },
        {
            keywords: ['app', 'flamo connect', 'bluetooth', 'wlan', 'wifi', 'smartphone', 'iphone', 'android'],
            responses: [
                "Die <strong>Flamo Connect App</strong> (Q4 2026) verbindet sich via Bluetooth mit deinem Grill: Live-Temperatur, Rezeptvorschläge, CO₂-Tracker und 1.200+ Rezepte – auch offline! Erscheint für iOS & Android."
            ]
        },
        {
            keywords: ['sensor', 'temperatur', 'pt100', 'genau', 'messung', 'thermometer'],
            responses: [
                "Der eingebaute <strong>Pt100-Sensor</strong> misst mit <strong>±1°C Genauigkeit</strong> von 0 bis 800°C. Über die App siehst du die Temperatur in Echtzeit und bekommst Warnungen bei Überhitzung."
            ]
        },
        {
            keywords: ['solar', 'sonne', 'panel', 'strom', 'akku', 'batterie', 'usb'],
            responses: [
                "2027 launchen wir die <strong>Solar Edition</strong>: ein faltbares 10W-Solarpanel mit Powerbank und USB-C. So bleibt deine App-Steuerung auch in netzfernen Gebieten geladen. ☀️"
            ]
        },
        {
            keywords: ['ki', 'ai', 'künstliche intelligenz', 'rezept', 'cooking', 'kochen', 'assistent'],
            responses: [
                "Ab 2028 kommt der <strong>KI-Cooking-Assistent</strong>: Er erkennt Lebensmittel per Kamera, schlägt passende Rezepte vor und lernt deinen Geschmack – komplett <strong>offline</strong> auf Edge-Hardware. 🤖"
            ]
        },
        {
            keywords: ['gps', 'tracking', 'lora', 'verfolgen', 'diebstahl', 'logistik'],
            responses: [
                "Für NGOs haben wir <strong>GPS-Tracking via LoRa-WAN</strong> mit 5 Jahren Akku-Laufzeit. Geofencing-Alarme schützen vor Diebstahl in Krisenregionen."
            ]
        },
        {
            keywords: ['co2', 'umwelt', 'nachhaltig', 'öko', 'oeko', 'klima', 'recycling', 'recycel'],
            responses: [
                "Wir produzieren <strong>CO₂-neutral</strong> mit 100% Ökostrom. Jeder Grill bindet im Lebenszyklus 12 kg CO₂ über unsere Aufforstungspartner. Plus: Er spart bis zu <strong>60% Brennstoff</strong> gegenüber offenen Feuern. 🌱"
            ]
        },
        {
            keywords: ['roadmap', 'zukunft', 'plan', '2027', '2028', '2029', '2030', 'kommt', 'demnächst'],
            responses: [
                "Unser Plan: <strong>2026</strong> Launch + App · <strong>2027</strong> Solar Edition · <strong>2028</strong> KI-Cooking · <strong>2029</strong> 100.000-Familien-Meilenstein · <strong>2030</strong> Flamo Pro Elektro-Edition mit Wasserstoff-Brennstoffzelle."
            ]
        },
        {
            keywords: ['3d', 'drehen', 'ansicht', 'vorschau', 'aussehen', 'modell'],
            responses: [
                "Scroll runter zur <strong>3D-Vorschau</strong>! Da kannst du den Grill in alle Richtungen drehen, zoomen, zwischen <strong>6 Farben</strong> wählen (Stealth Black, Ember Red, Desert Sand, Storm Blue, Forest Green, Pure Steel) und 3 Material-Looks ausprobieren."
            ]
        },
        {
            keywords: ['farbe', 'colour', 'color', 'welche farben', 'auswahl'],
            responses: [
                "Er kommt in <strong>6 Farben</strong>: Stealth Black, Ember Red, Desert Sand, Storm Blue, Forest Green und Pure Steel. Probier sie live im 3D-Viewer aus!"
            ]
        },
        {
            keywords: ['brennstoff', 'holz', 'kohle', 'gas', 'pellets', 'feuer', 'anzünden'],
            responses: [
                "Multi-Brennstoff: <strong>Holz, Holzkohle, Pellets</strong> oder sogar trockenes Pflanzenmaterial. Du brauchst keine Gasflasche – das ist der riesige Vorteil in Krisenregionen!"
            ]
        },
        {
            keywords: ['temperatur', 'heiß', 'maximum', 'max', 'wieviel grad'],
            responses: [
                "Der Grill hält Temperaturen bis <strong>700°C</strong> aus. Optimierter Luftzug sorgt für gleichmäßiges Brennen und bis zu 60% weniger Brennstoffverbrauch."
            ]
        },
        {
            keywords: ['garantie', 'gewährleistung', 'kaputt', 'defekt', 'umtausch'],
            responses: [
                "Wir geben dir <strong>5 Jahre Garantie</strong> auf den Flamo Grill. Bei jedem Defekt kostenloser Austausch."
            ]
        },
        {
            keywords: ['bestellen', 'kaufen', 'order', 'bestellung', 'shop', 'warenkorb'],
            responses: [
                "Klick einfach oben auf <strong>'Jetzt kaufen'</strong> 🛒 – dort führe ich dich durch Lieferadresse, Zahlung und Bestätigung. Dauert keine 2 Minuten!"
            ]
        },
        {
            keywords: ['kontakt', 'email', 'mail', 'erreichen', 'schreiben', 'fragen'],
            responses: [
                "Du erreichst uns unter <strong>Flammogrill@gmail.com</strong> oder über das Kontaktformular ganz unten auf der Seite. 📧"
            ]
        },
        {
            keywords: ['danke', 'thanks', 'super', 'cool', 'perfekt', 'top', 'geil', 'mega', 'wow'],
            responses: [
                "Sehr gerne! 🔥 Wenn du noch was wissen willst, frag einfach.",
                "Freut mich! Gibt's noch eine Frage?",
                "Cool dass es dir gefällt! Schau dir auch die 3D-Vorschau an, falls noch nicht geschehen 😊"
            ]
        },
        {
            keywords: ['wer bist du', 'wer ist das', 'bist du echt', 'mensch', 'bot', 'echte ki', 'gpt', 'chatgpt'],
            responses: [
                "Ich bin der <strong>Flamo AI Assistent</strong> – ein KI-Bot, der speziell für unsere Schul-Projekt-Website entwickelt wurde. Ich kenne alles über den Flamo Grill! 🤖🔥"
            ]
        },
        {
            keywords: ['lustig', 'witz', 'joke', 'spaß'],
            responses: [
                "Wieso geht der Flamo Grill nie zur Therapie? Weil er seine Probleme immer selbst löscht. 😎",
                "Was sagt ein Flamo Grill zu einem Gas-Grill? 'Du brauchst echt eine Flasche, um cool zu sein?' 🔥"
            ]
        },
        {
            keywords: ['schule', 'projekt', 'schulprojekt', 'lehrer', 'lehrerin', 'klasse'],
            responses: [
                "Yep – Flamo Grill ist ein <strong>Schulprojekt</strong>! Die Website wurde komplett selbst gebaut: Design, 3D-Modell, Checkout, KI-Chat und Hosting. Hoffentlich gibt's 'ne 1! 📚🔥"
            ]
        }
    ];

    var fallbacks = [
        "Hmm, da bin ich mir nicht ganz sicher 🤔 Aber frag mich gerne nach <strong>Preis</strong>, <strong>Features</strong>, <strong>Versand</strong>, <strong>Zahlung</strong> oder unserer <strong>Roadmap</strong>.",
        "Das hab ich leider nicht ganz verstanden. Versuch's mal mit Stichworten wie 'Preis', 'App', 'Material' oder 'Hilfsgebiete'.",
        "Gute Frage! Dafür hab ich leider keine fertige Antwort. Schreib uns bei spezielleren Fragen direkt an <strong>Flammogrill@gmail.com</strong>."
    ];

    function findIntent(text) {
        var lower = text.toLowerCase();
        var bestMatch = null;
        var bestScore = 0;
        for (var i = 0; i < intents.length; i++) {
            var score = 0;
            for (var j = 0; j < intents[i].keywords.length; j++) {
                if (lower.indexOf(intents[i].keywords[j]) !== -1) {
                    score += intents[i].keywords[j].length; // longer keyword = more specific
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = intents[i];
            }
        }
        return bestMatch;
    }

    function pickResponse(intent) {
        if (!intent) {
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
        return intent.responses[Math.floor(Math.random() * intent.responses.length)];
    }

    function addMessage(text, who) {
        var div = document.createElement('div');
        div.className = 'chat-msg ' + who;
        div.innerHTML = text;
        messages.appendChild(div);
        scrollDown();
    }

    function showTyping() {
        var div = document.createElement('div');
        div.className = 'chat-typing';
        div.id = 'chatTyping';
        div.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(div);
        scrollDown();
    }

    function hideTyping() {
        var el = document.getElementById('chatTyping');
        if (el) el.remove();
    }

    function scrollDown() {
        setTimeout(function () {
            messages.scrollTop = messages.scrollHeight;
        }, 30);
    }

    function botResponds(userText) {
        showTyping();
        var intent = findIntent(userText);
        var response = pickResponse(intent);
        // Variable typing delay for realism
        var delay = 700 + Math.min(1500, response.length * 12);
        setTimeout(function () {
            hideTyping();
            addMessage(response, 'bot');
            conversationCount++;
            // Hide suggestion chips after 3 conversations
            if (conversationCount >= 3) {
                suggestions.classList.add('hidden');
            }
        }, delay);
    }

    function sendMessage(text) {
        text = text.trim();
        if (!text) return;
        addMessage(text, 'user');
        input.value = '';
        botResponds(text);
    }

    function openChat() {
        widget.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        if (firstOpen) {
            firstOpen = false;
            setTimeout(function () {
                showTyping();
                setTimeout(function () {
                    hideTyping();
                    addMessage("Hi, ich bin <strong>Flamo AI</strong> 🔥 dein persönlicher Assistent rund um den Flamo Grill. Frag mich alles – ich antworte sofort!", 'bot');
                }, 1200);
            }, 500);
        }
        setTimeout(function () { input.focus(); }, 350);
    }

    function closeChat() {
        widget.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
    }

    toggle.addEventListener('click', function () {
        if (widget.classList.contains('open')) closeChat();
        else openChat();
    });

    if (minBtn) minBtn.addEventListener('click', closeChat);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        sendMessage(input.value);
    });

    // Quick suggestion chips
    document.querySelectorAll('.chat-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
            sendMessage(chip.dataset.q);
        });
    });

    // Esc to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && widget.classList.contains('open')) closeChat();
    });
})();

/* ===== INTERACTIVE 3D GLOBE ===== */
(function () {
    var canvasEl = document.getElementById('globe-canvas');
    if (!canvasEl || typeof THREE === 'undefined') return;

    // Real-world deployment locations (lat, lng, name, type)
    var deployments = [
        [36.20, 37.16, 'Aleppo', 'active'],
        [50.45, 30.52, 'Kiew', 'active'],
        [15.35, 44.20, 'Sanaa', 'active'],
        [2.04, 45.34, 'Mogadischu', 'active'],
        [15.50, 32.55, 'Khartum', 'active'],
        [23.81, 90.41, 'Dhaka', 'active'],
        [33.89, 35.50, 'Beirut', 'active'],
        [34.55, 69.20, 'Kabul', 'active'],
        [4.85, 31.58, 'Juba', 'active'],
        [9.03, 38.74, 'Addis Abeba', 'active'],
        [-25.96, 32.58, 'Maputo', 'active'],
        [-4.32, 15.31, 'Kinshasa', 'active'],
        [17.57, -3.99, 'Timbuktu', 'active'],
        [12.37, -1.52, 'Ouagadougou', 'active'],
        [12.10, 15.04, 'N\'Djamena', 'active'],
        [33.69, 73.04, 'Islamabad', 'active'],
        [33.31, 44.36, 'Bagdad', 'active'],
        [9.06, 7.49, 'Abuja', 'active'],
        [10.49, -66.88, 'Caracas', 'active'],
        [18.59, -72.30, 'Port-au-Prince', 'active'],
        [14.60, 120.98, 'Manila', 'active'],
        [-6.21, 106.85, 'Jakarta', 'active'],
        [-18.88, 47.51, 'Antananarivo', 'active'],
        // Upcoming
        [-1.29, 36.82, 'Nairobi', 'upcoming'],
        [-15.42, 28.28, 'Lusaka', 'upcoming'],
        [10.79, 106.66, 'Saigon', 'upcoming'],
        [14.69, -17.44, 'Dakar', 'upcoming']
    ];

    var scene, camera, renderer, globe, markersGroup, arcsGroup;
    var radius = 1.8;
    var isDragging = false;
    var prevX = 0, prevY = 0;
    var rotY = 0, rotX = 0.3;
    var targetRotY = 0, targetRotX = 0.3;
    var autoSpin = 0.0015;

    function latLngToVec3(lat, lng, r) {
        var phi = (90 - lat) * (Math.PI / 180);
        var theta = (lng + 180) * (Math.PI / 180);
        var x = -r * Math.sin(phi) * Math.cos(theta);
        var z = r * Math.sin(phi) * Math.sin(theta);
        var y = r * Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    }

    function makeDotTexture(color) {
        var size = 64;
        var c = document.createElement('canvas');
        c.width = size; c.height = size;
        var ctx = c.getContext('2d');
        var grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grd.addColorStop(0, color);
        grd.addColorStop(0.5, color.replace(/[\d.]+\)$/, '0.5)'));
        grd.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, size, size);
        var t = new THREE.CanvasTexture(c);
        return t;
    }

    function init() {
        var w = canvasEl.clientWidth;
        var h = canvasEl.clientHeight || w;

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.set(0, 0, 5.2);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvasEl.appendChild(renderer.domElement);

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        var dirLight = new THREE.DirectionalLight(0xffb070, 1.2);
        dirLight.position.set(5, 3, 5);
        scene.add(dirLight);
        var rimLight = new THREE.PointLight(0xff6b35, 1.4, 12);
        rimLight.position.set(-3, 2, 3);
        scene.add(rimLight);

        // Globe sphere
        var sphereGeo = new THREE.SphereGeometry(radius, 64, 64);
        var sphereMat = new THREE.MeshPhongMaterial({
            color: 0x0a1018,
            emissive: 0x0a1018,
            specular: 0x111111,
            shininess: 8,
            transparent: true,
            opacity: 0.95
        });
        globe = new THREE.Mesh(sphereGeo, sphereMat);
        scene.add(globe);

        // Wireframe overlay (latitude/longitude grid)
        var wireGeo = new THREE.SphereGeometry(radius * 1.001, 36, 18);
        var wireMat = new THREE.LineBasicMaterial({
            color: 0xff6b35,
            transparent: true,
            opacity: 0.15
        });
        var wire = new THREE.LineSegments(new THREE.EdgesGeometry(wireGeo), wireMat);
        globe.add(wire);

        // Outer atmosphere glow
        var atmosphereGeo = new THREE.SphereGeometry(radius * 1.08, 64, 64);
        var atmosphereMat = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: [
                'varying vec3 vNormal;',
                'void main() {',
                '  vNormal = normalize(normalMatrix * normal);',
                '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying vec3 vNormal;',
                'void main() {',
                '  float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);',
                '  gl_FragColor = vec4(1.0, 0.42, 0.21, 1.0) * intensity;',
                '}'
            ].join('\n'),
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        var atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
        scene.add(atmosphere);

        // Dot continent overlay (random dots on land-likely areas)
        var dotMat = new THREE.PointsMaterial({
            color: 0xff8c4a,
            size: 0.025,
            transparent: true,
            opacity: 0.55,
            sizeAttenuation: true
        });
        var dotPositions = [];
        for (var i = 0; i < 1200; i++) {
            // Distribute around sphere
            var u = Math.random();
            var v = Math.random();
            var theta = 2 * Math.PI * u;
            var phi = Math.acos(2 * v - 1);
            // Subtle clustering (more dots roughly along continents)
            var lat = 90 - phi * (180 / Math.PI);
            var lng = (theta * (180 / Math.PI)) - 180;
            // Skip many ocean areas with probability
            var landish =
                (lng > -130 && lng < -65 && lat > 10 && lat < 70) || // N America
                (lng > -80 && lng < -35 && lat > -55 && lat < 12) || // S America
                (lng > -10 && lng < 60 && lat > 35 && lat < 70) || // Europe
                (lng > 25 && lng < 180 && lat > 5 && lat < 75) || // Asia
                (lng > -20 && lng < 55 && lat > -35 && lat < 35) || // Africa
                (lng > 110 && lng < 155 && lat > -45 && lat < -10); // Australia
            if (!landish && Math.random() > 0.07) continue;
            var p = latLngToVec3(lat, lng, radius * 1.005);
            dotPositions.push(p.x, p.y, p.z);
        }
        var dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
        var continentDots = new THREE.Points(dotGeo, dotMat);
        globe.add(continentDots);

        // Deployment markers
        markersGroup = new THREE.Group();
        globe.add(markersGroup);

        var activeTex = makeDotTexture('rgba(255, 140, 60, 1)');
        var upcomingTex = makeDotTexture('rgba(80, 160, 240, 1)');

        deployments.forEach(function (d) {
            var lat = d[0], lng = d[1], name = d[2], type = d[3];
            var pos = latLngToVec3(lat, lng, radius * 1.01);
            var color = type === 'active' ? 0xff6b35 : 0x4aa8ff;
            var tex = type === 'active' ? activeTex : upcomingTex;

            // Glow sprite
            var spriteMat = new THREE.SpriteMaterial({
                map: tex,
                color: color,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                depthTest: true
            });
            var sprite = new THREE.Sprite(spriteMat);
            sprite.position.copy(pos);
            sprite.scale.set(0.18, 0.18, 0.18);
            sprite.userData = { type: type, baseScale: 0.18, phase: Math.random() * Math.PI * 2 };
            markersGroup.add(sprite);

            // Tiny core dot
            var coreGeo = new THREE.SphereGeometry(0.022, 12, 12);
            var coreMat = new THREE.MeshBasicMaterial({ color: color });
            var core = new THREE.Mesh(coreGeo, coreMat);
            core.position.copy(pos);
            markersGroup.add(core);
        });

        // Animated connection arcs between some active deployments
        arcsGroup = new THREE.Group();
        globe.add(arcsGroup);
        var activeOnly = deployments.filter(function (d) { return d[3] === 'active'; });
        var arcCount = 8;
        for (var k = 0; k < arcCount; k++) {
            var a = activeOnly[Math.floor(Math.random() * activeOnly.length)];
            var b = activeOnly[Math.floor(Math.random() * activeOnly.length)];
            if (a === b) continue;
            var p1 = latLngToVec3(a[0], a[1], radius);
            var p2 = latLngToVec3(b[0], b[1], radius);
            var mid = p1.clone().add(p2).multiplyScalar(0.5);
            mid.setLength(radius * 1.45);
            var curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
            var pts = curve.getPoints(40);
            var arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
            var arcMat = new THREE.LineBasicMaterial({
                color: 0xff6b35,
                transparent: true,
                opacity: 0.5
            });
            var arc = new THREE.Line(arcGeo, arcMat);
            arc.userData = { phase: Math.random() * Math.PI * 2 };
            arcsGroup.add(arc);
        }

        // Initial rotation
        globe.rotation.y = rotY;
        globe.rotation.x = rotX;

        addInteraction();
        animate();
        window.addEventListener('resize', onResize);
    }

    function addInteraction() {
        canvasEl.addEventListener('mousedown', function (e) {
            isDragging = true;
            prevX = e.clientX; prevY = e.clientY;
        });
        window.addEventListener('mouseup', function () { isDragging = false; });
        window.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            var dx = e.clientX - prevX;
            var dy = e.clientY - prevY;
            targetRotY += dx * 0.005;
            targetRotX += dy * 0.005;
            targetRotX = Math.max(-1.2, Math.min(1.2, targetRotX));
            prevX = e.clientX; prevY = e.clientY;
        });
        // Touch
        canvasEl.addEventListener('touchstart', function (e) {
            isDragging = true;
            prevX = e.touches[0].clientX;
            prevY = e.touches[0].clientY;
        }, { passive: true });
        canvasEl.addEventListener('touchend', function () { isDragging = false; });
        canvasEl.addEventListener('touchmove', function (e) {
            if (!isDragging) return;
            var dx = e.touches[0].clientX - prevX;
            var dy = e.touches[0].clientY - prevY;
            targetRotY += dx * 0.005;
            targetRotX += dy * 0.005;
            targetRotX = Math.max(-1.2, Math.min(1.2, targetRotX));
            prevX = e.touches[0].clientX;
            prevY = e.touches[0].clientY;
        }, { passive: true });
    }

    function onResize() {
        if (!camera || !renderer) return;
        var w = canvasEl.clientWidth;
        var h = canvasEl.clientHeight || w;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    function animate() {
        requestAnimationFrame(animate);
        if (!isDragging) targetRotY += autoSpin;
        rotY += (targetRotY - rotY) * 0.08;
        rotX += (targetRotX - rotX) * 0.08;
        globe.rotation.y = rotY;
        globe.rotation.x = rotX;

        // Pulse markers
        var time = Date.now() * 0.003;
        markersGroup.children.forEach(function (child) {
            if (child.userData && child.userData.baseScale != null) {
                var scale = child.userData.baseScale * (1 + 0.25 * Math.sin(time + child.userData.phase));
                child.scale.set(scale, scale, scale);
            }
        });
        // Animate arc opacity
        arcsGroup.children.forEach(function (arc) {
            if (arc.material && arc.userData && arc.userData.phase != null) {
                arc.material.opacity = 0.25 + 0.35 * Math.sin(time * 0.7 + arc.userData.phase);
            }
        });

        renderer.render(scene, camera);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/* ===== ANIMATED COUNTERS (globe stats) ===== */
(function () {
    var els = document.querySelectorAll('.globe-stat-num');
    if (!els.length || !('IntersectionObserver' in window)) return;

    function animateCount(el) {
        var target = parseInt(el.dataset.count, 10) || 0;
        var suffix = el.dataset.suffix || '';
        var duration = 1800;
        var start = performance.now();
        function tick(now) {
            var t = Math.min(1, (now - start) / duration);
            // ease-out
            var eased = 1 - Math.pow(1 - t, 3);
            var val = Math.round(target * eased);
            // Format with thousands separator
            el.textContent = val.toLocaleString('de-DE') + suffix;
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                animateCount(e.target);
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.4 });

    els.forEach(function (el) { io.observe(el); });
})();

/* ===== LIVE TICKER ===== */
(function () {
    var msg = document.getElementById('tickerMsg');
    if (!msg) return;
    var entries = [
        '📦 12 Grills in Kiew angekommen',
        '🤝 Neue Partnerschaft mit ShelterAid in Nairobi',
        '🔥 5.000ster Grill verschickt',
        '🌍 Erste Lieferung nach Madagaskar erfolgreich',
        '💚 156 Tonnen CO₂ in 2026 eingespart',
        '📡 Sensor-Update v2.4 ausgerollt',
        '⚡ App-Beta läuft mit 1.247 Testern',
        '🚚 Container nach Jakarta auf dem Weg',
        '🎯 NGO-Partner #47 hinzugefügt',
        '🔋 Solar-Edition Prototyp #3 bestanden'
    ];
    var i = 0;
    function rotate() {
        msg.style.opacity = '0';
        setTimeout(function () {
            i = (i + 1) % entries.length;
            msg.textContent = entries[i];
            msg.style.opacity = '1';
        }, 350);
    }
    msg.style.transition = 'opacity 0.35s';
    msg.textContent = entries[0];
    setInterval(rotate, 4500);
})();

/* ===== EMBER CURSOR TRAIL ===== */
(function () {
    var canvas = document.getElementById('emberCanvas');
    if (!canvas) return;
    // Skip on touch-only devices
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var mouseX = -100, mouseY = -100;
    var hasMoved = false;

    function resize() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        hasMoved = true;
        // Spawn 1-2 embers per move
        var spawn = Math.random() < 0.6 ? 1 : 2;
        for (var i = 0; i < spawn; i++) {
            particles.push({
                x: mouseX + (Math.random() - 0.5) * 6,
                y: mouseY + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 0.6,
                vy: -Math.random() * 1.2 - 0.4,
                life: 1,
                decay: 0.012 + Math.random() * 0.018,
                size: 1.5 + Math.random() * 2.5,
                hue: 15 + Math.random() * 35
            });
        }
        // Cap
        if (particles.length > 200) particles.splice(0, particles.length - 200);
    });

    function frame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.005; // slight gravity dampening upward motion
            p.vx *= 0.99;
            p.life -= p.decay;
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            var alpha = Math.max(0, p.life);
            var r = p.size * p.life;
            var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
            grad.addColorStop(0, 'hsla(' + p.hue + ', 100%, 65%, ' + alpha + ')');
            grad.addColorStop(0.4, 'hsla(' + p.hue + ', 100%, 50%, ' + (alpha * 0.5) + ')');
            grad.addColorStop(1, 'hsla(' + p.hue + ', 100%, 50%, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(frame);
    }
    frame();
})();

/* ===== KONAMI CODE EASTER EGG ===== */
(function () {
    var egg = document.getElementById('easterEgg');
    var rain = document.getElementById('fireRainCanvas');
    var closeBtn = document.getElementById('easterClose');
    if (!egg || !rain) return;

    var sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var progress = 0;

    function trigger() {
        egg.classList.add('open');
        egg.setAttribute('aria-hidden', 'false');
        startRain();
    }

    function closeEgg() {
        egg.classList.remove('open');
        egg.setAttribute('aria-hidden', 'true');
        stopRain();
    }

    document.addEventListener('keydown', function (e) {
        var key = e.key;
        var expected = sequence[progress];
        if (key === expected || (expected.length === 1 && key.toLowerCase() === expected)) {
            progress++;
            if (progress === sequence.length) {
                progress = 0;
                trigger();
            }
        } else {
            progress = key === sequence[0] ? 1 : 0;
        }

        if (e.key === 'Escape' && egg.classList.contains('open')) closeEgg();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeEgg);

    /* === Fire-Rain Canvas === */
    var rainCtx = rain.getContext('2d');
    var rainParticles = [];
    var rainRunning = false;
    var rainDpr = Math.min(window.devicePixelRatio || 1, 2);

    function sizeRain() {
        rain.width = rain.clientWidth * rainDpr;
        rain.height = rain.clientHeight * rainDpr;
        rainCtx.setTransform(1, 0, 0, 1, 0, 0);
        rainCtx.scale(rainDpr, rainDpr);
    }

    function startRain() {
        sizeRain();
        rainParticles = [];
        for (var i = 0; i < 60; i++) spawnRainParticle(true);
        rainRunning = true;
        rainFrame();
    }

    function stopRain() {
        rainRunning = false;
    }

    function spawnRainParticle(initial) {
        var w = rain.clientWidth;
        var h = rain.clientHeight;
        rainParticles.push({
            x: Math.random() * w,
            y: initial ? Math.random() * h : -20,
            vy: 2 + Math.random() * 4,
            vx: (Math.random() - 0.5) * 1,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.1,
            size: 18 + Math.random() * 18,
            char: Math.random() < 0.85 ? '🔥' : '✨',
            life: 1
        });
    }

    function rainFrame() {
        if (!rainRunning) return;
        var w = rain.clientWidth;
        var h = rain.clientHeight;
        rainCtx.clearRect(0, 0, w, h);
        for (var i = rainParticles.length - 1; i >= 0; i--) {
            var p = rainParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vr;
            if (p.y > h + 30) {
                rainParticles.splice(i, 1);
                spawnRainParticle(false);
                continue;
            }
            rainCtx.save();
            rainCtx.translate(p.x, p.y);
            rainCtx.rotate(p.rot);
            rainCtx.font = p.size + 'px sans-serif';
            rainCtx.textAlign = 'center';
            rainCtx.textBaseline = 'middle';
            rainCtx.fillText(p.char, 0, 0);
            rainCtx.restore();
        }
        requestAnimationFrame(rainFrame);
    }

    window.addEventListener('resize', function () { if (rainRunning) sizeRain(); });
})();
