import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#grillCanvas");
const swatches = document.querySelectorAll(".swatch");
const toggleGrate = document.querySelector("#toggleGrate");
const toggleHandle = document.querySelector("#toggleHandle");
const togglePacked = document.querySelector("#togglePacked");
const zoomRange = document.querySelector("#zoomRange");
const zoomValue = document.querySelector("#zoomValue");
const autoRotateButton = document.querySelector("#autoRotate");
const resetButton = document.querySelector("#resetView");

if (window.lucide) {
  window.lucide.createIcons();
} else {
  window.addEventListener("load", () => window.lucide?.createIcons());
}

if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(5.2, 3.1, 6.4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 4.3;
  controls.maxDistance = 9.8;
  controls.target.set(0, 0.2, 0);
  controls.autoRotateSpeed = 1.6;

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: "#d93d1e",
    metalness: 0.36,
    roughness: 0.48,
  });
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: "#161615",
    metalness: 0.55,
    roughness: 0.34,
  });
  const steelMaterial = new THREE.MeshStandardMaterial({
    color: "#aeb4b8",
    metalness: 0.72,
    roughness: 0.26,
  });
  const coalMaterial = new THREE.MeshStandardMaterial({
    color: "#26221e",
    metalness: 0.05,
    roughness: 0.9,
  });
  const emberMaterial = new THREE.MeshStandardMaterial({
    color: "#ff6b2d",
    emissive: "#9f2311",
    emissiveIntensity: 0.9,
    roughness: 0.7,
  });

  scene.add(new THREE.HemisphereLight("#fff8ed", "#53606b", 2.6));

  const keyLight = new THREE.DirectionalLight("#fff1df", 4.2);
  keyLight.position.set(4, 5, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight("#2266c7", 28, 12);
  rimLight.position.set(-3, 2.5, -2.8);
  scene.add(rimLight);

  const grill = new THREE.Group();
  scene.add(grill);

  const grateGroup = new THREE.Group();
  const handleGroup = new THREE.Group();
  const legGroup = new THREE.Group();
  const wheelGroup = new THREE.Group();
  const packedOnlyGroup = new THREE.Group();

  const makeBox = (name, size, position, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const makeCylinder = (name, radius, depth, position, rotation, material, segments = 32) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, segments), material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const firebox = makeBox("Feuerschale", [4.1, 0.72, 1.8], [0, 0, 0], bodyMaterial);
  grill.add(firebox);
  grill.add(makeBox("Innenwanne", [3.72, 0.12, 1.44], [0, 0.44, 0], darkMaterial));
  grill.add(makeBox("Frontkante", [4.28, 0.18, 0.12], [0, 0.48, -0.96], darkMaterial));
  grill.add(makeBox("Rueckkante", [4.28, 0.18, 0.12], [0, 0.48, 0.96], darkMaterial));
  grill.add(makeBox("Linke Kante", [0.12, 0.18, 1.96], [-2.14, 0.48, 0], darkMaterial));
  grill.add(makeBox("Rechte Kante", [0.12, 0.18, 1.96], [2.14, 0.48, 0], darkMaterial));

  for (let index = 0; index < 8; index += 1) {
    const x = -1.58 + index * 0.45;
    grateGroup.add(makeCylinder("Roststab", 0.025, 3.58, [x, 0.72, 0], [Math.PI / 2, 0, 0], steelMaterial, 16));
  }
  for (let index = 0; index < 3; index += 1) {
    const z = -0.55 + index * 0.55;
    grateGroup.add(makeCylinder("Querstrebe", 0.018, 3.56, [0, 0.75, z], [0, 0, Math.PI / 2], steelMaterial, 12));
  }
  grill.add(grateGroup);

  const handleBar = makeCylinder("Tragebuegel", 0.055, 2.18, [0, 1.16, 1.28], [0, 0, Math.PI / 2], darkMaterial, 24);
  handleGroup.add(handleBar);
  handleGroup.add(makeCylinder("Buegel links", 0.045, 0.7, [-1.08, 0.82, 1.08], [0, 0, 0], darkMaterial, 20));
  handleGroup.add(makeCylinder("Buegel rechts", 0.045, 0.7, [1.08, 0.82, 1.08], [0, 0, 0], darkMaterial, 20));
  grill.add(handleGroup);

  const legPositions = [
    [-1.55, -0.82, -0.62],
    [1.55, -0.82, -0.62],
    [-1.55, -0.82, 0.62],
    [1.55, -0.82, 0.62],
  ];
  legPositions.forEach((position, index) => {
    const leg = makeCylinder(`Standfuss ${index + 1}`, 0.055, 1.7, position, [0, 0, 0], darkMaterial, 18);
    legGroup.add(leg);
  });
  grill.add(legGroup);

  [-1.32, 1.32].forEach((x) => {
    const wheel = makeCylinder("Transportrad", 0.26, 0.13, [x, -0.42, 1.02], [Math.PI / 2, 0, 0], darkMaterial, 32);
    wheelGroup.add(wheel);
    wheelGroup.add(makeCylinder("Radnabe", 0.08, 0.15, [x, -0.42, 1.04], [Math.PI / 2, 0, 0], steelMaterial, 20));
  });
  grill.add(wheelGroup);

  for (let index = 0; index < 7; index += 1) {
    const vent = makeCylinder(
      "Luftloch",
      0.055,
      0.018,
      [-1.2 + index * 0.4, 0.05, -0.915],
      [Math.PI / 2, 0, 0],
      darkMaterial,
      20,
    );
    grill.add(vent);
  }

  const coalPositions = [
    [-1.15, 0.44, -0.28],
    [-0.62, 0.49, 0.24],
    [-0.05, 0.45, -0.04],
    [0.55, 0.48, 0.3],
    [1.12, 0.43, -0.25],
  ];
  coalPositions.forEach((position, index) => {
    const geometry = index % 2 === 0 ? new THREE.DodecahedronGeometry(0.18, 0) : new THREE.IcosahedronGeometry(0.16, 0);
    const coal = new THREE.Mesh(geometry, index === 2 ? emberMaterial : coalMaterial);
    coal.position.set(...position);
    coal.rotation.set(index * 0.4, index * 0.24, index * 0.18);
    coal.castShadow = true;
    coal.receiveShadow = true;
    grill.add(coal);
  });

  packedOnlyGroup.add(makeBox("Packplatte", [3.7, 0.12, 1.35], [0, -0.52, 0], steelMaterial));
  packedOnlyGroup.visible = false;
  grill.add(packedOnlyGroup);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 64),
    new THREE.ShadowMaterial({ color: "#171614", opacity: 0.16 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.68;
  floor.receiveShadow = true;
  scene.add(floor);

  const resize = () => {
    const { clientWidth, clientHeight } = canvas;
    const width = Math.max(clientWidth, 320);
    const height = Math.max(clientHeight, 320);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const setPackedMode = (enabled) => {
    legGroup.visible = !enabled;
    wheelGroup.visible = !enabled;
    packedOnlyGroup.visible = enabled;
    grill.position.y = enabled ? 0.24 : 0;
    grill.rotation.x = enabled ? -0.1 : 0;
    controls.target.set(0, enabled ? 0.05 : 0.2, 0);
  };

  const updateZoom = (value) => {
    const percent = Number(value);
    zoomValue.textContent = `${percent}%`;
    const distance = 9.6 - (percent / 100) * 5.1;
    const direction = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).add(direction.multiplyScalar(distance));
    camera.updateProjectionMatrix();
  };

  swatches.forEach((button) => {
    button.addEventListener("click", () => {
      swatches.forEach((swatch) => swatch.classList.remove("active"));
      button.classList.add("active");
      bodyMaterial.color.set(button.dataset.color);
    });
  });

  toggleGrate?.addEventListener("change", (event) => {
    grateGroup.visible = event.currentTarget.checked;
  });

  toggleHandle?.addEventListener("change", (event) => {
    handleGroup.visible = event.currentTarget.checked;
  });

  togglePacked?.addEventListener("change", (event) => {
    setPackedMode(event.currentTarget.checked);
  });

  zoomRange?.addEventListener("input", (event) => {
    updateZoom(event.currentTarget.value);
  });

  autoRotateButton?.addEventListener("click", () => {
    controls.autoRotate = !controls.autoRotate;
    autoRotateButton.classList.toggle("active", controls.autoRotate);
  });

  resetButton?.addEventListener("click", () => {
    camera.position.set(5.2, 3.1, 6.4);
    controls.target.set(0, togglePacked?.checked ? 0.05 : 0.2, 0);
    controls.autoRotate = false;
    autoRotateButton?.classList.remove("active");
    zoomRange.value = "60";
    updateZoom(60);
    controls.update();
  });

  new ResizeObserver(resize).observe(canvas);
  resize();
  updateZoom(zoomRange?.value ?? 60);

  const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
}
