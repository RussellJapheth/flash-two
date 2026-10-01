<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import type { FoodItem } from '$lib/data/foodCartItems';

	interface Props {
		items: FoodItem[];
		activeTargetId: string | null;
		onSelectItem: (itemId: string, screenPos?: { x: number; y: number }) => void;
		isServeResult?: 'correct' | 'wrong' | null;
		onWebGLError?: (error: string) => void;
		roundIndex?: number;
		plateItemIds?: string[];
	}

	let {
		items,
		activeTargetId = null,
		onSelectItem,
		isServeResult = null,
		onWebGLError,
		roundIndex = 0,
		plateItemIds = []
	}: Props = $props();

	let containerEl: HTMLDivElement | null = $state(null);
	let canvasEl: HTMLCanvasElement | null = $state(null);
	let isLoadingModels = $state(true);
	let loadProgress = $state(0);
	let webglError = $state<string | null>(null);

	let renderer: THREE.WebGLRenderer | null = null;
	let scene: THREE.Scene | null = null;
	let camera: THREE.PerspectiveCamera | null = null;
	let animationFrameId: number | null = null;
	let resizeObserver: ResizeObserver | null = null;

	function isWebGLSupported(): boolean {
		try {
			const canvas = document.createElement('canvas');
			const gl =
				canvas.getContext('webgl2') ||
				canvas.getContext('webgl') ||
				canvas.getContext('experimental-webgl');
			return Boolean(gl);
		} catch {
			return false;
		}
	}

	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	// Groups & Meshes
	const itemGroups = new SvelteMap<string, THREE.Group>();
	const colliders: THREE.Mesh[] = [];
	let plateGroup: THREE.Group | null = null;
	const plateMeshes = new SvelteMap<string, THREE.Object3D>();
	let particleSystem: THREE.Points | null = null;
	let steamParticles: THREE.Points | null = null;

	interface Pedestrian {
		group: THREE.Group;
		leftLeg: THREE.Mesh;
		rightLeg: THREE.Mesh;
		leftArm: THREE.Mesh;
		rightArm: THREE.Mesh;
		speed: number;
		direction: 1 | -1;
		walkFrequency: number;
		baseY: number;
	}
	const pedestrians: Pedestrian[] = [];

	// Positions for counter pedestals (2 rows: Front row 5 items, Back row 6 items)
	function getPedestalPositions(total: number) {
		const positions: { x: number; y: number; z: number }[] = [];
		const frontCount = Math.min(5, Math.ceil(total / 2));
		const backCount = total - frontCount;

		// Front row (z = 0.22, y = 0.15) - 5 items with spacing 0.58
		const frontSpacing = 0.58;
		const frontStartX = -((frontCount - 1) * frontSpacing) / 2;
		for (let i = 0; i < frontCount; i++) {
			positions.push({
				x: frontStartX + i * frontSpacing,
				y: 0.15,
				z: 0.22
			});
		}

		// Back row (z = -0.62, slightly raised) - 6 items with spacing 0.50
		const backSpacing = 0.5;
		const backStartX = -((backCount - 1) * backSpacing) / 2;
		for (let i = 0; i < backCount; i++) {
			positions.push({
				x: backStartX + i * backSpacing,
				y: 0.42,
				z: -0.62
			});
		}

		return positions;
	}

	// Flying food animation state
	let flyingAnim: {
		startTime: number;
		duration: number;
		startPos: THREE.Vector3;
		endPos: THREE.Vector3;
		object: THREE.Object3D;
		onComplete?: () => void;
	} | null = null;

	// Plate slide serving animation state
	let plateSlideAnim: {
		startTime: number;
		duration: number;
		startZ: number;
		targetZ: number;
		phase: 'serve' | 'return';
	} | null = null;

	onMount(() => {
		if (!canvasEl || !containerEl) return;

		// 1. Scene with warm street market ambiance and gentle atmospheric fog
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0xf6ede2);
		scene.fog = new THREE.FogExp2(0xf6ede2, 0.032);

		// 2. Camera
		const width = containerEl.clientWidth || 400;
		const height = containerEl.clientHeight || 450;
		camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
		updateCameraAspect(width, height);

		// 3. Renderer
		if (!isWebGLSupported()) {
			webglError = 'WebGL 3D graphics is not supported or is disabled in your browser.';
			isLoadingModels = false;
			onWebGLError?.(webglError);
			return;
		}

		try {
			renderer = new THREE.WebGLRenderer({
				canvas: canvasEl,
				alpha: false,
				antialias: true,
				powerPreference: 'high-performance'
			});
			renderer.setSize(width, height);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 1.15;
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		} catch (err) {
			console.error('WebGLRenderer initialization failed:', err);
			webglError = 'Could not initialize WebGL 3D graphics acceleration.';
			isLoadingModels = false;
			onWebGLError?.(webglError);
			return;
		}

		// 4. Lighting
		setupLighting(scene);

		// 5. Living Street Background with Moving Everyday People
		buildStreetBackground(scene);

		// 6. Build Cart Counter & Stall Decor
		buildCartStructure(scene);

		// 7. Build Steam & Confetti Particle Systems
		steamParticles = createSteamSystem();
		scene.add(steamParticles);

		particleSystem = createConfettiSystem();
		scene.add(particleSystem);

		// 8. Load GLTF Models for Plate and Food Items
		loadModels();

		// 9. Event Listeners (Touch & Pointer)
		canvasEl.addEventListener('pointerdown', handlePointerDown);
		canvasEl.addEventListener('pointermove', handlePointerMove);

		// Resize observer
		resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const w = Math.floor(entry.contentRect.width);
				const h = Math.floor(entry.contentRect.height);
				if (w > 0 && h > 0) {
					updateCameraAspect(w, h);
					renderer?.setSize(w, h);
				}
			}
		});
		resizeObserver.observe(containerEl);

		// 10. Render Loop
		let prevTime = performance.now();
		const animate = () => {
			animationFrameId = requestAnimationFrame(animate);
			const now = performance.now();
			const dt = (now - prevTime) / 1000;
			prevTime = now;

			updateScene(now / 1000, dt);

			if (renderer && scene && camera) {
				renderer.render(scene, camera);
			}
		};
		animate();

		return () => {
			cleanup();
		};
	});

	function updateCameraAspect(width: number, height: number) {
		if (!camera) return;
		const aspect = width / height;
		camera.aspect = aspect;

		// Guaranteed 100% visible framing of cart (width ~3.5, height ~3.1, wheels & lanterns)
		// with generous headroom for the floating order card on mobile screens
		if (aspect < 0.55) {
			// Tall phone portrait (iPhone ~0.46, Galaxy ~0.45)
			camera.fov = 64;
			camera.position.set(0, 5.8, 9.2);
			camera.lookAt(0, 0.82, 0.1);
		} else if (aspect < 0.75) {
			// Standard phone portrait (~0.56-0.70)
			camera.fov = 56;
			camera.position.set(0, 5.2, 8.0);
			camera.lookAt(0, 0.85, 0.1);
		} else if (aspect < 1.0) {
			// Tablet portrait
			camera.fov = 48;
			camera.position.set(0, 4.6, 6.6);
			camera.lookAt(0, 0.88, 0.1);
		} else {
			// Desktop / landscape
			camera.fov = 40;
			camera.position.set(0, 3.8, 5.2);
			camera.lookAt(0, 0.9, 0.1);
		}
		camera.updateProjectionMatrix();
	}

	function setupLighting(s: THREE.Scene) {
		// Warm sunny ambient light matching daylight street food market
		const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.6);
		s.add(ambientLight);

		// Key directional sunlight casting warm soft shadows
		const dirLight = new THREE.DirectionalLight(0xfffae6, 2.4);
		dirLight.position.set(3.5, 8.5, 4.5);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 1024;
		dirLight.shadow.mapSize.height = 1024;
		dirLight.shadow.camera.near = 0.5;
		dirLight.shadow.camera.far = 16;
		dirLight.shadow.camera.left = -2.5;
		dirLight.shadow.camera.right = 2.5;
		dirLight.shadow.camera.top = 2.5;
		dirLight.shadow.camera.bottom = -2.5;
		dirLight.shadow.bias = -0.001;
		s.add(dirLight);

		// Soft sky fill light from left
		const fillLight = new THREE.DirectionalLight(0xffeed4, 1.0);
		fillLight.position.set(-4, 5, 2);
		s.add(fillLight);

		// Warm golden counter spotlight illuminating customer serving plate
		const plateLight = new THREE.PointLight(0xffa020, 1.6, 4);
		plateLight.position.set(0, 1.6, 0.85);
		s.add(plateLight);
	}

	function createSignboardTexture(text: string): THREE.CanvasTexture {
		const canvas = document.createElement('canvas');
		canvas.width = 512;
		canvas.height = 160;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.fillStyle = '#fef3c7'; // Ivory parchment
			ctx.fillRect(0, 0, 512, 160);

			// Brown outer border
			ctx.strokeStyle = '#78350f';
			ctx.lineWidth = 14;
			ctx.strokeRect(7, 7, 498, 146);

			// Red inner border
			ctx.strokeStyle = '#dc2626';
			ctx.lineWidth = 4;
			ctx.strokeRect(18, 18, 476, 124);

			// Chinese calligraphy text
			ctx.fillStyle = '#7f1d1d';
			ctx.font = 'bold 84px "Noto Serif SC", "Songti SC", "SimSun", serif, sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(text, 256, 82);
		}
		const texture = new THREE.CanvasTexture(canvas);
		texture.colorSpace = THREE.SRGBColorSpace;
		return texture;
	}

	function createCartWheel(x: number, y: number, z: number, s: THREE.Scene) {
		const wheelGroup = new THREE.Group();
		wheelGroup.position.set(x, y, z);

		const rimGeo = new THREE.TorusGeometry(0.35, 0.038, 12, 24);
		const woodMat = new THREE.MeshStandardMaterial({ color: 0x542611, roughness: 0.65 });
		const rim = new THREE.Mesh(rimGeo, woodMat);
		rim.rotation.y = Math.PI / 2;
		rim.castShadow = true;
		wheelGroup.add(rim);

		// Center Hub
		const hubGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.09, 16);
		const hub = new THREE.Mesh(hubGeo, woodMat);
		hub.rotation.z = Math.PI / 2;
		wheelGroup.add(hub);

		// Spokes
		const spokeGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.66, 8);
		for (let i = 0; i < 3; i++) {
			const spoke = new THREE.Mesh(spokeGeo, woodMat);
			spoke.rotation.x = (i * Math.PI) / 3;
			wheelGroup.add(spoke);
		}
		s.add(wheelGroup);
	}

	function buildStreetBackground(s: THREE.Scene) {
		// 1. Street Asphalt / Cobblestone Road
		const roadGeo = new THREE.BoxGeometry(26, 0.1, 5.0);
		const roadMat = new THREE.MeshStandardMaterial({
			color: 0x64748b,
			roughness: 0.8
		});
		const road = new THREE.Mesh(roadGeo, roadMat);
		road.position.set(0, -0.62, -3.2);
		road.receiveShadow = true;
		s.add(road);

		// Sidewalk Curb separating cart from street
		const curbGeo = new THREE.BoxGeometry(26, 0.08, 0.4);
		const curbMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.6 });
		const curb = new THREE.Mesh(curbGeo, curbMat);
		curb.position.set(0, -0.52, -1.0);
		s.add(curb);

		// 2. Distant Street Market Facades / Silhouette Buildings (Z = -5.0)
		const shopColors = [0x991b1b, 0xd97706, 0x065f46, 0x1e3a8a, 0x7c2d12];
		for (let i = 0; i < 5; i++) {
			const bldGeo = new THREE.BoxGeometry(3.6, 3.5, 0.6);
			const bldMat = new THREE.MeshStandardMaterial({
				color: 0xf3f4f6,
				roughness: 0.9
			});
			const bld = new THREE.Mesh(bldGeo, bldMat);
			const bx = -7.2 + i * 3.6;
			bld.position.set(bx, 1.2, -5.2);
			s.add(bld);

			// Warm Glowing Shop Window
			const winGeo = new THREE.BoxGeometry(2.4, 1.4, 0.1);
			const winMat = new THREE.MeshStandardMaterial({
				color: 0xfef08a,
				emissive: 0xfef08a,
				emissiveIntensity: 0.4,
				roughness: 0.3
			});
			const win = new THREE.Mesh(winGeo, winMat);
			win.position.set(bx, 0.9, -4.85);
			s.add(win);

			// Shop Awning
			const awnGeo = new THREE.BoxGeometry(2.8, 0.12, 0.8);
			const awnMat = new THREE.MeshStandardMaterial({
				color: shopColors[i % shopColors.length],
				roughness: 0.5
			});
			const awn = new THREE.Mesh(awnGeo, awnMat);
			awn.position.set(bx, 1.75, -4.6);
			awn.rotation.x = 0.25;
			s.add(awn);
		}

		// 3. Overhead Festoon Lights strung across street
		const cableGeo = new THREE.CylinderGeometry(0.008, 0.008, 16, 8);
		const cableMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
		const cable = new THREE.Mesh(cableGeo, cableMat);
		cable.rotation.z = Math.PI / 2;
		cable.position.set(0, 3.2, -2.8);
		s.add(cable);

		// Hanging Mini Lanterns on festoon cable
		const festoonColors = [0xef4444, 0xf59e0b, 0xef4444, 0xfbbf24, 0xef4444, 0xf59e0b];
		for (let i = 0; i < 6; i++) {
			const lx = -5.0 + i * 2.0;
			const lantGeo = new THREE.SphereGeometry(0.1, 10, 8);
			const lantMat = new THREE.MeshStandardMaterial({
				color: festoonColors[i],
				emissive: festoonColors[i],
				emissiveIntensity: 0.6
			});
			const lant = new THREE.Mesh(lantGeo, lantMat);
			lant.position.set(lx, 3.08, -2.8);
			s.add(lant);
		}

		// 4. Street Trees at Sides
		createStreetTree(s, -5.2, -0.55, -2.8);
		createStreetTree(s, 5.2, -0.55, -2.8);

		// 5. Everyday People Walking (7 pedestrians)
		const personConfigs = [
			{
				x: -5.5,
				z: -2.3,
				dir: 1 as const,
				outfit: 0x2563eb,
				skin: 0xfcd34d,
				hair: 0x1e293b,
				scale: 0.95
			},
			{
				x: -2.8,
				z: -3.4,
				dir: 1 as const,
				outfit: 0xdc2626,
				skin: 0xfbcfe8,
				hair: 0x3f3f46,
				scale: 1.0
			},
			{
				x: -0.5,
				z: -2.6,
				dir: -1 as const,
				outfit: 0x059669,
				skin: 0xfde047,
				hair: 0x18181b,
				scale: 0.9
			},
			{
				x: 1.8,
				z: -3.6,
				dir: 1 as const,
				outfit: 0xd97706,
				skin: 0xfcd34d,
				hair: 0x78350f,
				scale: 1.05
			},
			{
				x: 4.2,
				z: -2.4,
				dir: -1 as const,
				outfit: 0x7c3aed,
				skin: 0xfde047,
				hair: 0x09090b,
				scale: 0.92
			},
			{
				x: 6.0,
				z: -3.2,
				dir: -1 as const,
				outfit: 0xe11d48,
				skin: 0xfbcfe8,
				hair: 0x52525b,
				scale: 0.98
			},
			{
				x: -4.0,
				z: -3.8,
				dir: 1 as const,
				outfit: 0x0891b2,
				skin: 0xfcd34d,
				hair: 0x1e293b,
				scale: 0.85
			}
		];

		personConfigs.forEach((cfg) => {
			const ped = createPedestrian(
				cfg.x,
				cfg.z,
				cfg.dir,
				cfg.outfit,
				cfg.skin,
				cfg.hair,
				cfg.scale
			);
			s.add(ped.group);
			pedestrians.push(ped);
		});
	}

	function createStreetTree(s: THREE.Scene, x: number, y: number, z: number) {
		const treeGroup = new THREE.Group();
		treeGroup.position.set(x, y, z);

		// Trunk
		const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.8, 8);
		const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3818, roughness: 0.8 });
		const trunk = new THREE.Mesh(trunkGeo, trunkMat);
		trunk.position.y = 0.9;
		treeGroup.add(trunk);

		// Low-poly Foliage Spheres
		const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
		const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 1), foliageMat);
		f1.position.set(0, 2.0, 0);
		treeGroup.add(f1);

		const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 1), foliageMat);
		f2.position.set(0.3, 2.4, 0.2);
		treeGroup.add(f2);

		s.add(treeGroup);
	}

	function createPedestrian(
		x: number,
		z: number,
		direction: 1 | -1,
		outfitColor: number,
		skinTone: number,
		hairColor: number,
		scale = 1.0
	): Pedestrian {
		const group = new THREE.Group();
		group.position.set(x, -0.55, z);
		group.scale.set(scale, scale, scale);

		// Torso / Coat
		const torsoGeo = new THREE.CylinderGeometry(0.1, 0.13, 0.42, 10);
		const torsoMat = new THREE.MeshStandardMaterial({ color: outfitColor, roughness: 0.6 });
		const torso = new THREE.Mesh(torsoGeo, torsoMat);
		torso.position.y = 0.56;
		torso.castShadow = true;
		group.add(torso);

		// Head
		const headGeo = new THREE.SphereGeometry(0.1, 12, 10);
		const headMat = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.5 });
		const head = new THREE.Mesh(headGeo, headMat);
		head.position.y = 0.84;
		group.add(head);

		// Hair
		const hairGeo = new THREE.SphereGeometry(0.108, 10, 8, 0, Math.PI * 2, 0, Math.PI / 1.8);
		const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7 });
		const hair = new THREE.Mesh(hairGeo, hairMat);
		hair.position.y = 0.86;
		group.add(hair);

		// Legs (pivot at hip y=0.38)
		const legGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.38, 8);
		legGeo.translate(0, -0.19, 0);
		const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

		const leftLeg = new THREE.Mesh(legGeo, legMat);
		leftLeg.position.set(-0.06, 0.38, 0);
		group.add(leftLeg);

		const rightLeg = new THREE.Mesh(legGeo, legMat);
		rightLeg.position.set(0.06, 0.38, 0);
		group.add(rightLeg);

		// Arms (pivot at shoulder y=0.72)
		const armGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.32, 8);
		armGeo.translate(0, -0.16, 0);
		const armMat = new THREE.MeshStandardMaterial({ color: outfitColor, roughness: 0.6 });

		const leftArm = new THREE.Mesh(armGeo, armMat);
		leftArm.position.set(-0.15, 0.72, 0);
		group.add(leftArm);

		const rightArm = new THREE.Mesh(armGeo, armMat);
		rightArm.position.set(0.15, 0.72, 0);
		group.add(rightArm);

		// Face walking direction
		group.rotation.y = direction === 1 ? Math.PI / 2 : -Math.PI / 2;

		const speed = 0.75 + Math.random() * 0.65;
		const walkFrequency = 5.5 + Math.random() * 2.0;

		return {
			group,
			leftLeg,
			rightLeg,
			leftArm,
			rightArm,
			speed,
			direction,
			walkFrequency,
			baseY: -0.55
		};
	}

	function buildCartStructure(s: THREE.Scene) {
		// 1. Main Counter Table Top (Warm rich wood, compact 3.5 width for mobile clearance)
		const tableGeo = new THREE.BoxGeometry(3.5, 0.16, 2.1);
		const tableMat = new THREE.MeshStandardMaterial({
			color: 0xc87533,
			roughness: 0.4,
			metalness: 0.05
		});
		const table = new THREE.Mesh(tableGeo, tableMat);
		table.position.set(0, -0.08, -0.05);
		table.receiveShadow = true;
		s.add(table);

		// Front decorative brass rail
		const railGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.4, 16);
		const brassMat = new THREE.MeshStandardMaterial({
			color: 0xe6b840,
			roughness: 0.25,
			metalness: 0.85
		});
		const rail = new THREE.Mesh(railGeo, brassMat);
		rail.rotation.z = Math.PI / 2;
		rail.position.set(0, 0.03, 0.98);
		s.add(rail);

		// 2. Back Shelf (Tier 2 riser)
		const shelfGeo = new THREE.BoxGeometry(3.2, 0.22, 0.85);
		const shelfMat = new THREE.MeshStandardMaterial({
			color: 0xa45220,
			roughness: 0.45,
			metalness: 0.05
		});
		const shelf = new THREE.Mesh(shelfGeo, shelfMat);
		shelf.position.set(0, 0.12, -0.62);
		shelf.receiveShadow = true;
		s.add(shelf);

		// 3. Cart Lower Body & Side Wooden Wheels
		const bodyGeo = new THREE.BoxGeometry(2.8, 0.65, 1.5);
		const bodyMat = new THREE.MeshStandardMaterial({
			color: 0x8b3e1c,
			roughness: 0.6
		});
		const body = new THREE.Mesh(bodyGeo, bodyMat);
		body.position.set(0, -0.48, -0.05);
		body.receiveShadow = true;
		s.add(body);

		// Lower fruit/veggie crate shelf (like food-cart-icon.jpg)
		const crateShelfGeo = new THREE.BoxGeometry(2.2, 0.05, 0.4);
		const crateShelfMat = new THREE.MeshStandardMaterial({ color: 0x693214, roughness: 0.7 });
		const crateShelf = new THREE.Mesh(crateShelfGeo, crateShelfMat);
		crateShelf.position.set(0, -0.58, 0.8);
		s.add(crateShelf);

		// 3 Crate boxes on lower shelf (Green, Orange, Yellow)
		const crateColors = [0x15803d, 0xea580c, 0xb45309];
		for (let i = 0; i < 3; i++) {
			const crateGeo = new THREE.BoxGeometry(0.62, 0.12, 0.32);
			const crateMat = new THREE.MeshStandardMaterial({
				color: crateColors[i],
				roughness: 0.6
			});
			const crate = new THREE.Mesh(crateGeo, crateMat);
			crate.position.set(-0.72 + i * 0.72, -0.48, 0.8);
			s.add(crate);
		}

		// Cart Spoked Wheels on Left and Right sides
		createCartWheel(-1.48, -0.48, -0.05, s);
		createCartWheel(1.48, -0.48, -0.05, s);

		// 4. Colorful Festive Triangular Bunting Flags (under front counter edge)
		const flagColors = [0xef4444, 0xf59e0b, 0x3b82f6, 0x10b981, 0xf97316];
		const numFlags = 10;
		const flagWidth = 0.3;
		const startX = -((numFlags - 1) * flagWidth) / 2;
		for (let i = 0; i < numFlags; i++) {
			const flagGeo = new THREE.BufferGeometry();
			const fx = startX + i * flagWidth;
			const w = 0.28;
			const h = 0.22;
			const vertices = new Float32Array([fx - w / 2, 0, 0, fx + w / 2, 0, 0, fx, -h, 0]);
			flagGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
			flagGeo.computeVertexNormals();
			const flagMat = new THREE.MeshStandardMaterial({
				color: flagColors[i % flagColors.length],
				side: THREE.DoubleSide,
				roughness: 0.5
			});
			const flag = new THREE.Mesh(flagGeo, flagMat);
			flag.position.set(0, -0.02, 1.0);
			s.add(flag);
		}

		// 5. 4 Wooden Canopy Pillars (Rich red-brown lacquer)
		const postMat = new THREE.MeshStandardMaterial({
			color: 0x78350f,
			roughness: 0.5
		});
		const postGeo = new THREE.CylinderGeometry(0.04, 0.045, 2.7, 12);

		const postPositions = [
			{ x: -1.48, z: 0.65 },
			{ x: 1.48, z: 0.65 },
			{ x: -1.48, z: -0.75 },
			{ x: 1.48, z: -0.75 }
		];

		postPositions.forEach((pos) => {
			const post = new THREE.Mesh(postGeo, postMat);
			post.position.set(pos.x, 1.25, pos.z);
			post.castShadow = true;
			s.add(post);
		});

		// 6. Chinese Roof Canopy (Gabled red tiles with golden trim, matching icon)
		const roofRidgeGeo = new THREE.BoxGeometry(3.6, 0.14, 0.2);
		const goldTrimMat = new THREE.MeshStandardMaterial({
			color: 0xd97706,
			roughness: 0.35,
			metalness: 0.3
		});
		const roofRidge = new THREE.Mesh(roofRidgeGeo, goldTrimMat);
		roofRidge.position.set(0, 2.55, -0.05);
		s.add(roofRidge);

		const roofTileMat = new THREE.MeshStandardMaterial({
			color: 0xb91c1c, // Crimson red Chinese tiles
			roughness: 0.35,
			metalness: 0.1
		});

		// Front roof slope
		const frontRoofGeo = new THREE.BoxGeometry(3.5, 0.08, 1.05);
		const frontRoof = new THREE.Mesh(frontRoofGeo, roofTileMat);
		frontRoof.position.set(0, 2.32, 0.4);
		frontRoof.rotation.x = 0.44;
		frontRoof.castShadow = true;
		s.add(frontRoof);

		// Back roof slope
		const backRoofGeo = new THREE.BoxGeometry(3.5, 0.08, 1.05);
		const backRoof = new THREE.Mesh(backRoofGeo, roofTileMat);
		backRoof.position.set(0, 2.32, -0.5);
		backRoof.rotation.x = -0.44;
		backRoof.castShadow = true;
		s.add(backRoof);

		// 7. Hanging Wooden Signboard ("点心坊" / Dim Sum Stall)
		const signGeo = new THREE.BoxGeometry(1.4, 0.42, 0.05);
		const signMat = new THREE.MeshStandardMaterial({
			map: createSignboardTexture('点心坊'),
			roughness: 0.4
		});
		const sign = new THREE.Mesh(signGeo, signMat);
		sign.position.set(0, 1.95, 0.75);
		s.add(sign);

		// 8. Hanging Red Festival Lanterns from Front Posts
		createLantern(s, -1.45, 1.85, 0.65);
		createLantern(s, 1.45, 1.85, 0.65);
	}

	function createLantern(s: THREE.Scene, x: number, y: number, z: number) {
		const group = new THREE.Group();
		group.position.set(x, y, z);

		// Cord
		const cordGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.35, 8);
		const cordMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
		const cord = new THREE.Mesh(cordGeo, cordMat);
		cord.position.y = 0.18;
		group.add(cord);

		// Lantern Body (Golden red sphere)
		const bodyGeo = new THREE.SphereGeometry(0.18, 16, 12);
		bodyGeo.scale(1, 1.35, 1);
		const bodyMat = new THREE.MeshStandardMaterial({
			color: 0xe02424,
			emissive: 0x991b1b,
			emissiveIntensity: 0.6,
			roughness: 0.35
		});
		const body = new THREE.Mesh(bodyGeo, bodyMat);
		group.add(body);

		// Gold bands top and bottom
		const ringGeo = new THREE.TorusGeometry(0.11, 0.02, 8, 16);
		const goldMat = new THREE.MeshStandardMaterial({
			color: 0xfbbf24,
			metalness: 0.9,
			roughness: 0.2
		});
		const topRing = new THREE.Mesh(ringGeo, goldMat);
		topRing.rotation.x = Math.PI / 2;
		topRing.position.y = 0.2;
		group.add(topRing);

		const botRing = new THREE.Mesh(ringGeo, goldMat);
		botRing.rotation.x = Math.PI / 2;
		botRing.position.y = -0.2;
		group.add(botRing);

		// Small warm point light inside lantern
		const light = new THREE.PointLight(0xff5533, 1.0, 2.5);
		light.position.set(0, 0, 0);
		group.add(light);

		s.add(group);
	}

	function createSteamSystem(): THREE.Points {
		const count = 45;
		const geo = new THREE.BufferGeometry();
		const positions = new Float32Array(count * 3);
		const alphas = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			positions[i * 3] = (Math.random() - 0.5) * 2.5;
			positions[i * 3 + 1] = 0.3 + Math.random() * 1.5;
			positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
			alphas[i] = Math.random();
		}

		geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

		// Soft white particles
		const mat = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 0.08,
			transparent: true,
			opacity: 0.35,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		});

		return new THREE.Points(geo, mat);
	}

	function createConfettiSystem(): THREE.Points {
		const count = 80;
		const geo = new THREE.BufferGeometry();
		const positions = new Float32Array(count * 3);
		const colors = new Float32Array(count * 3);

		const palette = [
			new THREE.Color(0xf59e0b), // gold
			new THREE.Color(0x10b981), // emerald
			new THREE.Color(0xef4444), // ruby
			new THREE.Color(0x6366f1) // indigo
		];

		for (let i = 0; i < count; i++) {
			positions[i * 3] = 0;
			positions[i * 3 + 1] = -10; // hidden until triggered
			positions[i * 3 + 2] = 0;

			const col = palette[Math.floor(Math.random() * palette.length)];
			colors[i * 3] = col.r;
			colors[i * 3 + 1] = col.g;
			colors[i * 3 + 2] = col.b;
		}

		geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

		const mat = new THREE.PointsMaterial({
			size: 0.12,
			vertexColors: true,
			transparent: true,
			opacity: 0,
			blending: THREE.AdditiveBlending,
			depthWrite: false
		});

		const points = new THREE.Points(geo, mat);
		points.userData = { active: false, time: 0, velocities: [] };
		return points;
	}

	function triggerConfettiBurst() {
		if (!particleSystem) return;
		const count = 80;
		const posAttr = particleSystem.geometry.attributes.position as THREE.BufferAttribute;
		const velocities: THREE.Vector3[] = [];

		for (let i = 0; i < count; i++) {
			posAttr.setXYZ(i, 0, 0.45, 0.95); // burst from plate
			const angle = Math.random() * Math.PI * 2;
			const speed = 1.2 + Math.random() * 2.0;
			velocities.push(
				new THREE.Vector3(
					Math.cos(angle) * speed * 0.6,
					1.8 + Math.random() * 2.2,
					Math.sin(angle) * speed * 0.6
				)
			);
		}
		posAttr.needsUpdate = true;

		(particleSystem.material as THREE.PointsMaterial).opacity = 0.9;
		particleSystem.userData = {
			active: true,
			time: 0,
			velocities
		};
	}

	async function loadModels() {
		if (!scene) return;
		isLoadingModels = true;
		const manager = new THREE.LoadingManager();
		manager.setURLModifier((url) => {
			if (url.includes('Textures/colormap.png') && !url.startsWith('/')) {
				return '/models/food-cart/Textures/colormap.png';
			}
			return url;
		});
		manager.onError = (url) => {
			console.warn('Food cart asset resource warning:', url);
		};
		const loader = new GLTFLoader(manager);
		loader.setPath('');
		loader.setResourcePath('/models/food-cart/');

		try {
			// 1. Load Serving Plate (plate-dinner.glb)
			plateGroup = new THREE.Group();
			plateGroup.position.set(0, 0.02, 0.95);

			// Serving base mat ring
			const matGeo = new THREE.CylinderGeometry(0.64, 0.64, 0.02, 32);
			const matMat = new THREE.MeshStandardMaterial({
				color: 0x854d0e,
				roughness: 0.65
			});
			const matMesh = new THREE.Mesh(matGeo, matMat);
			matMesh.receiveShadow = true;
			plateGroup.add(matMesh);

			// Load plate model
			try {
				const plateGltf = await loader.loadAsync('/models/food-cart/plate-dinner.glb');
				const pMesh = plateGltf.scene;
				pMesh.scale.set(0.65, 0.65, 0.65);
				pMesh.position.set(0, 0.015, 0);
				pMesh.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});
				plateGroup.add(pMesh);
			} catch (e) {
				console.warn('Plate model fallback:', e);
				const fallbackPlate = new THREE.Mesh(
					new THREE.CylinderGeometry(0.55, 0.42, 0.05, 32),
					new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
				);
				fallbackPlate.position.y = 0.03;
				plateGroup.add(fallbackPlate);
			}

			// Add Chopsticks beside plate
			try {
				const chopGltf = await loader.loadAsync('/models/food-cart/chopstick.glb');
				const chopMesh = chopGltf.scene;
				chopMesh.scale.set(0.7, 0.7, 0.7);
				chopMesh.position.set(0.7, 0.03, 0);
				chopMesh.rotation.y = -Math.PI / 4;
				plateGroup.add(chopMesh);
			} catch {
				// optional decorative
			}

			scene.add(plateGroup);

			// 2. Load Food Items
			const positions = getPedestalPositions(items.length);
			let loadedCount = 0;

			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const pos = positions[i];

				const group = new THREE.Group();
				group.position.set(pos.x, pos.y, pos.z);
				group.userData = {
					itemId: item.id,
					targetX: pos.x,
					targetZ: pos.z,
					baseY: pos.y,
					baseScale: 1.0,
					targetScale: 1.0,
					rotOffset: i * 0.4
				};

				// Pedestal Base (Stylized wooden saucer)
				const baseGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.04, 24);
				const baseMat = new THREE.MeshStandardMaterial({
					color: 0x92400e,
					roughness: 0.6
				});
				const baseMesh = new THREE.Mesh(baseGeo, baseMat);
				baseMesh.receiveShadow = true;
				group.add(baseMesh);

				// Glowing ring on pedestal
				const glowGeo = new THREE.RingGeometry(0.26, 0.31, 24);
				const glowMat = new THREE.MeshBasicMaterial({
					color: 0xfef08a,
					side: THREE.DoubleSide,
					transparent: true,
					opacity: 0.4
				});
				const glowRing = new THREE.Mesh(glowGeo, glowMat);
				glowRing.rotation.x = -Math.PI / 2;
				glowRing.position.y = 0.025;
				group.add(glowRing);

				// Invisible Touch Target Sphere Collider for ultra-forgiving mobile taps
				const colliderGeo = new THREE.SphereGeometry(0.38, 12, 8);
				const colliderMat = new THREE.MeshBasicMaterial({ visible: false });
				const collider = new THREE.Mesh(colliderGeo, colliderMat);
				collider.position.y = 0.25;
				collider.userData = { itemId: item.id };
				group.add(collider);
				colliders.push(collider);

				// Load 3D Food Model
				try {
					const gltf = await loader.loadAsync(item.modelPath);
					const model = gltf.scene;
					const s = item.scale;
					model.scale.set(s, s, s);
					model.position.y = 0.02 + (item.offsetY || 0);

					model.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							child.castShadow = true;
							child.receiveShadow = true;
							child.userData = { itemId: item.id };
						}
					});

					group.add(model);
				} catch (err) {
					console.error(`Failed to load model ${item.modelPath}:`, err);
					// Geometric fallback
					const fallback = new THREE.Mesh(
						new THREE.DodecahedronGeometry(0.25),
						new THREE.MeshStandardMaterial({ color: 0xf97316 })
					);
					fallback.position.y = 0.25;
					group.add(fallback);
				}

				scene.add(group);
				itemGroups.set(item.id, group);

				loadedCount++;
				loadProgress = Math.round((loadedCount / items.length) * 100);
			}
		} catch (err) {
			console.error('Model initialization error:', err);
		} finally {
			isLoadingModels = false;
		}
	}

	function handlePointerDown(e: PointerEvent) {
		if (!canvasEl || !camera || isLoadingModels) return;

		const rect = canvasEl.getBoundingClientRect();
		pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

		raycaster.setFromCamera(pointer, camera);
		const intersects = raycaster.intersectObjects(colliders, true);

		if (intersects.length > 0) {
			const hit = intersects[0].object;
			const id = hit.userData?.itemId;
			if (id) {
				onSelectItem(id, { x: e.clientX, y: e.clientY });
			}
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (!canvasEl || !camera || isLoadingModels) return;
		const rect = canvasEl.getBoundingClientRect();
		pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

		raycaster.setFromCamera(pointer, camera);
		const intersects = raycaster.intersectObjects(colliders, true);

		if (intersects.length > 0) {
			canvasEl.style.cursor = 'pointer';
			const id = intersects[0].object.userData?.itemId;
			itemGroups.forEach((grp, grpId) => {
				grp.userData.targetScale = grpId === id ? 1.15 : 1.0;
			});
		} else {
			canvasEl.style.cursor = 'default';
			itemGroups.forEach((grp) => {
				grp.userData.targetScale = 1.0;
			});
		}
	}

	function getPlateSlotOffset(slotIndex: number): THREE.Vector3 {
		switch (slotIndex) {
			case 0:
				return new THREE.Vector3(-0.16, 0.05, 0.02);
			case 1:
				return new THREE.Vector3(0.16, 0.05, 0.02);
			case 2:
				return new THREE.Vector3(0, 0.05, -0.16);
			default:
				return new THREE.Vector3(0, 0.05, 0.12);
		}
	}

	function shuffleItemPositions() {
		if (itemGroups.size === 0) return;
		const positions = getPedestalPositions(items.length);
		const shuffled = [...positions].sort(() => Math.random() - 0.5);
		let i = 0;
		itemGroups.forEach((group) => {
			const pos = shuffled[i % shuffled.length];
			group.userData.targetX = pos.x;
			group.userData.targetZ = pos.z;
			group.userData.baseY = pos.y;
			i++;
		});
	}

	function triggerPlateServeAnimation() {
		if (!plateGroup) return;
		plateSlideAnim = {
			startTime: performance.now(),
			duration: 750,
			startZ: 0.95,
			targetZ: 2.3, // Slide towards camera into customer's hands
			phase: 'serve'
		};
	}

	// Multi-dish plate assembly effect
	$effect(() => {
		if (!scene || !plateGroup) return;

		// 1. Detect if plateItemIds was reset to empty
		if (plateItemIds.length === 0) {
			plateMeshes.forEach((mesh) => {
				plateGroup?.remove(mesh);
			});
			plateMeshes.clear();
			return;
		}

		const currentPlate = plateGroup;
		const currentScene = scene;

		// 2. Add newly served items to plate
		plateItemIds.forEach((itemId, idx) => {
			if (plateMeshes.has(itemId)) return;

			const originGroup = itemGroups.get(itemId);
			if (!originGroup) return;

			let modelToFly: THREE.Object3D | null = null;
			originGroup.traverse((child) => {
				if (child instanceof THREE.Group && child !== originGroup && !modelToFly) {
					modelToFly = child.clone();
				}
			});

			if (!modelToFly && originGroup.children.length > 0) {
				modelToFly = originGroup.children[originGroup.children.length - 1].clone();
			}
			if (!modelToFly) return;

			// Scale slightly smaller to fit multi-dish plate
			modelToFly.scale.multiplyScalar(0.72);

			const slotOffset = getPlateSlotOffset(idx);
			modelToFly.position.copy(slotOffset);

			currentPlate.add(modelToFly);
			plateMeshes.set(itemId, modelToFly);

			// Trigger flying visual from pedestal to plate slot
			const startPos = new THREE.Vector3().copy(originGroup.position);
			startPos.y += 0.2;
			const endPos = new THREE.Vector3().copy(currentPlate.position).add(slotOffset);

			// Temporary flying clone in scene
			const flyingClone = modelToFly.clone();
			currentScene.add(flyingClone);
			modelToFly.visible = false; // Hide on plate until flying completes

			flyingAnim = {
				startTime: performance.now(),
				duration: 420,
				startPos,
				endPos,
				object: flyingClone,
				onComplete: () => {
					currentScene.remove(flyingClone);
					if (modelToFly) modelToFly.visible = true;
				}
			};
		});
	});

	// Trigger round change: customer served, plate slides out, items shuffle!
	let prevRound = 0;
	$effect(() => {
		if (roundIndex !== prevRound) {
			prevRound = roundIndex;
			triggerPlateServeAnimation();
			shuffleItemPositions();
		}
	});

	// Trigger confetti burst on correct serve
	$effect(() => {
		if (isServeResult === 'correct') {
			triggerConfettiBurst();
		}
	});

	function updateScene(time: number, dt: number) {
		// 1. Everyday Pedestrians Walking Along Street
		pedestrians.forEach((ped) => {
			ped.group.position.x += ped.direction * ped.speed * dt;
			if (ped.direction === 1 && ped.group.position.x > 11.5) {
				ped.group.position.x = -11.5;
			} else if (ped.direction === -1 && ped.group.position.x < -11.5) {
				ped.group.position.x = 11.5;
			}

			// Natural walking limb swing & vertical bobbing
			const swing = Math.sin(time * ped.walkFrequency) * 0.55;
			ped.leftLeg.rotation.x = swing;
			ped.rightLeg.rotation.x = -swing;
			ped.leftArm.rotation.x = -swing * 0.75;
			ped.rightArm.rotation.x = swing * 0.75;
			ped.group.position.y = ped.baseY + Math.abs(Math.sin(time * ped.walkFrequency)) * 0.04;
		});

		// 2. Smooth Pedestal Shuffling Glide & Idle Bobbing for Food Items
		itemGroups.forEach((group, id) => {
			// Interpolate smoothly to shuffled pedestal targets
			if (group.userData.targetX !== undefined) {
				group.position.x += (group.userData.targetX - group.position.x) * 0.08;
			}
			if (group.userData.targetZ !== undefined) {
				group.position.z += (group.userData.targetZ - group.position.z) * 0.08;
			}

			const isTarget = id === activeTargetId;
			const bobSpeed = isTarget ? 3.5 : 2.0;
			const bobHeight = isTarget ? 0.06 : 0.025;

			const targetY =
				group.userData.baseY + Math.sin(time * bobSpeed + group.userData.rotOffset) * bobHeight;
			group.position.y += (targetY - group.position.y) * 0.15;

			// Smooth scale interpolation on hover/touch
			const curScale = group.scale.x;
			const targetScale = group.userData.targetScale || 1.0;
			const newScale = curScale + (targetScale - curScale) * 0.2;
			group.scale.set(newScale, newScale, newScale);

			// Gentle rotation
			group.rotation.y += isTarget ? 0.015 : 0.005;
		});

		// 3. Plate Serving Slide Out & Return Animation
		if (plateSlideAnim && plateGroup) {
			const elapsed = performance.now() - plateSlideAnim.startTime;
			const t = Math.min(1.0, elapsed / plateSlideAnim.duration);

			if (plateSlideAnim.phase === 'serve') {
				const ease = Math.sin((t * Math.PI) / 2);
				plateGroup.position.z = THREE.MathUtils.lerp(
					plateSlideAnim.startZ,
					plateSlideAnim.targetZ,
					ease
				);

				if (t >= 1.0) {
					// Plate reached customer hands: clear dishes & return fresh plate
					plateMeshes.forEach((mesh) => plateGroup?.remove(mesh));
					plateMeshes.clear();
					plateSlideAnim = {
						startTime: performance.now(),
						duration: 350,
						startZ: -0.1,
						targetZ: 0.95,
						phase: 'return'
					};
				}
			} else if (plateSlideAnim.phase === 'return') {
				const ease = 1 - Math.pow(1 - t, 3);
				plateGroup.position.z = THREE.MathUtils.lerp(
					plateSlideAnim.startZ,
					plateSlideAnim.targetZ,
					ease
				);
				if (t >= 1.0) {
					plateGroup.position.z = 0.95;
					plateSlideAnim = null;
				}
			}
		}

		// 4. Flying Food Parabolic Arc Animation
		if (flyingAnim) {
			const elapsed = performance.now() - flyingAnim.startTime;
			const t = Math.min(1.0, elapsed / flyingAnim.duration);

			// Parabolic Arc: x and z linear, y quadratic apex
			const easeT = 1 - Math.pow(1 - t, 3);
			const curX = THREE.MathUtils.lerp(flyingAnim.startPos.x, flyingAnim.endPos.x, easeT);
			const curZ = THREE.MathUtils.lerp(flyingAnim.startPos.z, flyingAnim.endPos.z, easeT);
			const arcHeight = Math.sin(easeT * Math.PI) * 1.3;
			const curY =
				THREE.MathUtils.lerp(flyingAnim.startPos.y, flyingAnim.endPos.y, easeT) + arcHeight;

			flyingAnim.object.position.set(curX, curY, curZ);
			flyingAnim.object.rotation.y += 0.15;
			flyingAnim.object.rotation.x = Math.sin(easeT * Math.PI) * 0.4;

			if (t >= 1.0) {
				flyingAnim.onComplete?.();
				flyingAnim = null;
			}
		}

		// 5. Steam Particles Rising
		if (steamParticles) {
			const posAttr = steamParticles.geometry.attributes.position as THREE.BufferAttribute;
			for (let i = 0; i < posAttr.count; i++) {
				let y = posAttr.getY(i) + dt * 0.35;
				if (y > 2.2) {
					y = 0.35;
					posAttr.setX(i, (Math.random() - 0.5) * 2.8);
					posAttr.setZ(i, (Math.random() - 0.5) * 1.6);
				}
				posAttr.setY(i, y);
			}
			posAttr.needsUpdate = true;
		}

		// 6. Confetti Burst
		if (particleSystem && particleSystem.userData.active) {
			particleSystem.userData.time += dt;
			const posAttr = particleSystem.geometry.attributes.position as THREE.BufferAttribute;
			const vels = particleSystem.userData.velocities as THREE.Vector3[];

			for (let i = 0; i < posAttr.count; i++) {
				const vel = vels[i];
				vel.y -= 4.5 * dt; // gravity
				posAttr.setX(i, posAttr.getX(i) + vel.x * dt);
				posAttr.setY(i, posAttr.getY(i) + vel.y * dt);
				posAttr.setZ(i, posAttr.getZ(i) + vel.z * dt);
			}
			posAttr.needsUpdate = true;

			const mat = particleSystem.material as THREE.PointsMaterial;
			mat.opacity = Math.max(0, 1 - particleSystem.userData.time / 1.1);

			if (particleSystem.userData.time >= 1.2) {
				particleSystem.userData.active = false;
				mat.opacity = 0;
			}
		}
	}

	function cleanup() {
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
		}
		if (resizeObserver) {
			resizeObserver.disconnect();
		}

		// Dispose Three.js objects to prevent GPU memory leaks
		colliders.length = 0;
		itemGroups.clear();

		if (scene) {
			scene.traverse((obj) => {
				if (obj instanceof THREE.Mesh) {
					obj.geometry?.dispose();
					if (Array.isArray(obj.material)) {
						obj.material.forEach((m) => m.dispose());
					} else {
						obj.material?.dispose();
					}
				}
			});
		}

		if (renderer) {
			renderer.dispose();
			renderer.forceContextLoss();
		}
	}
</script>

<div
	bind:this={containerEl}
	class="relative h-full w-full touch-manipulation overflow-hidden select-none"
>
	{#if webglError}
		<!-- Pretty fallback error card with interactive 2D dish stall -->
		<div
			class="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-b from-amber-500/10 via-slate-900/80 to-slate-950/95 p-4 text-white backdrop-blur-md"
		>
			<div
				class="w-full max-w-md rounded-3xl border border-amber-300/30 bg-slate-900/90 p-5 text-center shadow-xl"
			>
				<div
					class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/20 text-amber-300"
				>
					<span class="text-2xl">🍜</span>
				</div>
				<h3 class="font-headline text-lg font-black tracking-tight text-amber-200">
					3D Food Stall Unavailable
				</h3>
				<p class="mt-1 text-xs leading-relaxed text-slate-300">
					{webglError}
				</p>
				<div class="mt-4 border-t border-slate-700/60 pt-3">
					<p class="mb-2 text-[11px] font-bold tracking-wider text-amber-300 uppercase">
						Tap a Dish Below to Serve:
					</p>
					<div class="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto p-1 sm:grid-cols-4">
						{#each items as item (item.id)}
							<button
								type="button"
								onclick={() => onSelectItem(item.id)}
								class="flex flex-col items-center justify-center rounded-xl border p-2 transition-all active:scale-95 {item.id ===
								activeTargetId
									? 'border-amber-400 bg-amber-500/30 text-amber-100 shadow-sm'
									: 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'}"
							>
								<span class="text-xl">{item.emoji}</span>
								<span class="mt-0.5 font-headline text-xs font-bold">{item.pinyin}</span>
								<span class="text-[10px] text-slate-400">{item.english}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{:else}
		<canvas bind:this={canvasEl} class="block h-full w-full outline-none"></canvas>

		{#if isLoadingModels}
			<!-- Loading state overlay with progress -->
			<div
				class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 text-white backdrop-blur-xs"
			>
				<div
					class="flex h-14 w-14 animate-bounce items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/20 text-amber-300"
				>
					<span class="text-2xl">🥟</span>
				</div>
				<p class="mt-3 font-headline text-sm font-bold tracking-wide">
					Heating up the Steam Baskets...
				</p>
				<div class="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-slate-800">
					<div
						class="h-full bg-linear-to-r from-amber-400 to-orange-500 transition-all duration-200"
						style="width: {loadProgress}%"
					></div>
				</div>
				<span class="mt-1 font-sans text-[11px] text-slate-300">{loadProgress}%</span>
			</div>
		{/if}
	{/if}
</div>
