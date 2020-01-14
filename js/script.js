import * as THREE from '../vendor/three.js-master/build/three.module.js';
import Stats from '../vendor/three.js-master/examples/jsm/libs/stats.module.js';
import { OrbitControls } from '../vendor/three.js-master/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from '../vendor/three.js-master/examples/jsm/loaders/FBXLoader.js';


const Scene = {
	vars: {
		container: null,
		scene: null,
		renderer: null,
		camera: null,
		stats: null,
		controls: null,
		texture: null,
		mouse: new THREE.Vector2(),
		raycaster: new THREE.Raycaster(),
		animSpeed: null,
		animPercent: 0.00,
		text: "DAWIN",
		starGeo: null,
		stars: null,
		shots: [],
		audioLoader: null,
	},
	animate: () => {
		requestAnimationFrame(Scene.animate);
		Scene.vars.raycaster.setFromCamera(Scene.vars.mouse, Scene.vars.camera);

		Scene.customAnimation();

		if (Scene.vars.spaceshipGroup !== undefined) {
			window.addEventListener("click", function (event) {
				if (event.defaultPrevented) {
					return; // Should do nothing if the default action has been cancelled
				}
	
				var handled = false;
				if (event.type === "click") {
					// Handle the event with KeyboardEvent.key and set handled true.
					Scene.shot(Scene.vars.spaceshipGroup);
					handled = true;
				}
				if (handled) {
					// Suppress "double action" if event handled
					event.preventDefault();
				}
			}, true);
			window.addEventListener("keydown", function (event) {
				if (event.defaultPrevented) {
					return; // Should do nothing if the default action has been cancelled
				}
				var handled = false;
				if (event.code === "Space") {
					// Handle the event with KeyboardEvent.key and set handled true.
					Scene.spinAnim(Scene.vars.spaceshipGroup);
					handled = true;
				}

				if (handled) {
					// Suppress "double action" if event handled
					event.preventDefault();
				}
			});
			Scene.vars.spaceshipGroup.position.x = (Scene.vars.mouse.y * 200) - 60;
			Scene.vars.spaceshipGroup.position.z = -(Scene.vars.mouse.x * 200);
		}



		if (Scene.vars.shots.length) {
			Scene.vars.shots.forEach(function (value, i) {
				Scene.animShot(value, i);
			});
		}
		Scene.vars.starGeo.vertices.forEach(p => {
			p.velocity += p.acceleration
			p.y -= p.velocity;

			if (p.y < -200) {
				p.y = 200;
				p.velocity = 0;
			}
		});

		Scene.animEnnemy(Scene.vars.ennemy, Math.random() * 600);
		Scene.animEnnemy(Scene.vars.ennemy2, -Math.random() * 600);
		Scene.vars.starGeo.verticesNeedUpdate = true;

		Scene.render();
	},
	shot: (group) => {
		// Group de laser
		let laserGroup = new THREE.Group();

		// Les lasers placés par la methode place Laser
		let laserHD = Scene.placeLaser(group, 70, 60, 70);
		let laserHG = Scene.placeLaser(group, 70, 60, -55);
		let laserBG = Scene.placeLaser(group, 70, 10, -55);
		let laserBD = Scene.placeLaser(group, 70, 10, 70);

		// AJout dans le groupe
		laserGroup.add(laserHD);
		laserGroup.add(laserHG);
		laserGroup.add(laserBG);
		laserGroup.add(laserBD);

		group.add(laserGroup);
		Scene.vars.laserGroup = laserGroup;
		Scene.vars.shots.push(laserGroup);
		Scene.loadSound('../sounds/shot.ogg', false);
	},
	placeLaser: (group, x, y, z) => {
		// Création du mesh laser (un rectangle)
		var geometry = new THREE.BoxGeometry(60, 1, 1);
		var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		var laser = new THREE.Mesh(geometry, material);

		laser.position.x = (group.position.y / 200) + x; //profondeur
		laser.position.y = (group.position.y / 200) + y; //haut
		laser.position.z = (group.position.y / 200) + z; //droite gauche

		return laser;
	},
	animShot: (group, i) => {
		group.position.x += 30;
		if (group.position.y > 800) {
			Scene.vars.shots.splice(i, 1);
			Scene.vars.scene.remove(group);
		}
	},
	animEnnemy: (group, x) => {
		group.position.y -= 10;
		if (group.position.y < -600) {
			group.position.x = x;
			group.position.y = 4000;
		}
	},
	spinAnim: (group) => {
		var cpt = 0;
		let id = window.setInterval(() => {
			cpt ++;
			group.rotation.y += 6 * Math.PI / 180;
			console.log(cpt);
			if(cpt === 60) {
				window.clearInterval(id);
			} 
		}, 10);
	},
	render: () => {
		Scene.vars.renderer.render(Scene.vars.scene, Scene.vars.camera);
		Scene.vars.stats.update();
	},
	customAnimation: () => {
		let vars = Scene.vars;

		if (vars.animSpeed === null) {
			return;
		}

		vars.animPercent = vars.animPercent + vars.animSpeed;

		if (vars.animPercent < 0) {
			vars.animPercent = 0;
			return;
		}
		if (vars.animPercent > 1) {
			vars.animPercent = 1;
			return;
		}

		if (vars.animPercent <= 0.33) {
		}

		if (vars.animPercent >= 0.20 && vars.animPercent <= 0.75) {
			let percent = (vars.animPercent - 0.2) / 0.55;
		} else if (vars.animPercent < 0.20) {
		}

		if (vars.animPercent >= 0.40) {
			let percent = (vars.animPercent - 0.4) / 0.6;
		} else if (vars.animPercent < 0.70) {
		}
	},
	loadFBX: (file, scale, position, rotation, color, namespace, callback) => {
		let vars = Scene.vars;
		let loader = new FBXLoader();

		if (file === undefined) {
			return;
		}

		loader.load('./fbx/' + file, (object) => {

			object.traverse((child) => {
				if (child.isMesh) {

					child.castShadow = true;
					child.receiveShadow = true;

					if (namespace === "spaceships") {
						child.material = new THREE.MeshBasicMaterial({
							map: new THREE.TextureLoader().load('../texture/spaceship.jpg')
						});
					}

					if (namespace === "statuette") {
						child.material = new THREE.MeshStandardMaterial({
							color: new THREE.Color(color),
							roughness: .3,
							metalness: .6
						})
					}
				}
			});

			object.position.x = position[0];
			object.position.y = position[1];
			object.position.z = position[2];

			object.rotation.x = rotation[0];
			object.rotation.y = rotation[1];
			object.rotation.z = rotation[2];

			object.scale.x = object.scale.y = object.scale.z = scale;
			Scene.vars[namespace] = object;

			callback();
		});

	},
	loadText: (text, scale, position, rotation, color, namespace, callback) => {
		let loader = new THREE.FontLoader();

		if (text === undefined || text === "") {
			return;
		}

		loader.load('./vendor/three.js-master/examples/fonts/helvetiker_regular.typeface.json', (font) => {
			let geometry = new THREE.TextGeometry(text, {
				font,
				size: 1,
				height: 0.1,
				curveSegments: 1,
				bevelEnabled: false
			});

			geometry.computeBoundingBox();
			let offset = geometry.boundingBox.getCenter().negate();
			geometry.translate(offset.x, offset.y, offset.z);

			let material = new THREE.MeshBasicMaterial({
				color: new THREE.Color(color)
			});

			let mesh = new THREE.Mesh(geometry, material);

			mesh.position.x = position[0];
			mesh.position.y = position[1];
			mesh.position.z = position[2];

			mesh.rotation.x = rotation[0];
			mesh.rotation.y = rotation[1];
			mesh.rotation.z = rotation[2];

			mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

			Scene.vars[namespace] = mesh;

			callback();
		});
	},
	loadSound: (file, infinit) => {
		/**
		 * Play sound
		 */
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		Scene.vars.camera.add(listener);

		// create a global audio source
		var sound = new THREE.Audio(listener);

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load(file, function (buffer) {
			sound.setBuffer(buffer);
			sound.setLoop(infinit);
			sound.setVolume(0.5);
			sound.play();
		});
	},
	onWindowResize: () => {
		let vars = Scene.vars;
		vars.camera.aspect = window.innerWidth / window.innerHeight;
		vars.camera.updateProjectionMatrix();
		vars.renderer.setSize(window.innerWidth, window.innerHeight);
	},
	onMouseMove: (event) => {
		Scene.vars.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		Scene.vars.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	},
	init: () => {
		let vars = Scene.vars;

		// Préparer le container pour la scène
		vars.container = document.createElement('div');
		vars.container.classList.add('fullscreen');
		document.body.appendChild(vars.container);

		// ajout de la scène
		vars.scene = new THREE.Scene();
		vars.scene.background = new THREE.Color(0x000000);
		vars.scene.fog = new THREE.Fog(vars.scene.background, 500, 3000);

		// paramétrage du moteur de rendu
		vars.renderer = new THREE.WebGLRenderer({ antialias: true });
		vars.renderer.setPixelRatio(window.devicePixelRatio);
		vars.renderer.setSize(window.innerWidth, window.innerHeight);

		vars.renderer.shadowMap.enabled = true;
		vars.renderer.shadowMapSoft = true;

		vars.container.appendChild(vars.renderer.domElement);

		// ajout de la caméra
		vars.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
		vars.camera.position.y = -250;
		vars.camera.position.x = Math.PI / 2;


		// ajout de la lumière
		const lightIntensityHemisphere = .5;
		let light = new THREE.HemisphereLight(0xFFFFFF, 0x444444, lightIntensityHemisphere);
		light.position.set(0, 700, 0);
		vars.scene.add(light);

		// ajout des directionelles
		const lightIntensity = .8;
		const d = 1000;
		let light1 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light1.position.set(0, 700, 0);
		light1.castShadow = true;
		light1.shadow.camera.left = -d;
		light1.shadow.camera.right = d;
		light1.shadow.camera.top = d;
		light1.shadow.camera.bottom = -d;
		light1.shadow.camera.far = 2000;
		light1.shadow.mapSize.width = 4096;
		light1.shadow.mapSize.height = 4096;
		vars.scene.add(light1);
		// let helper = new THREE.DirectionalLightHelper(light1, 5);
		// vars.scene.add(helper);

		let light2 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light2.position.set(-400, 200, 400);
		light2.castShadow = true;
		light2.shadow.camera.left = -d;
		light2.shadow.camera.right = d;
		light2.shadow.camera.top = d;
		light2.shadow.camera.bottom = -d;
		light2.shadow.camera.far = 2000;
		light2.shadow.mapSize.width = 4096;
		light2.shadow.mapSize.height = 4096;
		vars.scene.add(light2);
		// let helper2 = new THREE.DirectionalLightHelper(light2, 5);
		// vars.scene.add(helper2);

		let light3 = new THREE.DirectionalLight(0xFFFFFF, lightIntensity);
		light3.position.set(400, 200, 400);
		light3.castShadow = true;
		light3.shadow.camera.left = -d;
		light3.shadow.camera.right = d;
		light3.shadow.camera.top = d;
		light3.shadow.camera.bottom = -d;
		light3.shadow.camera.far = 2000;
		light3.shadow.mapSize.width = 4096;
		light3.shadow.mapSize.height = 4096;
		vars.scene.add(light3);
		// let helper3 = new THREE.DirectionalLightHelper(light3, 5);
		// vars.scene.add(helper3);

		let planeMaterial = new THREE.ShadowMaterial();
		planeMaterial.opacity = 0.07;
		let shadowPlane = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(2000, 2000),
			planeMaterial);
		shadowPlane.rotation.x = -Math.PI / 2;
		shadowPlane.receiveShadow = true;

		vars.scene.add(shadowPlane);

		// ajout de la texture helper du sol
		// let grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
		// grid.material.opacity = 0.2;
		// grid.material.transparent = true;
		// vars.scene.add(grid);


		let hash = document.location.hash.substr(1);
		if (hash.length !== 0) {
			let text = hash.substring();
			Scene.vars.text = decodeURI(text);
		}

		Scene.loadFBX("Star Destroyer.fbx", 2, [45, 22, 0], [0, 0, 0], 0x000000, 'ennemy', () => {
			Scene.loadFBX("Star Destroyer.fbx", 2, [45, 22, 0], [0, 0, 0], 0x000000, 'ennemy2', () => {
				Scene.loadFBX("xwing.fbx", 1, [45, 22, 0], [0, 0, 0], 0x225236, 'spaceship', () => {
					let vars = Scene.vars;

					let spaceship = new THREE.Group();
					spaceship.add(vars.spaceship);
					spaceship.position.z = -60;
					spaceship.position.x = -60;
					spaceship.position.y = 0;
					spaceship.rotation.z = Math.PI / 2;
					spaceship.rotation.y = Math.PI;

					vars.ennemy.position.z = 300;
					vars.ennemy.position.x = -350;
					vars.ennemy.position.y = 530;
					vars.ennemy.rotation.y = Math.PI;
					vars.ennemy.rotation.z = Math.PI / 2;

					vars.ennemy2.position.z = 600;
					vars.ennemy2.position.x = 800;
					vars.ennemy2.position.y = 4000;
					vars.ennemy2.rotation.y = Math.PI;
					vars.ennemy2.rotation.z = Math.PI / 2;

					vars.scene.add(spaceship);
					vars.scene.add(vars.ennemy);
					vars.scene.add(vars.ennemy2);
					vars.spaceshipGroup = spaceship;

					let elem = document.querySelector('#loading');
					elem.parentNode.removeChild(elem);
				});
			});
		});

		// ajout des controles
		vars.controls = new OrbitControls(vars.camera, vars.renderer.domElement);
		vars.controls.maxDistance = 600;
		vars.controls.minPolarAngle = 11 * Math.PI / 6;
		vars.controls.minAzimuthAngle = Math.PI / 2;
		vars.controls.maxAzimuthAngle = Math.PI / 2;
		vars.controls.target.set(0, 100, 0);
		vars.controls.update();

		window.addEventListener('resize', Scene.onWindowResize, false);
		window.addEventListener('mousemove', Scene.onMouseMove, false);

		vars.stats = new Stats();
		vars.container.appendChild(vars.stats.dom);

		/**
		 * Create stars
		 */
		vars.starGeo = new THREE.Geometry();
		for (let i = 0; i < 6000; i++) {
			let star = new THREE.Vector3(
				Math.random() * 600 - 300,
				Math.random() * 600 - 300,
				Math.random() * 600 - 300
			);
			star.velocity = 0;
			star.acceleration = 0.02;
			vars.starGeo.vertices.push(star);
		}
		let sprite = new THREE.TextureLoader().load('../texture/star.png');
		let starMaterial = new THREE.PointsMaterial({
			color: 0xaaaaaa,
			size: 1.5,
			map: sprite
		});

		vars.stars = new THREE.Points(vars.starGeo, starMaterial);
		vars.scene.add(vars.stars);

		Scene.loadSound('../sounds/star-wars.ogg', true);

		Scene.animate();
	}
};

Scene.init();