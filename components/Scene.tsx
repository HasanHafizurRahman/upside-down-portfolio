import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ScrollProps } from '../types';

export const Scene: React.FC<ScrollProps> = ({ scrollProgress }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    // Reduced fog density so objects are more visible further away, 
    // but mist sprites will add local density.
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


    // --- Lights (Enhanced for Visibility) ---
    // Increased ambient light brightness and shifted to blue-grey for better contrast
    const ambientLight = new THREE.AmbientLight(0x4a5a6a, 2.5); 
    scene.add(ambientLight);

    // Added a directional moon-like light to illuminate shapes from above
    const moonLight = new THREE.DirectionalLight(0x8899ff, 1.5);
    moonLight.position.set(10, 20, 10);
    scene.add(moonLight);

    // Red flicker light (Mind Flayer lightning)
    const redLight = new THREE.PointLight(0xff0033, 2, 100);
    redLight.position.set(0, 15, -10);
    scene.add(redLight);

    // --- Procedural Mist / Fog Banks ---
    const mistParticles: { sprite: THREE.Sprite, speedZ: number, swaySpeed: number, swayOffset: number }[] = [];
    const mistTextureCanvas = document.createElement('canvas');
    mistTextureCanvas.width = 128; 
    mistTextureCanvas.height = 128;
    const ctx = mistTextureCanvas.getContext('2d');
    if (ctx) {
        // Create a soft cloudy gradient
        const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(50, 60, 70, 0.2)'); // Center (bluish grey)
        g.addColorStop(0.5, 'rgba(30, 35, 40, 0.05)'); // Mid
        g.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Edge
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
    }
    const mistTexture = new THREE.CanvasTexture(mistTextureCanvas);

    // Base material for the mist
    const baseMistMaterial = new THREE.SpriteMaterial({ 
        map: mistTexture, 
        transparent: true, 
        opacity: 0.6, 
        blending: THREE.NormalBlending, // Normal blending for "smoke" look
        depthWrite: false,
    });

    const mistGroup = new THREE.Group();
    scene.add(mistGroup);

    // Create mist sprites
    for (let i = 0; i < 50; i++) {
        const material = baseMistMaterial.clone();
        // Random rotation for variety
        material.rotation = Math.random() * Math.PI * 2;
        
        const sprite = new THREE.Sprite(material);
        sprite.position.set(
            (Math.random() - 0.5) * 60, // Wide spread X
            (Math.random() - 0.5) * 20 - 5, // Mostly lower, some higher
            (Math.random() - 0.5) * 120 - 30 // Deep Z range
        );
        
        // Vary size significantly for depth
        const scale = 15 + Math.random() * 25;
        sprite.scale.set(scale, scale, 1);
        
        mistGroup.add(sprite);
        mistParticles.push({
            sprite,
            speedZ: 0.02 + Math.random() * 0.05, // Slow drift
            swaySpeed: 0.1 + Math.random() * 0.2,
            swayOffset: Math.random() * Math.PI * 2
        });
    }

    // --- Helpers for Procedural Monsters ---
    
    // Create Enhanced Demogorgon
    const createDemogorgon = (scale = 1) => {
      const group = new THREE.Group();
      
      // Lighter skin color for better visibility against dark background
      const skinMat = new THREE.MeshStandardMaterial({ 
        color: 0x887777, // Slightly lighter/fleshy grey
        roughness: 0.4,  // Wet skin look
        metalness: 0.1
      });
      
      const insideMat = new THREE.MeshStandardMaterial({ 
        color: 0x660000, 
        roughness: 0.2, 
        emissive: 0x220000, 
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide
      });

      const teethMat = new THREE.MeshStandardMaterial({ 
        color: 0xdddddd, 
        roughness: 0.3,
        metalness: 0.1
      });

      // --- Body Construction ---

      // Pelvis Area
      const pelvis = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 * scale), skinMat);
      pelvis.position.y = 1.8 * scale;
      group.add(pelvis);

      // Spine & Ribcage (More Detailed)
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

      // Ribs (Torus segments)
      for(let i = 0; i < 4; i++) {
        const ribSize = (0.28 - (i * 0.02)) * scale;
        const rib = new THREE.Mesh(
            new THREE.TorusGeometry(ribSize, 0.04 * scale, 8, 16, Math.PI * 1.5),
            skinMat
        );
        rib.rotation.x = Math.PI / 2;
        rib.rotation.z = Math.PI / 1.35; // Open at front
        rib.position.y = (0.3 + i * 0.2) * scale;
        spineGroup.add(rib);
      }

      // Sternum / Chest Plate
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

      // --- Head ---
      const headGroup = new THREE.Group();
      headGroup.position.y = 3.5 * scale; 
      group.add(headGroup);

      // Thick Neck with detail
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14*scale, 0.16*scale, 0.4*scale, 8), skinMat);
      neck.position.y = -0.2*scale;
      headGroup.add(neck);

      // Face Petals
      const petals: THREE.Object3D[] = [];
      for(let i = 0; i < 5; i++) {
        const petalPivot = new THREE.Group();
        
        // The fleshy petal
        const pGeo = new THREE.ConeGeometry(0.18 * scale, 0.95 * scale, 5);
        pGeo.translate(0, 0.45 * scale, 0); // Pivot at base
        // Flatten
        const pMesh = new THREE.Mesh(pGeo, insideMat);
        pMesh.scale.z = 0.15;
        
        // Texture bumps on back of petal
        const bump = new THREE.Mesh(new THREE.BoxGeometry(0.1*scale, 0.4*scale, 0.05*scale), skinMat);
        bump.position.set(0, 0.4*scale, -0.05*scale);
        pMesh.add(bump);

        // Teeth rows on petal - More chaotic
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
        
        // Arrange in circle
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

      // Deep Maw Center
      const maw = new THREE.Mesh(new THREE.SphereGeometry(0.14 * scale), new THREE.MeshStandardMaterial({ color: 0x110000, roughness: 0.1 }));
      headGroup.add(maw);

      // --- Arms (Jointed & Muscular) ---
      const createLimb = (isLeft: boolean) => {
          const limbRoot = new THREE.Group();
          const dir = isLeft ? -1 : 1;
          
          limbRoot.position.set(dir * 0.45 * scale, 3.2 * scale, 0);

          // Shoulder (Deltoid)
          const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18 * scale), skinMat);
          limbRoot.add(shoulder);
          
          // Shoulder Spike
          const sSpike = new THREE.Mesh(new THREE.ConeGeometry(0.04*scale, 0.2*scale, 4), skinMat);
          sSpike.position.set(0, 0.1*scale, 0);
          sSpike.rotation.z = dir * -0.5;
          shoulder.add(sSpike);

          // Upper Arm
          const upperArmGroup = new THREE.Group(); 
          limbRoot.add(upperArmGroup);
          
          const upperArmGeo = new THREE.CylinderGeometry(0.1*scale, 0.08*scale, 1.2*scale, 6);
          upperArmGeo.translate(0, -0.6*scale, 0);
          const upperArm = new THREE.Mesh(upperArmGeo, skinMat);
          
          // Bicep Muscle
          const bicep = new THREE.Mesh(new THREE.SphereGeometry(0.12*scale), skinMat);
          bicep.scale.y = 1.5;
          bicep.position.set(0, -0.5*scale, 0.02*scale);
          upperArm.add(bicep);
          
          upperArmGroup.add(upperArm);

          // Elbow
          const elbowGroup = new THREE.Group();
          elbowGroup.position.set(0, -1.2*scale, 0);
          upperArmGroup.add(elbowGroup);

          const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.11*scale), skinMat);
          elbowGroup.add(elbow);
          
          // Elbow Spike
          const eSpike = new THREE.Mesh(new THREE.ConeGeometry(0.03*scale, 0.15*scale, 4), skinMat);
          eSpike.position.set(0, 0, -0.1*scale);
          eSpike.rotation.x = -Math.PI/2;
          elbow.add(eSpike);

          // Forearm (Longer)
          const forearmGeo = new THREE.CylinderGeometry(0.09*scale, 0.06*scale, 1.5*scale, 6);
          forearmGeo.translate(0, -0.75*scale, 0);
          const forearm = new THREE.Mesh(forearmGeo, skinMat);
          elbowGroup.add(forearm);

          // Hand
          const handGroup = new THREE.Group();
          handGroup.position.set(0, -1.5*scale, 0);
          elbowGroup.add(handGroup);

          // Palm
          const palm = new THREE.Mesh(new THREE.BoxGeometry(0.15*scale, 0.15*scale, 0.05*scale), skinMat);
          handGroup.add(palm);

          // Long Sharp Claws
          for(let k=0; k<4; k++) {
             const finger = new THREE.Group();
             finger.position.x = (k-1.5) * 0.08 * scale;
             finger.position.y = -0.05 * scale;
             
             // Finger segments
             const f1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015*scale, 0.012*scale, 0.2*scale), skinMat);
             f1.position.y = -0.1*scale;
             
             // Claw tip
             const tip = new THREE.Mesh(new THREE.ConeGeometry(0.012*scale, 0.3*scale), teethMat);
             tip.position.y = -0.35*scale; // Long claw
             
             finger.add(f1);
             finger.add(tip);
             
             // Spread fingers
             finger.rotation.z = (k-1.5) * -0.3;
             
             handGroup.add(finger);
          }

          // Initial Pose
          upperArmGroup.rotation.z = dir * 0.3; 
          elbowGroup.rotation.z = dir * 0.2; 
          elbowGroup.rotation.x = -0.5; 

          return { root: limbRoot, upper: upperArmGroup, lower: elbowGroup, hand: handGroup };
      };

      const leftArm = createLimb(true);
      const rightArm = createLimb(false);
      group.add(leftArm.root);
      group.add(rightArm.root);

      // --- Legs (Digitigrade & Muscular) ---
      const createLeg = (isLeft: boolean) => {
         const dir = isLeft ? -1 : 1;
         const legGroup = new THREE.Group();
         legGroup.position.set(dir * 0.25 * scale, 1.8 * scale, 0);
         
         // Thigh (Thick)
         const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.18*scale, 0.14*scale, 1.1*scale), skinMat);
         thigh.position.y = -0.5*scale;
         thigh.rotation.x = -0.4; // Forward knee
         thigh.rotation.z = dir * -0.15; 
         
         // Thigh Muscle
         const quad = new THREE.Mesh(new THREE.SphereGeometry(0.16*scale), skinMat);
         quad.scale.y = 1.6;
         quad.position.set(0, -0.4*scale, 0.05*scale);
         thigh.add(quad);

         // Knee
         const knee = new THREE.Mesh(new THREE.SphereGeometry(0.14*scale), skinMat);
         knee.position.y = -0.55*scale;
         thigh.add(knee);

         // Shin
         const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.13*scale, 0.09*scale, 1.2*scale), skinMat);
         shin.position.set(0, -0.6*scale, 0.2*scale); // relative to thigh end
         shin.rotation.x = 0.8; // Backward hock

         // Hock Joint
         const hock = new THREE.Mesh(new THREE.SphereGeometry(0.11*scale), skinMat);
         hock.position.y = -0.6*scale;
         shin.add(hock);

         // Foot (Metatarsal)
         const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.1*scale, 0.08*scale, 0.9*scale), skinMat);
         foot.position.set(0, -0.4*scale, -0.1*scale);
         foot.rotation.x = -0.4; // Down to ground
         
         // Toes
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

      return { group, petals, leftArm, rightArm, headGroup, chest, spineGroup };
    };

    // Create Bat
    const createBat = () => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0x333333 }) // Lighter grey body
        );
        group.add(body);

        // Wing shape
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(0.6, 0.3);
        wingShape.lineTo(1.2, 0);
        wingShape.lineTo(0.8, -0.4);
        wingShape.lineTo(0, 0);

        const wingGeo = new THREE.ShapeGeometry(wingShape);
        const wingMat = new THREE.MeshStandardMaterial({ 
          color: 0x1a1a1a, // Dark grey instead of pitch black
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
    // Demo 1 - Closer, staring
    const demo1 = createDemogorgon(1.8);
    demo1.group.position.set(-3.5, -4, -15);
    demo1.group.rotation.y = 0.4;
    scene.add(demo1.group);

    // Demo 2 - Farther, looming
    const demo2 = createDemogorgon(2.5);
    demo2.group.position.set(5, -6, -50);
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
    // Lighter color for visibility
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
    
    // Create multiple vine clusters along the path
    const vine1 = createVine(5, 50, 60, 5);
    const vine2 = createVine(7, 50, 60, -30);
    const vine3 = createVine(4, 50, 40, -60);

    // --- Animation Loop ---
    let frameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // 1. Red Light Pulse (Heartbeat Style)
      // exp(sin(t)) gives a sharp peak, flatter trough
      const heartbeat = (Math.exp(Math.sin(time * 3)) - 0.367) * 0.8 + 1; 
      // Flicker: Random spikes
      const flicker = Math.random() > 0.9 ? Math.random() * 2 : 0;
      redLight.intensity = heartbeat + flicker;
      // Light position wobble
      redLight.position.x = Math.sin(time) * 5;

      // 2. Animate Mist (Drifting Fog Banks)
      mistParticles.forEach(p => {
          // Drifting along Z towards camera or away
          p.sprite.position.z += p.speedZ;
          
          // Gentle sway on X
          p.sprite.position.x += Math.sin(time * p.swaySpeed + p.swayOffset) * 0.02;
          
          // Reset when passed camera
          if (p.sprite.position.z > camera.position.z + 10) {
              p.sprite.position.z = -100;
              p.sprite.position.x = (Math.random() - 0.5) * 60;
          }
      });

      // 3. Animate Demogorgons (Menacing)
      
      // Face Opening (Oscillate)
      const openAmount = (Math.sin(time * 1.5) + 1) * 0.5; 
      const petalRotation = Math.PI/6 + openAmount * Math.PI/3;

      demo1.petals.forEach(p => p.rotation.x = petalRotation);
      demo2.petals.forEach(p => p.rotation.x = petalRotation);
      
      // Arm Animation (Reaching / Hunting)
      // Slower, more deliberate movements using combined sines
      const reach = Math.sin(time * 0.5) * 0.2;
      const hunt = Math.cos(time * 0.7) * 0.15;
      
      // Nervous twitch
      const twitch = Math.sin(time * 20) * 0.03;

      // Demo 1 Arms - Stalking pose
      demo1.leftArm.upper.rotation.z = -0.4 + reach + twitch;
      demo1.leftArm.upper.rotation.x = hunt;
      demo1.leftArm.lower.rotation.x = -1.2 + reach; // Bend arm up ready to strike
      
      demo1.rightArm.upper.rotation.z = 0.4 - reach - twitch;
      demo1.rightArm.upper.rotation.x = -hunt;
      demo1.rightArm.lower.rotation.x = -1.0 - reach;

      // Demo 2 Arms - Wide threat pose
      demo2.leftArm.upper.rotation.z = -0.8 + hunt;
      demo2.leftArm.lower.rotation.x = -0.5 + twitch;
      demo2.rightArm.upper.rotation.z = 0.8 - hunt;
      demo2.rightArm.lower.rotation.x = -0.5 + twitch;

      // Idle: Breathing (Chest/Spine Expansion)
      const breath = Math.sin(time * 2.5) * 0.04;
      demo1.chest.scale.set(1 + breath, 1 + breath, 1 + breath);
      demo2.chest.scale.set(1 + breath, 1 + breath, 1 + breath);

      // Idle: Head Scanning (Predatory)
      demo1.headGroup.rotation.y = Math.sin(time * 0.4) * 0.4;
      demo1.headGroup.rotation.x = Math.sin(time * 0.2) * 0.2 + 0.1; // Look down slightly
      
      demo2.headGroup.rotation.z = Math.sin(time * 0.8) * 0.1;
      demo2.headGroup.rotation.y = -0.2 + Math.sin(time * 0.3) * 0.3;

      // 4. Animate Bats
      bats.forEach((bat, i) => {
          // Flapping
          const flapSpeed = 15;
          bat.obj.leftWing.rotation.z = Math.sin(time * flapSpeed) * 0.6 + 0.3;
          bat.obj.rightWing.rotation.z = -Math.sin(time * flapSpeed) * 0.6 - 0.3;

          // Orbit/Fly path
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
           
           // Visual reaction: Strong light pulse when growling
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
      // Dispose monsters (simplistic cleanup)
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
      
      // Look slighty ahead on the path
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