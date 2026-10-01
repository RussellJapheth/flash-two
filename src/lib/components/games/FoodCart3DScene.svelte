<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import type { FoodItem } from '$lib/data/foodCartItems';

	interface Props {
		items: FoodItem[];
		activeTargetId: string | null;
		onSelectItem: (itemId: string) => void;
		servedItemId?: string | null;
		isServeResult?: 'correct' | 'wrong' | null;
	}

	let {
		items,
		activeTargetId = null,
		onSelectItem,
		servedItemId = null,
		isServeResult = null
	}: Props = $props();

	let containerEl: HTMLDivElement | null = $state(null);
	let canvasEl: HTMLCanvasElement | null = $state(null);
	let isLoadingModels = $state(true);
	let loadProgress = $state(0);

	let renderer: THREE.WebGLRenderer | null = null;
	let scene: THREE.Scene | null = null;
	let camera: THREE.PerspectiveCamera | null = null;
	let animationFrameId: number | null = null;
	let resizeObserver: ResizeObserver | null = null;

	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	// Groups & Meshes
	const itemGroups = new SvelteMap<string, THREE.Group>();
	const colliders: THREE.Mesh[] = [];
	let plateGroup: THREE.Group | null = null;
	let servedMesh: THREE.Object3D | null = null;
	let particleSystem: THREE.Points | null = null;
	let steamParticles: THREE.Points | null = null;

	// Positions for counter pedestals (2 rows: Front row 5 items, Back row 6 items)
	function getPedestalPositions(total: number) {
		const positions: { x: number; y: number; z: number }[] = [];
		// Front arc: slightly lower, closer to camera
		const frontCount = Math.min(5, Math.ceil(total / 2));
		const backCount = total - frontCount;

		// Front row (z = 0.15)
		const frontSpacing = 0.95;
		const frontStartX = -((frontCount - 1) * frontSpacing) / 2;
		for (let i = 0; i < frontCount; i++) {
			positions.push({
				x: frontStartX + i * frontSpacing,
				y: 0.15,
				z: 0.25
			});
		}

		// Back row (z = -0.75, slightly raised)
		const backSpacing = 0.85;
		const backStartX = -((backCount - 1) * backSpacing) / 2;
		for (let i = 0; i < backCount; i++) {
			positions.push({
				x: backStartX + i * backSpacing,
				y: 0.45,
				z: -0.75
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
	} | null = null;

	onMount(() => {
		if (!canvasEl || !containerEl) return;

		// 1. Scene
		scene = new THREE.Scene();
		scene.background = null; // transparent canvas

		// 2. Camera
		const width = containerEl.clientWidth || 400;
		const height = containerEl.clientHeight || 450;
		camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
		updateCameraAspect(width, height);

		// 3. Renderer
		renderer = new THREE.WebGLRenderer({
			canvas: canvasEl,
			alpha: true,
			antialias: true,
			powerPreference: 'high-performance'
		});
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.15;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		// 4. Lighting
		setupLighting(scene);

		// 5. Build Cart Counter & Stall Decor
		buildCartStructure(scene);

		// 6. Build Steam & Confetti Particle Systems
		steamParticles = createSteamSystem();
		scene.add(steamParticles);

		particleSystem = createConfettiSystem();
		scene.add(particleSystem);

		// 7. Load GLTF Models for Plate and Food Items
		loadModels();

		// 8. Event Listeners (Touch & Pointer)
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

		// 9. Render Loop
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

		// On narrow mobile portrait screens, pull camera back slightly and increase FOV so side items are framed
		if (aspect < 0.75) {
			camera.fov = 50;
			camera.position.set(0, 4.4, 5.0);
		} else if (aspect < 1.0) {
			camera.fov = 46;
			camera.position.set(0, 4.0, 4.6);
		} else {
			camera.fov = 40;
			camera.position.set(0, 3.6, 4.2);
		}
		camera.lookAt(0, 0.25, 0.05);
		camera.updateProjectionMatrix();
	}

	function setupLighting(s: THREE.Scene) {
		// Warm ambient light
		const ambientLight = new THREE.AmbientLight(0xfffaed, 1.4);
		s.add(ambientLight);

		// Key directional light casting soft shadows
		const dirLight = new THREE.DirectionalLight(0xffeedd, 2.2);
		dirLight.position.set(3, 7, 4);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 1024;
		dirLight.shadow.mapSize.height = 1024;
		dirLight.shadow.camera.near = 0.5;
		dirLight.shadow.camera.far = 15;
		dirLight.shadow.camera.left = -3;
		dirLight.shadow.camera.right = 3;
		dirLight.shadow.camera.top = 3;
		dirLight.shadow.camera.bottom = -3;
		dirLight.shadow.bias = -0.001;
		s.add(dirLight);

		// Soft cyan rim light from back left
		const rimLight = new THREE.DirectionalLight(0xd4e9ff, 0.8);
		rimLight.position.set(-4, 3, -3);
		s.add(rimLight);

		// Golden counter spotlight illuminating customer serving plate
		const plateLight = new THREE.PointLight(0xffaa33, 1.8, 4);
		plateLight.position.set(0, 1.6, 1.25);
		s.add(plateLight);
	}

	function buildCartStructure(s: THREE.Scene) {
		// 1. Main Counter Table Top (Bamboo / warm rich wood)
		const tableGeo = new THREE.BoxGeometry(5.2, 0.16, 2.8);
		const tableMat = new THREE.MeshStandardMaterial({
			color: 0xc88344,
			roughness: 0.45,
			metalness: 0.05
		});
		const table = new THREE.Mesh(tableGeo, tableMat);
		table.position.set(0, -0.08, -0.2);
		table.receiveShadow = true;
		s.add(table);

		// Front decorative brass rail
		const railGeo = new THREE.CylinderGeometry(0.025, 0.025, 5.0, 16);
		const brassMat = new THREE.MeshStandardMaterial({
			color: 0xe6b840,
			roughness: 0.25,
			metalness: 0.85
		});
		const rail = new THREE.Mesh(railGeo, brassMat);
		rail.rotation.z = Math.PI / 2;
		rail.position.set(0, 0.03, 1.15);
		s.add(rail);

		// 2. Back Shelf (Tier 2 riser)
		const shelfGeo = new THREE.BoxGeometry(4.8, 0.22, 1.1);
		const shelfMat = new THREE.MeshStandardMaterial({
			color: 0xaa662f,
			roughness: 0.5,
			metalness: 0.05
		});
		const shelf = new THREE.Mesh(shelfGeo, shelfMat);
		shelf.position.set(0, 0.12, -0.75);
		shelf.receiveShadow = true;
		s.add(shelf);

		// 3. Side Pillars with Hanging Red Festival Lanterns
		const postMat = new THREE.MeshStandardMaterial({
			color: 0x7c3f1d,
			roughness: 0.6
		});
		const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.2, 12);

		const leftPost = new THREE.Mesh(postGeo, postMat);
		leftPost.position.set(-2.3, 1.4, -0.4);
		s.add(leftPost);

		const rightPost = new THREE.Mesh(postGeo, postMat);
		rightPost.position.set(2.3, 1.4, -0.4);
		s.add(rightPost);

		// Lanterns
		createLantern(s, -2.15, 2.3, -0.25);
		createLantern(s, 2.15, 2.3, -0.25);
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
		const bodyGeo = new THREE.SphereGeometry(0.2, 16, 12);
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
		const ringGeo = new THREE.TorusGeometry(0.12, 0.02, 8, 16);
		const goldMat = new THREE.MeshStandardMaterial({
			color: 0xfbbf24,
			metalness: 0.9,
			roughness: 0.2
		});
		const topRing = new THREE.Mesh(ringGeo, goldMat);
		topRing.rotation.x = Math.PI / 2;
		topRing.position.y = 0.22;
		group.add(topRing);

		const botRing = new THREE.Mesh(ringGeo, goldMat);
		botRing.rotation.x = Math.PI / 2;
		botRing.position.y = -0.22;
		group.add(botRing);

		// Small warm point light inside lantern
		const light = new THREE.PointLight(0xff5533, 0.8, 2.5);
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
			posAttr.setXYZ(i, 0, 0.45, 1.15); // burst from plate
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
		const loader = new GLTFLoader();

		try {
			// 1. Load Serving Plate (plate-dinner.glb)
			plateGroup = new THREE.Group();
			plateGroup.position.set(0, 0.02, 1.15);

			// Serving base mat ring
			const matGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.02, 32);
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
					baseY: pos.y,
					baseScale: 1.0,
					targetScale: 1.0,
					rotOffset: i * 0.4
				};

				// Pedestal Base (Stylized wooden saucer)
				const baseGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.04, 24);
				const baseMat = new THREE.MeshStandardMaterial({
					color: 0x92400e,
					roughness: 0.6
				});
				const baseMesh = new THREE.Mesh(baseGeo, baseMat);
				baseMesh.receiveShadow = true;
				group.add(baseMesh);

				// Glowing ring on pedestal
				const glowGeo = new THREE.RingGeometry(0.34, 0.38, 24);
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
				const colliderGeo = new THREE.SphereGeometry(0.46, 12, 8);
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
				onSelectItem(id);
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

	// Flying dish animation when customer is served
	$effect(() => {
		if (!servedItemId || !scene) return;

		const originGroup = itemGroups.get(servedItemId);
		if (!originGroup) return;

		// Clone the food model for the fly animation
		let modelToFly: THREE.Object3D | null = null;
		originGroup.traverse((child) => {
			if (child instanceof THREE.Group && child !== originGroup && !modelToFly) {
				modelToFly = child.clone();
			}
		});

		if (!modelToFly) {
			// Fallback: clone child at index 3
			modelToFly = originGroup.children[originGroup.children.length - 1].clone();
		}

		if (servedMesh) {
			scene.remove(servedMesh);
			servedMesh = null;
		}

		servedMesh = modelToFly;
		scene.add(servedMesh);

		const startPos = new THREE.Vector3().copy(originGroup.position);
		startPos.y += 0.2;
		const endPos = new THREE.Vector3(0, 0.15, 1.15); // on customer plate

		flyingAnim = {
			startTime: performance.now(),
			duration: 450, // ms
			startPos,
			endPos,
			object: servedMesh
		};
	});

	// Trigger confetti burst on correct serve
	$effect(() => {
		if (isServeResult === 'correct') {
			triggerConfettiBurst();
		}
	});

	function updateScene(time: number, dt: number) {
		// 1. Idle Bobbing & Hover Scale for Food Items
		itemGroups.forEach((group, id) => {
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

		// 2. Flying Food Parabolic Arc Animation
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
				// Landed!
				flyingAnim.object.position.copy(flyingAnim.endPos);
				flyingAnim = null;
			}
		}

		// 3. Steam Particles Rising
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

		// 4. Confetti Burst
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
</div>
