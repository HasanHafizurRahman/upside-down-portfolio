import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ScrollProps } from '../types';

export const Scene: React.FC<ScrollProps> = ({ scrollProgress }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  // Track scroll for animation loop usage
  const scrollRef = useRef(scrollProgress);
  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  // Track logic for stalking
  const lastScrollRef = useRef(scrollProgress);
  const stalkFactorRef = useRef(0); // 0 = moving/passive, 1 = stalking/aggressive

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    scene.fog = new THREE.FogExp2(0x0a0a12, 0.012);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 150);
    cameraRef.current = camera;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- Audio System ---
    const growlSounds = [
      new Audio('https://actions.google.com/sounds/v1/horror/monster_alien_growl_pained.ogg'),
      new Audio('https://actions.google.com/sounds/v1/horror/aggressive_beast_growl.ogg')
    ];
    growlSounds.forEach(s => s.volume = 0.4);

    const ambienceSound = new Audio('https://actions.google.com/sounds/v1/horror/horror_ambience.ogg');
    ambienceSound.volume = 0.2;
    ambienceSound.loop = true;

    // Handle Autoplay Policy
    const initAudio = () => {
      ambienceSound.play().catch(() => {});
      window.removeEventListener('click', initAudio);
      window.removeEventListener('scroll', initAudio);
    };
    window.addEventListener('click', initAudio);
    window.addEventListener('scroll', initAudio);


    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0x4a5a6a, 2.5); 
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x8899ff, 1.5);
    moonLight.position.set(10, 20, 10);
    scene.add(moonLight);

    // Red flicker light (Mind Flayer lightning connection)
    const redLight = new THREE.PointLight(0xff0033, 1, 100);
    redLight.position.set(0, 15, -10);
    scene.add(redLight);

    // --- Mind Flayer Shadow Cloud & Thunder ---
    const stormGroup = new THREE.Group();
    stormGroup.position.set(0, 20, -80);
    scene.add(stormGroup);

    // Thunder Light (Hidden inside the cloud)
    const thunderLight = new THREE.PointLight(0xff0033, 0, 300);
    stormGroup.add(thunderLight);

    // Cloud Texture
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 128; cloudCanvas.height = 128;
    const cCtx = cloudCanvas.getContext('2d');
    if (cCtx) {
        const g = cCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(20, 20, 25, 0.9)'); 
        g.addColorStop(0.6, 'rgba(10, 10, 15, 0.4)'); 
        g.addColorStop(1, 'rgba(0, 0, 0, 0)'); 
        cCtx.fillStyle = g;
        cCtx.fillRect(0, 0, 128, 128);
    }
    const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
    const cloudMat = new THREE.SpriteMaterial({ 
        map: cloudTexture, 
        transparent: true, 
        opacity: 0.8,
        color: 0x222222,
        blending: THREE.NormalBlending 
    });

    const stormParticles: THREE.Sprite[] = [];
    // Create massive cloud formation
    for(let i=0; i<80; i++) {
        const sprite = new THREE.Sprite(cloudMat.clone());
        // Spider-like shape or just massive storm wall
        const r = 40 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        sprite.position.set(
            (Math.random() - 0.5) * 120,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 40
        );
        const s = 40 + Math.random() * 40;
        sprite.scale.set(s, s, 1);
        sprite.material.rotation = Math.random() * Math.PI;
        stormGroup.add(sprite);
        stormParticles.push(sprite);
    }


    // --- Procedural Mist / Fog Banks (Foreground) ---
    const mistParticles: { sprite: THREE.Sprite, speedZ: number, swaySpeed: number, swayOffset: number }[] = [];
    const mistTextureCanvas = document.createElement('canvas');
    mistTextureCanvas.width = 128; 
    mistTextureCanvas.height = 128;
    const ctx = mistTextureCanvas.getContext('2d');
    if (ctx) {
        const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(50, 60, 70, 0.2)'); 
        g.addColorStop(0.5, 'rgba(30, 35, 40, 0.05)'); 
        g.addColorStop(1, 'rgba(0, 0, 0, 0)'); 
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
    }
    const mistTexture = new THREE.CanvasTexture(mistTextureCanvas);

    const baseMistMaterial = new THREE.SpriteMaterial({ 
        map: mistTexture, 
        transparent: true, 
        opacity: 0.6, 
        blending: THREE.NormalBlending, 
        depthWrite: false,
    });

    const mistGroup = new THREE.Group();
    scene.add(mistGroup);

    for (let i = 0; i < 50; i++) {
        const material = baseMistMaterial.clone();
        material.rotation = Math.random() * Math.PI * 2;
        
        const sprite = new THREE.Sprite(material);
        sprite.position.set(
            (Math.random() - 0.5) * 60, 
            (Math.random() - 0.5) * 20 - 5, 
            (Math.random() - 0.5) * 120 - 30 
        );
        
        const scale = 15 + Math.random() * 25;
        sprite.scale.set(scale, scale, 1);
        
        mistGroup.add(sprite);
        mistParticles.push({
            sprite,
            speedZ: 0.02 + Math.random() * 0.05, 
            swaySpeed: 0.1 + Math.random() * 0.2,
            swayOffset: Math.random() * Math.PI * 2
        });
    }

    // --- Helpers for Procedural Monsters ---
    
    // Create Enhanced Demogorgon
    const createDemogorgon = (scale = 1) => {
      const group = new THREE.Group();
      
      // Darker skin color
      const skinMat = new THREE.MeshStandardMaterial({ 
        color: 0x151515, // Almost black
        roughness: 0.6,
        metalness: 0.2
      });
      
      const insideMat = new THREE.MeshStandardMaterial({ 
        color: 0x660000, 
        roughness: 0.2, 
        emissive: 0x330000, 
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide
      });

      const teethMat = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc, 
        roughness: 0.4,
        metalness: 0.1
      });

      // Vein Material
      const veinMat = new THREE.MeshStandardMaterial({
        color: 0x880000,
        emissive: 0x660000,
        emissiveIntensity: 0.8,
        roughness: 0.3
      });

      // Wrapping Vine Material
      const wrapVineMat = new THREE.MeshStandardMaterial({
          color: 0x050505,
          roughness: 1,
          metalness: 0,
      });

      // Helper to add procedural surface veins
      const createVeins = (parent: THREE.Group | THREE.Mesh, count: number, size: {r: number, l: number}) => {
          for(let i=0; i<count; i++) {
             const curvePts = [];
             // Start random spot on surface approx
             const angle = Math.random() * Math.PI * 2;
             const h = (Math.random() - 0.5) * size.l;
             const r = size.r;
             
             let curr = new THREE.Vector3(Math.cos(angle)*r, h, Math.sin(angle)*r);
             curvePts.push(curr.clone());

             // Wiggle
             for(let j=0; j<5; j++) {
                 curr.y += (Math.random() - 0.5) * (size.l * 0.3);
                 curr.x += (Math.random() - 0.5) * (size.r * 0.5);
                 curr.z += (Math.random() - 0.5) * (size.r * 0.5);
                 curvePts.push(curr.clone());
             }

             const curve = new THREE.CatmullRomCurve3(curvePts);
             const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 5, 0.015 * scale, 3, false), veinMat);
             parent.add(tube);
          }
      };

      // Helper to wrap vines AROUND a limb (Constricting)
      const wrapVine = (parent: THREE.Mesh | THREE.Group, length: number, radius: number, turns: number = 2) => {
          const points = [];
          const rBase = radius + 0.02 * scale; // Slightly larger than limb
          for(let i=0; i<=20; i++) {
              const t = i/20;
              const angle = t * Math.PI * 2 * turns;
              const y = (t - 0.5) * length;
              const r = rBase + (Math.random()-0.5) * 0.02 * scale;
              points.push(new THREE.Vector3(Math.cos(angle)*r, y, Math.sin(angle)*r));
          }
          const curve = new THREE.CatmullRomCurve3(points);
          const tube = new THREE.Mesh(
              new THREE.TubeGeometry(curve, 20, 0.03 * scale, 4, false), 
              wrapVineMat
          );
          parent.add(tube);
      };

      // --- Body Construction ---

      // Pelvis Area
      const pelvis = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 * scale), skinMat);
      pelvis.position.y = 1.8 * scale;
      group.add(pelvis);
      createVeins(pelvis, 3, {r: 0.35*scale, l: 0.3*scale});

      // Spine & Ribcage
      const spineGroup = new THREE.Group();
      spineGroup.position.y = 2.2 * scale;
      group.add(spineGroup);

      // Backbone
      const spine = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12 * scale, 0.15 * scale, 1.2 * scale, 8), 
          skinMat
      );
      spine.position.y = 0.5 * scale;
      spineGroup.add(spine);
      // Wrap spine
      wrapVine(spine, 1.2 * scale, 0.15 * scale, 3);

      // Ribs
      for(let i = 0; i < 4; i++) {
        const ribSize = (0.28 - (i * 0.02)) * scale;
        const rib = new THREE.Mesh(
            new THREE.TorusGeometry(ribSize, 0.04 * scale, 8, 16, Math.PI * 1.5),
            skinMat
        );
        rib.rotation.x = Math.PI / 2;
        rib.rotation.z = Math.PI / 1.35; 
        rib.position.y = (0.3 + i * 0.2) * scale;
        spineGroup.add(rib);
      }
      
      // Veins on Ribcage
      createVeins(spineGroup, 4, {r: 0.25*scale, l: 1*scale});

      // Sternum
      const chest = new THREE.Mesh(new THREE.BoxGeometry(0.25 * scale, 0.4 * scale, 0.1 * scale), skinMat);
      chest.position.set(0, 2.9 * scale, 0.15 * scale);
      chest.rotation.x = -0.2;
      group.add(chest);

      // Back Spikes
      const spikeGeo = new THREE.ConeGeometry(0.05 * scale, 0.3 * scale, 4);
      for(let i = 0; i < 3; i++) {
          const spike = new THREE.Mesh(spikeGeo, skinMat);
          spike.position.set(0, (2.6 + i * 0.3) * scale, -0.2 * scale);
          spike.rotation.x = -Math.PI / 4;
          group.add(spike);
      }

      // --- Head (NO VINES) ---
      const headGroup = new THREE.Group();
      headGroup.position.y = 3.5 * scale; 
      group.add(headGroup);

      // Thick Neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14*scale, 0.16*scale, 0.4*scale, 8), skinMat);
      neck.position.y = -0.2*scale;
      headGroup.add(neck);

      // Face Petals
      const petals: THREE.Object3D[] = [];
      for(let i = 0; i < 5; i++) {
        const petalPivot = new THREE.Group();
        
        const pGeo = new THREE.ConeGeometry(0.18 * scale, 0.95 * scale, 5);
        pGeo.translate(0, 0.45 * scale, 0); 
        const pMesh = new THREE.Mesh(pGeo, insideMat);
        pMesh.scale.z = 0.15;
        
        const bump = new THREE.Mesh(new THREE.BoxGeometry(0.1*scale, 0.4*scale, 0.05*scale), skinMat);
        bump.position.set(0, 0.4*scale, -0.05*scale);
        pMesh.add(bump);

        for(let t=0; t<7; t++) {
           const toothSize = (0.02 + Math.random() * 0.015) * scale;
           const tooth = new THREE.Mesh(new THREE.ConeGeometry(toothSize, toothSize * 4, 3), teethMat);
           tooth.position.y = (0.15 + t * 0.12) * scale;
           tooth.position.z = 0.04 * scale;
           tooth.position.x = (Math.random() - 0.5) * 0.05 * scale;
           tooth.rotation.x = Math.PI / 3;
           pMesh.add(tooth);
        }

        petalPivot.add(pMesh);
        const angle = (i / 5) * Math.PI * 2;
        petalPivot.rotation.z = angle;
        const socket = new THREE.Group();
        socket.rotation.z = angle;
        const flap = new THREE.Group();
        flap.add(pMesh);
        socket.add(flap);
        headGroup.add(socket);
        petals.push(flap);
      }

      const maw = new THREE.Mesh(new THREE.SphereGeometry(0.14 * scale), new THREE.MeshStandardMaterial({ color: 0x110000, roughness: 0.1 }));
      headGroup.add(maw);

      // --- Arms ---
      const createLimb = (isLeft: boolean) => {
          const limbRoot = new THREE.Group();
          const dir = isLeft ? -1 : 1;
          
          limbRoot.position.set(dir * 0.45 * scale, 3.2 * scale, 0);

          const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18 * scale), skinMat);
          limbRoot.add(shoulder);
          
          const sSpike = new THREE.Mesh(new THREE.ConeGeometry(0.04*scale, 0.2*scale, 4), skinMat);
          sSpike.position.set(0, 0.1*scale, 0);
          sSpike.rotation.z = dir * -0.5;
          shoulder.add(sSpike);

          const upperArmGroup = new THREE.Group(); 
          limbRoot.add(upperArmGroup);
          
          const upperArmGeo = new THREE.CylinderGeometry(0.1*scale, 0.08*scale, 1.2*scale, 6);
          upperArmGeo.translate(0, -0.6*scale, 0);
          const upperArm = new THREE.Mesh(upperArmGeo, skinMat);
          createVeins(upperArm, 2, {r: 0.1*scale, l: 1*scale}); // Veins
          
          // Wrap Vine on Upper Arm
          const vineAnchorUpper = new THREE.Group();
          vineAnchorUpper.position.y = -0.6 * scale;
          upperArmGroup.add(vineAnchorUpper);
          wrapVine(vineAnchorUpper, 1.0 * scale, 0.1 * scale, 2.5);

          const bicep = new THREE.Mesh(new THREE.SphereGeometry(0.12*scale), skinMat);
          bicep.scale.y = 1.5;
          bicep.position.set(0, -0.5*scale, 0.02*scale);
          upperArm.add(bicep);
          
          upperArmGroup.add(upperArm);

          const elbowGroup = new THREE.Group();
          elbowGroup.position.set(0, -1.2*scale, 0);
          upperArmGroup.add(elbowGroup);

          const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.11*scale), skinMat);
          elbowGroup.add(elbow);
          
          const eSpike = new THREE.Mesh(new THREE.ConeGeometry(0.03*scale, 0.15*scale, 4), skinMat);
          eSpike.position.set(0, 0, -0.1*scale);
          eSpike.rotation.x = -Math.PI/2;
          elbow.add(eSpike);

          const forearmGeo = new THREE.CylinderGeometry(0.09*scale, 0.06*scale, 1.5*scale, 6);
          forearmGeo.translate(0, -0.75*scale, 0);
          const forearm = new THREE.Mesh(forearmGeo, skinMat);
          createVeins(forearm, 2, {r: 0.09*scale, l: 1.2*scale}); // Veins
          elbowGroup.add(forearm);
          
          // Wrap Vine on Forearm
          const vineAnchorFore = new THREE.Group();
          vineAnchorFore.position.y = -0.75 * scale;
          elbowGroup.add(vineAnchorFore);
          wrapVine(vineAnchorFore, 1.2 * scale, 0.08 * scale, 3);

          const handGroup = new THREE.Group();
          handGroup.position.set(0, -1.5*scale, 0);
          elbowGroup.add(handGroup);

          const palm = new THREE.Mesh(new THREE.BoxGeometry(0.15*scale, 0.15*scale, 0.05*scale), skinMat);
          handGroup.add(palm);

          for(let k=0; k<4; k++) {
             const finger = new THREE.Group();
             finger.position.x = (k-1.5) * 0.08 * scale;
             finger.position.y = -0.05 * scale;
             
             const f1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015*scale, 0.012*scale, 0.2*scale), skinMat);
             f1.position.y = -0.1*scale;
             
             const tip = new THREE.Mesh(new THREE.ConeGeometry(0.012*scale, 0.3*scale), teethMat);
             tip.position.y = -0.35*scale; 
             
             finger.add(f1);
             finger.add(tip);
             finger.rotation.z = (k-1.5) * -0.3;
             handGroup.add(finger);
          }

          upperArmGroup.rotation.z = dir * 0.3; 
          elbowGroup.rotation.z = dir * 0.2; 
          elbowGroup.rotation.x = -0.5; 

          return { root: limbRoot, upper: upperArmGroup, lower: elbowGroup, hand: handGroup };
      };

      const leftArm = createLimb(true);
      const rightArm = createLimb(false);
      group.add(leftArm.root);
      group.add(rightArm.root);

      // --- Legs ---
      const createLeg = (isLeft: boolean) => {
         const dir = isLeft ? -1 : 1;
         const legGroup = new THREE.Group();
         legGroup.position.set(dir * 0.25 * scale, 1.8 * scale, 0);
         
         const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.18*scale, 0.14*scale, 1.1*scale), skinMat);
         thigh.position.y = -0.5*scale;
         thigh.rotation.x = -0.4; 
         thigh.rotation.z = dir * -0.15; 
         createVeins(thigh, 3, {r: 0.18*scale, l: 0.9*scale}); // Veins
         
         // Wrap Vine Thigh
         wrapVine(thigh, 1.0 * scale, 0.16 * scale, 2);

         const quad = new THREE.Mesh(new THREE.SphereGeometry(0.16*scale), skinMat);
         quad.scale.y = 1.6;
         quad.position.set(0, -0.4*scale, 0.05*scale);
         thigh.add(quad);

         const knee = new THREE.Mesh(new THREE.SphereGeometry(0.14*scale), skinMat);
         knee.position.y = -0.55*scale;
         thigh.add(knee);

         const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.13*scale, 0.09*scale, 1.2*scale), skinMat);
         shin.position.set(0, -0.6*scale, 0.2*scale); 
         shin.rotation.x = 0.8; 
         createVeins(shin, 2, {r: 0.12*scale, l: 1*scale}); // Veins
         
         // Wrap Vine Shin
         wrapVine(shin, 1.1 * scale, 0.11 * scale, 2.5);

         const hock = new THREE.Mesh(new THREE.SphereGeometry(0.11*scale), skinMat);
         hock.position.y = -0.6*scale;
         shin.add(hock);

         const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.1*scale, 0.08*scale, 0.9*scale), skinMat);
         foot.position.set(0, -0.4*scale, -0.1*scale);
         foot.rotation.x = -0.4; 
         
         for(let t=0; t<3; t++) {
             const toe = new THREE.Mesh(new THREE.ConeGeometry(0.04*scale, 0.3*scale), teethMat);
             toe.position.set((t-1)*0.15*scale, -0.45*scale, 0.1*scale);
             toe.rotation.x = -0.5;
             foot.add(toe);
         }

         thigh.add(shin);
         shin.add(foot);
         legGroup.add(thigh);
         
         return legGroup;
      }

      group.add(createLeg(true));
      group.add(createLeg(false));

      return { group, petals, leftArm, rightArm, headGroup, chest, spineGroup, initialZ: 0 };
    };

    // Create Bat
    const createBat = () => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0x333333 }) 
        );
        group.add(body);

        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(0.6, 0.3);
        wingShape.lineTo(1.2, 0);
        wingShape.lineTo(0.8, -0.4);
        wingShape.lineTo(0, 0);

        const wingGeo = new THREE.ShapeGeometry(wingShape);
        const wingMat = new THREE.MeshStandardMaterial({ 
          color: 0x1a1a1a, 
          side: THREE.DoubleSide 
        });

        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.scale.set(-1, 1, 1);
        leftWing.position.x = -0.1;

        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.x = 0.1;

        group.add(leftWing);
        group.add(rightWing);

        return { group, leftWing, rightWing };
    };

    // --- Instantiate Monsters ---
    const demo1 = createDemogorgon(1.8);
    demo1.group.position.set(-3.5, -4, -15);
    demo1.initialZ = -15;
    demo1.group.rotation.y = 0.4;
    scene.add(demo1.group);

    const demo2 = createDemogorgon(2.5);
    demo2.group.position.set(5, -6, -50);
    demo2.initialZ = -50;
    demo2.group.rotation.y = -0.3;
    scene.add(demo2.group);

    // Bats
    const bats: { obj: any, speed: number, offset: number, radius: number }[] = [];
    for(let i=0; i<12; i++) {
        const bat = createBat();
        const scale = 0.5 + Math.random() * 0.8;
        bat.group.scale.set(scale, scale, scale);
        scene.add(bat.group);
        bats.push({ 
            obj: bat, 
            speed: 1 + Math.random() * 2, 
            offset: Math.random() * Math.PI * 2,
            radius: 4 + Math.random() * 8
        });
    }

    // --- Procedural Content: Vines ---
    const vineMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x444444, 
      roughness: 0.8,
      metalness: 0.2
    });

    const createVine = (radius: number, length: number, count: number, offsetZ: number) => {
        const curvePoints = [];
        for (let i = 0; i < count; i++) {
          curvePoints.push(new THREE.Vector3(
            Math.sin(i * 0.5) * radius + (Math.random() - 0.5) * 2,
            Math.cos(i * 0.3) * radius + (Math.random() - 0.5) * 2,
            -i * 2 + offsetZ
          ));
        }
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const vineGeo = new THREE.TubeGeometry(curve, count * 2, 0.3, 8, false);
        const mesh = new THREE.Mesh(vineGeo, vineMaterial);
        scene.add(mesh);
        return mesh;
    };
    
    const vine1 = createVine(5, 50, 60, 5);
    const vine2 = createVine(7, 50, 60, -30);
    const vine3 = createVine(4, 50, 40, -60);

    // --- Animation Loop ---
    let frameId: number;
    const clock = new THREE.Clock();
    let thunderTimer = 0;

    const animate = () => {
      const time = clock.getElapsedTime();

      // Check for Stalking Condition (Idle Scroll)
      const currentScroll = scrollRef.current;
      const scrollSpeed = Math.abs(currentScroll - lastScrollRef.current);
      lastScrollRef.current = currentScroll;

      // If speed is very low, increase stalking factor
      if (scrollSpeed < 0.0001) {
          stalkFactorRef.current = Math.min(1, stalkFactorRef.current + 0.01);
      } else {
          // If moving, quickly reset stalking
          stalkFactorRef.current = Math.max(0, stalkFactorRef.current - 0.05);
      }
      const stalkFactor = stalkFactorRef.current; // 0 to 1

      // 1. Red Light Pulse (Heartbeat)
      const heartbeat = (Math.exp(Math.sin(time * 3)) - 0.367) * 0.8 + 1; 
      const flicker = Math.random() > 0.9 ? Math.random() * 2 : 0;
      redLight.intensity = heartbeat + flicker;
      redLight.position.x = Math.sin(time) * 5;

      // 1b. Thunder Logic
      if (Math.random() < 0.005 && thunderTimer <= 0) {
          thunderTimer = 20; // Frames of thunder
      }
      if (thunderTimer > 0) {
          thunderLight.intensity = (Math.random() * 50) + 10;
          thunderTimer--;
      } else {
          thunderLight.intensity = 0;
      }

      // 2. Storm & Mist Animation
      stormGroup.rotation.y += 0.001;
      stormGroup.rotation.z = Math.sin(time * 0.1) * 0.1;
      stormParticles.forEach((p, idx) => {
           p.material.rotation += 0.002 * (idx % 2 === 0 ? 1 : -1);
      });

      mistParticles.forEach(p => {
          p.sprite.position.z += p.speedZ;
          p.sprite.position.x += Math.sin(time * p.swaySpeed + p.swayOffset) * 0.02;
          if (p.sprite.position.z > camera.position.z + 10) {
              p.sprite.position.z = -100;
              p.sprite.position.x = (Math.random() - 0.5) * 60;
          }
      });

      // 3. Demogorgons (Stalking Behavior)
      
      const openAmount = (Math.sin(time * 1.5) + 1) * 0.5; 
      const petalRotation = Math.PI/6 + openAmount * Math.PI/3;

      demo1.petals.forEach(p => p.rotation.x = petalRotation);
      demo2.petals.forEach(p => p.rotation.x = petalRotation);
      
      // Arm Animation
      const reach = Math.sin(time * 0.5) * 0.2;
      const hunt = Math.cos(time * 0.7) * 0.15;
      const twitch = Math.sin(time * 20) * 0.03;

      // When stalking, arms raise higher (ready to attack)
      const attackPose = stalkFactor * 0.5;

      // Demo 1
      demo1.leftArm.upper.rotation.z = -0.4 + reach + twitch + attackPose;
      demo1.leftArm.upper.rotation.x = hunt - attackPose;
      demo1.leftArm.lower.rotation.x = -1.2 + reach - attackPose; 
      
      demo1.rightArm.upper.rotation.z = 0.4 - reach - twitch - attackPose;
      demo1.rightArm.upper.rotation.x = -hunt - attackPose;
      demo1.rightArm.lower.rotation.x = -1.0 - reach - attackPose;

      // Demo 2
      demo2.leftArm.upper.rotation.z = -0.8 + hunt - attackPose;
      demo2.leftArm.lower.rotation.x = -0.5 + twitch - attackPose;
      demo2.rightArm.upper.rotation.z = 0.8 - hunt + attackPose;
      demo2.rightArm.lower.rotation.x = -0.5 + twitch - attackPose;

      // Idle: Breathing
      const breath = Math.sin(time * 2.5) * 0.04;
      demo1.chest.scale.set(1 + breath, 1 + breath, 1 + breath);
      demo2.chest.scale.set(1 + breath, 1 + breath, 1 + breath);

      // Stalking: Head Tracking & Leaning
      // Interpolate between idle sway and looking at camera
      
      const camPos = camera.position;

      // Helper to smooth lookAt
      const lookAtCamera = (obj: THREE.Object3D, intensity: number) => {
          // Calculate target quaternion
          const originalQuat = obj.quaternion.clone();
          obj.lookAt(camPos);
          const targetQuat = obj.quaternion.clone();
          obj.quaternion.copy(originalQuat);
          obj.quaternion.slerp(targetQuat, intensity * 0.1); // slow smooth turn
      };

      // Standard Idle Head Movement
      const idleRotY1 = Math.sin(time * 0.4) * 0.4;
      const idleRotX1 = Math.sin(time * 0.2) * 0.2 + 0.1;
      
      // If stalking, override with LookAt logic
      if (stalkFactor > 0.01) {
          lookAtCamera(demo1.headGroup, stalkFactor);
          lookAtCamera(demo2.headGroup, stalkFactor);
          
          // Lean Forward (Rotate whole group X)
          // Default rotation for Demo 1 was 0, Demo 2 was 0.
          // Note: Demo 1 has Rotation Y 0.4.
          // We want to rotate along local X axis to lean forward.
          demo1.group.rotation.x = THREE.MathUtils.lerp(0, 0.3, stalkFactor);
          demo2.group.rotation.x = THREE.MathUtils.lerp(0, 0.3, stalkFactor);

          // Creep Forward (Position Z)
          // Slowly move Z closer to camera from initialZ
          // Max creep distance = 4 units
          const creep1 = demo1.initialZ + (stalkFactor * 3 * Math.sin(time * 0.5)); 
          const creep2 = demo2.initialZ + (stalkFactor * 3 * Math.sin(time * 0.5));
          
          demo1.group.position.z = THREE.MathUtils.lerp(demo1.group.position.z, creep1, 0.05);
          demo2.group.position.z = THREE.MathUtils.lerp(demo2.group.position.z, creep2, 0.05);
      } else {
          // Revert to idle animations
          demo1.headGroup.rotation.y = idleRotY1;
          demo1.headGroup.rotation.x = idleRotX1;
          
          demo2.headGroup.rotation.z = Math.sin(time * 0.8) * 0.1;
          demo2.headGroup.rotation.y = -0.2 + Math.sin(time * 0.3) * 0.3;

          demo1.group.rotation.x = THREE.MathUtils.lerp(demo1.group.rotation.x, 0, 0.1);
          demo2.group.rotation.x = THREE.MathUtils.lerp(demo2.group.rotation.x, 0, 0.1);
          
          demo1.group.position.z = THREE.MathUtils.lerp(demo1.group.position.z, demo1.initialZ, 0.05);
          demo2.group.position.z = THREE.MathUtils.lerp(demo2.group.position.z, demo2.initialZ, 0.05);
      }

      // 4. Bats
      bats.forEach((bat, i) => {
          const flapSpeed = 15;
          bat.obj.leftWing.rotation.z = Math.sin(time * flapSpeed) * 0.6 + 0.3;
          bat.obj.rightWing.rotation.z = -Math.sin(time * flapSpeed) * 0.6 - 0.3;

          const t = time * bat.speed * 0.2 + bat.offset;
          const r = bat.radius;
          const zBase = camera.position.z - 15 - (i * 3);
          
          bat.obj.group.position.x = Math.sin(t) * r;
          bat.obj.group.position.y = Math.cos(t * 1.5) * (r * 0.6) + 2; 
          bat.obj.group.position.z = zBase + Math.sin(t * 2) * 5;
          
          bat.obj.group.lookAt(
              Math.sin(t + 0.1) * r,
              Math.cos((t + 0.1) * 1.5) * (r * 0.6) + 2,
              zBase + Math.sin((t + 0.1) * 2) * 5
          );
      });

      // 5. Random Growls
      if (Math.random() < 0.003) { 
        const s = growlSounds[Math.floor(Math.random() * growlSounds.length)];
        if (s.paused) {
           s.playbackRate = 0.8 + Math.random() * 0.4;
           s.play().catch(() => {});
           redLight.intensity = 8;
        }
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    // --- Cleanup ---
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', initAudio);
      window.removeEventListener('scroll', initAudio);
      ambienceSound.pause();
      cancelAnimationFrame(frameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      vine1.geometry.dispose();
      vine2.geometry.dispose();
      vine3.geometry.dispose();
      vineMaterial.dispose();
      mistParticles.forEach(p => p.sprite.material.dispose());
      mistTexture.dispose();
      cloudTexture.dispose();
      cloudMat.dispose();
      demo1.group.clear();
      demo2.group.clear();
      bats.forEach(b => b.obj.group.clear());
    };
  }, []);

  // Update Camera Z based on Scroll
  useEffect(() => {
    if (cameraRef.current) {
      const targetZ = 5 - (scrollProgress * 95); 
      
      const driftX = Math.sin(scrollProgress * 10) * 2;
      const driftY = Math.cos(scrollProgress * 15) * 1.5;

      cameraRef.current.position.z = targetZ;
      cameraRef.current.position.x = driftX;
      cameraRef.current.position.y = driftY;
      
      cameraRef.current.lookAt(0, 0, targetZ - 20);
    }
  }, [scrollProgress]);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 z-0 pointer-events-none" 
      aria-hidden="true"
    />
  );
};