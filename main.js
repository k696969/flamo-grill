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
  camera.position.set(4.9, 3.2, 5.9);

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
  controls.minDistance = 4;
  controls.maxDistance = 9.8;
  controls.target.set(0, 0.28, 0);
  controls.autoRotateSpeed = 1.5;

  const shellMaterial = new THREE.MeshStandardMaterial({
    color: "#b9b6ad",
    metalness: 0.82,
    roughness: 0.24,
  });
  const darkerSteelMaterial = new THREE.MeshStandardMaterial({
    color: "#868780",
    metalness: 0.78,
    roughness: 0.32,
  });
  const brushedHighlightMaterial = new THREE.MeshStandardMaterial({
    color: "#d8d3c8",
    metalness: 0.86,
    roughness: 0.2,
  });
  const blackMetalMaterial = new THREE.MeshStandardMaterial({
    color: "#111111",
    metalness: 0.52,
    roughness: 0.3,
  });
  const darkInteriorMaterial = new THREE.MeshStandardMaterial({
    color: "#1d1b18",
    metalness: 0.36,
    roughness: 0.62,
  });
  const grateMaterial = new THREE.MeshStandardMaterial({
    color: "#080807",
    metalness: 0.58,
    roughness: 0.28,
  });
  const sausageMaterial = new THREE.MeshStandardMaterial({
    color: "#d99282",
    metalness: 0.02,
    roughness: 0.52,
  });
  const toastedMaterial = new THREE.MeshStandardMaterial({
    color: "#8d4f35",
    metalness: 0.01,
    roughness: 0.7,
  });
  const emberMaterial = new THREE.MeshStandardMaterial({
    color: "#ff7b2b",
    emissive: "#d93d1e",
    emissiveIntensity: 1.5,
    roughness: 0.58,
  });
  const flameYellowMaterial = new THREE.MeshBasicMaterial({
    color: "#ffd35a",
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const flameOrangeMaterial = new THREE.MeshBasicMaterial({
    color: "#ff6b24",
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
  });

  scene.add(new THREE.HemisphereLight("#fff8ed", "#4d5964", 2.9));

  const keyLight = new THREE.DirectionalLight("#fff1df", 4.4);
  keyLight.position.set(3.2, 5.2, 5.3);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight("#2266c7", 18, 12);
  rimLight.position.set(-3.4, 2.6, -2.6);
  scene.add(rimLight);

  const warmFireLight = new THREE.PointLight("#ff7b2b", 15, 5);
  warmFireLight.position.set(0, 1, 0.1);
  scene.add(warmFireLight);

  const grill = new THREE.Group();
  scene.add(grill);

  const shellGroup = new THREE.Group();
  const shelfGroup = new THREE.Group();
  const lidGroup = new THREE.Group();
  const handleGroup = new THREE.Group();
  const grateGroup = new THREE.Group();
  const foodGroup = new THREE.Group();
  const flameGroup = new THREE.Group();
  const packedOnlyGroup = new THREE.Group();

  const colorableParts = [];

  const makeBox = (name, size, position, material, group = grill) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  const makeCylinder = (name, radius, depth, position, rotation, material, segments = 32, group = grill) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, segments), material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  const addColorableBox = (name, size, position, material = shellMaterial, group = shellGroup) => {
    const part = makeBox(name, size, position, material, group);
    colorableParts.push(part);
    return part;
  };

  addColorableBox("Edelstahl-Korpus", [4.05, 1.25, 1.72], [0, -0.55, 0.08]);
  addColorableBox("Frontblende", [4.18, 0.92, 0.09], [0, -0.48, 0.99]);
  addColorableBox("Linke Seitenwand", [0.09, 1.1, 1.72], [-2.08, -0.46, 0.08]);
  addColorableBox("Rechte Seitenwand", [0.09, 1.1, 1.72], [2.08, -0.46, 0.08]);
  makeBox("Oberer schwarzer Rahmen", [4.18, 0.18, 1.88], [0, 0.2, 0.08], blackMetalMaterial, shellGroup);
  makeBox("Grillwanne innen", [3.72, 0.2, 1.42], [0, 0.42, 0.12], darkInteriorMaterial, shellGroup);
  makeBox("Frontkante Rost", [4.08, 0.2, 0.14], [0, 0.49, 1.02], blackMetalMaterial, shellGroup);
  makeBox("Rueckkante Rost", [4.08, 0.2, 0.14], [0, 0.49, -0.82], blackMetalMaterial, shellGroup);
  makeBox("Linker Rostrahmen", [0.14, 0.2, 1.78], [-2.03, 0.49, 0.1], blackMetalMaterial, shellGroup);
  makeBox("Rechter Rostrahmen", [0.14, 0.2, 1.78], [2.03, 0.49, 0.1], blackMetalMaterial, shellGroup);

  for (let index = 0; index < 6; index += 1) {
    makeCylinder(
      "Luftloch Front",
      0.055,
      0.025,
      [-1.25 + index * 0.5, -0.18, 1.045],
      [Math.PI / 2, 0, 0],
      blackMetalMaterial,
      20,
      shellGroup,
    );
  }

  [-2.7, 2.7].forEach((x, index) => {
    const shelf = addColorableBox(index === 0 ? "Linke Ablage" : "Rechte Ablage", [1.08, 0.13, 1.65], [x, 0.13, 0.1], shellMaterial, shelfGroup);
    shelf.rotation.z = index === 0 ? -0.015 : 0.015;
    makeBox("Ablagenkante vorne", [1.06, 0.1, 0.08], [x, 0.23, 0.93], brushedHighlightMaterial, shelfGroup);
    makeBox("Ablagenkante hinten", [1.06, 0.1, 0.08], [x, 0.23, -0.73], darkerSteelMaterial, shelfGroup);
  });

  makeBox("Zange Griff", [0.58, 0.09, 0.11], [2.73, 0.31, 0.68], blackMetalMaterial, shelfGroup);
  makeCylinder("Zange Spitze links", 0.018, 0.72, [2.48, 0.33, 0.42], [0.15, 0, 0.24], brushedHighlightMaterial, 10, shelfGroup);
  makeCylinder("Zange Spitze rechts", 0.018, 0.72, [2.62, 0.33, 0.42], [0.15, 0, 0.24], brushedHighlightMaterial, 10, shelfGroup);

  addColorableBox("Offene Haube aussen", [4.08, 1.38, 0.12], [0, 1.18, -0.88], shellMaterial, lidGroup);
  makeBox("Offene Haube innen", [3.55, 1.02, 0.08], [0, 1.13, -0.8], darkInteriorMaterial, lidGroup);
  makeBox("Hauben-Unterkante", [4.12, 0.16, 0.16], [0, 0.47, -0.82], blackMetalMaterial, lidGroup);
  makeCylinder("Thermometer Rand", 0.15, 0.025, [0, 1.2, -0.73], [Math.PI / 2, 0, 0], brushedHighlightMaterial, 40, lidGroup);
  makeCylinder("Thermometer Anzeige", 0.11, 0.03, [0, 1.2, -0.705], [Math.PI / 2, 0, 0], new THREE.MeshStandardMaterial({ color: "#eee8d8", roughness: 0.45 }), 40, lidGroup);
  makeBox("Lueftungsschieber Haube", [0.72, 0.1, 0.035], [0, 0.82, -0.69], blackMetalMaterial, lidGroup);

  makeCylinder("Haubengriff", 0.055, 1.1, [0, 1.84, -0.72], [0, 0, Math.PI / 2], blackMetalMaterial, 24, handleGroup);
  makeCylinder("Haubengriff links", 0.045, 0.32, [-0.55, 1.72, -0.73], [0, 0, 0], blackMetalMaterial, 18, handleGroup);
  makeCylinder("Haubengriff rechts", 0.045, 0.32, [0.55, 1.72, -0.73], [0, 0, 0], blackMetalMaterial, 18, handleGroup);
  makeCylinder("Seitengriff links", 0.04, 0.74, [-2.23, 0.58, 0.06], [Math.PI / 2, 0, 0], brushedHighlightMaterial, 18, handleGroup);
  makeCylinder("Seitengriff rechts", 0.04, 0.74, [2.23, 0.58, 0.06], [Math.PI / 2, 0, 0], brushedHighlightMaterial, 18, handleGroup);

  for (let index = 0; index < 9; index += 1) {
    const x = -1.55 + index * 0.39;
    makeCylinder("Schwarzer Roststab", 0.034, 1.78, [x, 0.66, 0.1], [Math.PI / 2, 0, 0], grateMaterial, 18, grateGroup);
  }
  for (let index = 0; index < 3; index += 1) {
    const z = -0.45 + index * 0.48;
    makeCylinder("Rost Querstrebe", 0.025, 3.35, [0, 0.69, z], [0, 0, Math.PI / 2], grateMaterial, 14, grateGroup);
  }

  for (let index = 0; index < 7; index += 1) {
    const sausage = makeCylinder(
      "Wuerstchen",
      0.095,
      0.62,
      [-0.9 + index * 0.3, 0.84, 0.28 + (index % 2) * 0.05],
      [0.08, 0.12, Math.PI / 2],
      sausageMaterial,
      24,
      foodGroup,
    );
    sausage.scale.x = 1 + (index % 3) * 0.06;
    makeCylinder(
      "Grillstreifen",
      0.012,
      0.19,
      [-0.9 + index * 0.3, 0.93, 0.29 + (index % 2) * 0.05],
      [Math.PI / 2, 0, 0],
      toastedMaterial,
      8,
      foodGroup,
    );
  }

  const coalPositions = [
    [-0.72, 0.5, -0.24],
    [-0.28, 0.51, 0.08],
    [0.24, 0.5, -0.18],
    [0.72, 0.5, 0.12],
  ];
  coalPositions.forEach((position, index) => {
    const geometry = index % 2 === 0 ? new THREE.DodecahedronGeometry(0.16, 0) : new THREE.IcosahedronGeometry(0.14, 0);
    const coal = new THREE.Mesh(geometry, index === 1 ? emberMaterial : darkInteriorMaterial);
    coal.position.set(...position);
    coal.rotation.set(index * 0.4, index * 0.24, index * 0.18);
    coal.castShadow = true;
    coal.receiveShadow = true;
    foodGroup.add(coal);
  });

  const flameShapes = [
    { scale: [0.34, 1.25, 0.34], position: [-0.2, 1.05, 0.1], material: flameOrangeMaterial },
    { scale: [0.24, 1, 0.24], position: [0.12, 1.05, 0.22], material: flameYellowMaterial },
    { scale: [0.2, 0.82, 0.2], position: [0.38, 0.95, -0.02], material: flameOrangeMaterial },
  ];
  flameShapes.forEach(({ scale, position, material }, index) => {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.25, 24), material);
    flame.name = `Flamme ${index + 1}`;
    flame.scale.set(...scale);
    flame.position.set(...position);
    flame.rotation.z = index % 2 === 0 ? -0.12 : 0.14;
    flame.renderOrder = 3;
    flameGroup.add(flame);
  });

  addColorableBox("Geschlossene Haube", [4.16, 0.3, 1.78], [0, 0.66, 0.08], shellMaterial, packedOnlyGroup);
  makeBox("Gefaltete Ablage links", [0.12, 0.95, 1.65], [-2.16, -0.28, 0.08], darkerSteelMaterial, packedOnlyGroup);
  makeBox("Gefaltete Ablage rechts", [0.12, 0.95, 1.65], [2.16, -0.28, 0.08], darkerSteelMaterial, packedOnlyGroup);
  makeCylinder("Packgriff", 0.05, 1, [0, 0.9, 0.1], [0, 0, Math.PI / 2], blackMetalMaterial, 22, packedOnlyGroup);
  packedOnlyGroup.visible = false;

  grill.add(shellGroup, shelfGroup, lidGroup, handleGroup, grateGroup, foodGroup, flameGroup, packedOnlyGroup);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.5, 64),
    new THREE.ShadowMaterial({ color: "#171614", opacity: 0.16 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.24;
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

  const applyBodyColor = (color) => {
    shellMaterial.color.set(color);
    colorableParts.forEach((part) => {
      part.material = shellMaterial;
    });
  };

  const setPackedMode = (enabled) => {
    shelfGroup.visible = !enabled;
    lidGroup.visible = !enabled;
    foodGroup.visible = !enabled;
    flameGroup.visible = !enabled;
    packedOnlyGroup.visible = enabled;
    grateGroup.visible = !enabled && Boolean(toggleGrate?.checked);
    grill.position.y = enabled ? 0.03 : 0;
    controls.target.set(0, enabled ? 0.05 : 0.28, 0);
  };

  const updateZoom = (value) => {
    const percent = Number(value);
    zoomValue.textContent = `${percent}%`;
    const distance = 9.5 - (percent / 100) * 5.1;
    const direction = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).add(direction.multiplyScalar(distance));
    camera.updateProjectionMatrix();
  };

  swatches.forEach((button) => {
    button.addEventListener("click", () => {
      swatches.forEach((swatch) => swatch.classList.remove("active"));
      button.classList.add("active");
      applyBodyColor(button.dataset.color);
    });
  });

  toggleGrate?.addEventListener("change", (event) => {
    grateGroup.visible = !togglePacked?.checked && event.currentTarget.checked;
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
    camera.position.set(4.9, 3.2, 5.9);
    controls.target.set(0, togglePacked?.checked ? 0.05 : 0.28, 0);
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
    const time = performance.now() * 0.001;
    flameGroup.children.forEach((flame, index) => {
      flame.scale.y = (index === 0 ? 1.25 : 1) + Math.sin(time * 4 + index) * 0.08;
      flame.rotation.y = Math.sin(time * 2.5 + index) * 0.18;
    });
    warmFireLight.intensity = flameGroup.visible ? 13 + Math.sin(time * 5) * 2 : 0;
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
}
