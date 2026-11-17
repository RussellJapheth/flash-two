import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

let renderer = null;
let scene = null;
let camera = null;

function ensureRenderer(size) {
	if (renderer) return;
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
	renderer.setPixelRatio(1);
	renderer.setSize(size, size, false);
	renderer.setClearColor(0x000000, 0);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;

	scene = new THREE.Scene();
	camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);

	const key = new THREE.DirectionalLight(0xffffff, 2.1);
	key.position.set(2.4, 3.4, 2.8);
	scene.add(key);

	const fill = new THREE.DirectionalLight(0xffffff, 1.1);
	fill.position.set(-2.6, 1.6, -1.4);
	scene.add(fill);

	scene.add(new THREE.HemisphereLight(0xffffff, 0xd8dee9, 1.5));
}

/**
 * Renders one GLB to a transparent square PNG data URL.
 * `elevationDeg` tilts the camera so sprites read as a 3/4 view.
 */
window.bakeSprite = async function bakeSprite(url, size, elevationDeg) {
	ensureRenderer(size);
	renderer.setSize(size, size, false);

	const gltf = await loader.loadAsync(url);
	const root = gltf.scene;

	const box = new THREE.Box3().setFromObject(root);
	if (box.isEmpty()) throw new Error(`Empty model bounds: ${url}`);
	const center = box.getCenter(new THREE.Vector3());
	const size3 = box.getSize(new THREE.Vector3());

	const elevation = THREE.MathUtils.degToRad(elevationDeg);
	const azimuth = THREE.MathUtils.degToRad(35);
	const direction = new THREE.Vector3(
		Math.sin(azimuth) * Math.cos(elevation),
		Math.sin(elevation),
		Math.cos(azimuth) * Math.cos(elevation)
	);
	const distance = size3.length() * 2;

	camera.position.copy(center).addScaledVector(direction, distance);
	camera.up.set(0, 1, 0);
	camera.lookAt(center);
	camera.updateMatrixWorld(true);

	// Fit the frustum to the model's silhouette in camera space so nothing is clipped
	// and every sprite fills the frame consistently.
	const cameraSpace = new THREE.Matrix4().copy(camera.matrixWorldInverse);
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;
	const corner = new THREE.Vector3();
	for (let i = 0; i < 8; i += 1) {
		corner.set(
			i & 1 ? box.max.x : box.min.x,
			i & 2 ? box.max.y : box.min.y,
			i & 4 ? box.max.z : box.min.z
		);
		corner.applyMatrix4(cameraSpace);
		minX = Math.min(minX, corner.x);
		maxX = Math.max(maxX, corner.x);
		minY = Math.min(minY, corner.y);
		maxY = Math.max(maxY, corner.y);
	}

	const margin = 1.04;
	const halfWidth = ((maxX - minX) / 2) * margin;
	const halfHeight = ((maxY - minY) / 2) * margin;
	const midX = (minX + maxX) / 2;
	const midY = (minY + maxY) / 2;

	camera.left = midX - halfWidth;
	camera.right = midX + halfWidth;
	camera.top = midY + halfHeight;
	camera.bottom = midY - halfHeight;
	camera.near = Math.max(0.01, distance - size3.length());
	camera.far = distance + size3.length();
	camera.updateProjectionMatrix();

	scene.add(root);
	renderer.render(scene, camera);
	const dataUrl = renderer.domElement.toDataURL('image/png');
	scene.remove(root);

	root.traverse((child) => {
		if (child.isMesh) {
			child.geometry.dispose();
			const materials = Array.isArray(child.material) ? child.material : [child.material];
			for (const material of materials) {
				for (const value of Object.values(material)) {
					if (value && value.isTexture) value.dispose();
				}
				material.dispose();
			}
		}
	});

	return dataUrl;
};

window.bakeReady = true;
