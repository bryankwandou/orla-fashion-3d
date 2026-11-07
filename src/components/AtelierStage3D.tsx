import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export type EditorialStage = 0 | 1 | 2;

interface AtelierStage3DProps {
  stage: EditorialStage;
  selectedLook: number;
  fabricTension: number;
}

const CLOTH_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vFold;

  uniform float uTime;
  uniform float uTension;
  uniform vec2 uPointer;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Organic silk-hemp & deadstock denim cloth drape wave
    float wave1 = sin(pos.x * 2.4 + uTime * 1.15 + uPointer.x * 1.8) * 0.14;
    float wave2 = cos(pos.y * 2.9 - uTime * 0.95 + uPointer.y * 1.8) * 0.11;
    float microPleat = sin((pos.x + pos.y) * 9.0 + uTime * 1.6) * 0.025;

    float displacement = (wave1 + wave2 + microPleat) * uTension;
    pos.z += displacement;
    vFold = displacement;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = -mvPos.xyz;
    vNormal = normalize(normalMatrix * normalize(normal + vec3(-wave1 * 0.4, -wave2 * 0.4, 1.0)));

    gl_Position = projectionMatrix * mvPos;
  }
`;

const CLOTH_FRAGMENT_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vFold;

  uniform float uTime;
  uniform float uLookIndex;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPos);
    vec3 L = normalize(vec3(0.4, 0.8, 1.0));

    // Procedural diagonal twill / raw organic hemp micro-weave pattern
    vec2 weaveUv = vUv * 190.0;
    float warp = sin(weaveUv.x + sin(weaveUv.y * 0.5)) * 0.5 + 0.5;
    float weft = cos(weaveUv.y + cos(weaveUv.x * 0.5)) * 0.5 + 0.5;
    float microWeave = mix(warp, weft, 0.5);

    // Botanical madder-rose, washed sky indigo, and raw hemp palette matching Orla reference
    vec3 colHemp = vec3(0.93, 0.91, 0.88);
    vec3 colRose = vec3(0.92, 0.76, 0.79);
    vec3 colDenim = vec3(0.76, 0.84, 0.89);

    if (uLookIndex > 0.5 && uLookIndex < 1.5) {
      colRose = vec3(0.71, 0.79, 0.86);
      colDenim = vec3(0.62, 0.71, 0.78);
    } else if (uLookIndex >= 1.5) {
      colRose = vec3(0.54, 0.62, 0.58);
      colDenim = vec3(0.38, 0.46, 0.44);
    }

    float Swirl = sin(vUv.x * 4.5 + vUv.y * 3.2 + uTime * 0.25) * 0.5 + 0.5;
    vec3 baseColor = mix(colHemp, colRose, smoothstep(0.2, 0.8, Swirl));
    baseColor = mix(baseColor, colDenim, smoothstep(0.35, 0.9, 1.0 - vUv.y));

    float diff = max(dot(N, L), 0.0) * 0.35 + 0.72;
    float sheen = pow(1.0 - max(dot(N, V), 0.0), 2.5) * 0.22;

    vec3 finalCol = baseColor * diff + (microWeave - 0.5) * 0.045 + vFold * 0.18 + sheen;

    gl_FragColor = vec4(finalCol, 0.34);
  }
`;

export const AtelierStage3D: React.FC<AtelierStage3DProps> = ({
  stage,
  selectedLook,
  fabricTension,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const figureGroupRef = useRef<THREE.Group | null>(null);
  const reachArmGroupRef = useRef<THREE.Group | null>(null);
  const clothUniformsRef = useRef<{
    uTime: { value: number };
    uTension: { value: number };
    uLookIndex: { value: number };
    uPointer: { value: THREE.Vector2 };
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 80);
    camera.position.set(0.25, 0.55, 4.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // High-Key Fashion Studio Lighting
    const ambient = new THREE.AmbientLight('#FAF8F5', 1.55);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight('#FFFDF9', 1.35);
    keyLight.position.set(3.5, 6.0, 5.0);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#E8EEF2', 0.85);
    fillLight.position.set(-4.0, 2.5, 3.5);
    scene.add(fillLight);

    // Background Translucent 3D Woven Textile Veil
    const clothUniforms = {
      uTime: { value: 0 },
      uTension: { value: fabricTension },
      uLookIndex: { value: selectedLook },
      uPointer: { value: new THREE.Vector2(0, 0) },
    };
    clothUniformsRef.current = clothUniforms;

    const veilGeo = new THREE.PlaneGeometry(5.6, 3.8, 72, 72);
    const veilMat = new THREE.ShaderMaterial({
      vertexShader: CLOTH_VERTEX_SHADER,
      fragmentShader: CLOTH_FRAGMENT_SHADER,
      uniforms: clothUniforms,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const veilMesh = new THREE.Mesh(veilGeo, veilMat);
    veilMesh.position.set(0.2, 0.2, -1.35);
    scene.add(veilMesh);

    // =========================================================================
    // 3D SCULPTURAL EDITORIAL MODEL IN CUTOUT PASTEL KNIT & PATCHWORK DENIM
    // =========================================================================
    const figureGroup = new THREE.Group();
    figureGroupRef.current = figureGroup;

    const skinMat = new THREE.MeshStandardMaterial({
      color: '#DFB9A4',
      roughness: 0.42,
      metalness: 0.04,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: '#1A1819',
      roughness: 0.35,
    });

    // Procedural Asymmetric Pastel Cutout Knit Texture (matching the pink & sky-blue top)
    const createKnitTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      const g = ctx.createLinearGradient(0, 0, 256, 256);
      g.addColorStop(0, '#EBC5CE');
      g.addColorStop(0.5, '#C5D8E5');
      g.addColorStop(1, '#E6C2CA');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);

      // Asymmetric organic cutouts revealing skin tone
      ctx.fillStyle = '#DFB9A4';
      ctx.beginPath();
      ctx.ellipse(90, 95, 28, 42, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(165, 130, 24, 34, 0.25, 0, Math.PI * 2);
      ctx.fill();

      return new THREE.CanvasTexture(c);
    };

    // Procedural Distressed Patchwork Recycled Denim Texture
    const createDenimTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      const g = ctx.createLinearGradient(0, 0, 256, 512);
      g.addColorStop(0, '#BCCAD6');
      g.addColorStop(0.5, '#CED8E0');
      g.addColorStop(1, '#B3C2CF');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 512);

      // Patchwork seam lines
      ctx.strokeStyle = 'rgba(120, 136, 150, 0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 80, 220, 140);
      ctx.strokeRect(14, 240, 228, 170);

      // Distressed knee slashes with pastel pink/skin underlay
      ctx.fillStyle = '#DDB5AC';
      ctx.beginPath();
      ctx.ellipse(128, 220, 52, 16, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // White cotton frayed threads across the knee slash
      ctx.strokeStyle = '#F7F5F0';
      ctx.lineWidth = 1.5;
      for (let x = 82; x <= 174; x += 6) {
        ctx.beginPath();
        ctx.moveTo(x, 206);
        ctx.lineTo(x + 2, 234);
        ctx.stroke();
      }

      return new THREE.CanvasTexture(c);
    };

    const knitMat = new THREE.MeshStandardMaterial({
      map: createKnitTexture(),
      roughness: 0.58,
    });
    const denimMat = new THREE.MeshStandardMaterial({
      map: createDenimTexture(),
      roughness: 0.68,
    });
    const silverMat = new THREE.MeshStandardMaterial({
      color: '#D8DDE2',
      metalness: 0.88,
      roughness: 0.16,
    });

    // Head & Editorial Bob Hairstyle + Rimless Glasses
    const headGroup = new THREE.Group();
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 32), skinMat);
    headMesh.scale.set(0.88, 1.12, 0.92);
    headGroup.add(headMesh);

    // Sleek dark center-parted bob hair
    const hairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.205, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.68),
      hairMat
    );
    hairCrown.position.set(0, 0.03, -0.02);
    headGroup.add(hairCrown);

    const hairLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.22), hairMat);
    hairLeft.position.set(-0.155, -0.05, 0.0);
    hairLeft.rotation.z = 0.08;
    const hairRight = hairLeft.clone();
    hairRight.position.x = 0.155;
    hairRight.rotation.z = -0.08;
    headGroup.add(hairLeft, hairRight);

    // Editorial rectangular glasses
    const frameGeo = new THREE.BoxGeometry(0.075, 0.038, 0.01);
    const glassLeft = new THREE.Mesh(frameGeo, silverMat);
    glassLeft.position.set(-0.058, 0.02, 0.175);
    const glassRight = glassLeft.clone();
    glassRight.position.x = 0.058;
    headGroup.add(glassLeft, glassRight);

    headGroup.position.set(0, 1.38, 0);
    figureGroup.add(headGroup);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.18, 20), skinMat);
    neck.position.set(0, 1.15, 0);
    figureGroup.add(neck);

    // Sculpted Torso in Asymmetric Pastel Cutout Hemp Knit Top
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.165, 0.66, 32, 16),
      knitMat
    );
    torso.scale.set(1.05, 1.0, 0.68);
    torso.position.set(0, 0.78, 0);
    torso.castShadow = true;
    figureGroup.add(torso);

    // Wide-Leg Recycled Patchwork Denim Jeans (Left & Right Sculptural Trousers)
    const hipBlock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.175, 0.22, 0.26, 28),
      denimMat
    );
    hipBlock.scale.set(1.08, 1.0, 0.72);
    hipBlock.position.set(0, 0.34, 0);
    figureGroup.add(hipBlock);

    const leftLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.165, 1.25, 28, 12),
      denimMat
    );
    leftLeg.position.set(-0.125, -0.38, 0.02);
    leftLeg.rotation.z = -0.035;
    leftLeg.castShadow = true;
    figureGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.165, 1.25, 28, 12),
      denimMat
    );
    rightLeg.position.set(0.125, -0.38, -0.01);
    rightLeg.rotation.z = 0.035;
    rightLeg.castShadow = true;
    figureGroup.add(rightLeg);

    // White Platform Sneakers
    const shoeMat = new THREE.MeshStandardMaterial({ color: '#F2EFE9', roughness: 0.4 });
    const shoeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.26), shoeMat);
    shoeLeft.position.set(-0.14, -1.03, 0.06);
    const shoeRight = shoeLeft.clone();
    shoeRight.position.set(0.14, -1.03, 0.04);
    figureGroup.add(shoeLeft, shoeRight);

    // Left Arm (relaxed at side in Stage 2, supporting in Stage 1)
    const leftArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.044, 0.68, 20),
      skinMat
    );
    leftArm.position.set(0.27, 0.72, 0.02);
    leftArm.rotation.z = 0.12;
    figureGroup.add(leftArm);

    // Right Arm + Foreshortened Reaching Hand + Silver Chain Link Bracelet (Hero Feature of Stage 1!)
    const reachArmGroup = new THREE.Group();
    reachArmGroup.position.set(-0.24, 0.98, 0.06);
    reachArmGroupRef.current = reachArmGroup;

    const armShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.048, 0.68, 24),
      skinMat
    );
    armShaft.rotation.x = Math.PI / 2;
    armShaft.position.set(0, 0, 0.34);
    reachArmGroup.add(armShaft);

    // Silver Chain Bracelet around the wrist
    const chainGroup = new THREE.Group();
    for (let c = 0; c < 8; c++) {
      const angle = (c / 8) * Math.PI * 2;
      const link = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 10, 18), silverMat);
      link.position.set(Math.cos(angle) * 0.065, Math.sin(angle) * 0.065 - 0.02, 0.58);
      link.rotation.y = angle;
      chainGroup.add(link);
    }
    reachArmGroup.add(chainGroup);

    // Sculpted Open Palm & Outstretched Fingers reaching toward camera
    const handGroup = new THREE.Group();
    handGroup.position.set(0, 0, 0.72);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 24), skinMat);
    palm.scale.set(1.15, 0.95, 0.55);
    handGroup.add(palm);

    const fingerSpecs: Array<[number, number, number, number, number]> = [
      [-0.085, -0.02, 0.09, 0.65, -0.15], // Thumb
      [-0.048, 0.085, 0.125, -0.35, 0.12], // Index
      [-0.012, 0.098, 0.135, -0.05, 0.15], // Middle
      [0.026, 0.088, 0.125, 0.22, 0.12], // Ring
      [0.058, 0.062, 0.1, 0.48, 0.08], // Pinky
    ];
    fingerSpecs.forEach(([fx, fy, len, rz, rx]) => {
      const f = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.016, len, 8, 12),
        skinMat
      );
      f.position.set(fx, fy, 0.03);
      f.rotation.z = rz;
      f.rotation.x = rx;
      handGroup.add(f);
    });

    reachArmGroup.add(handGroup);
    figureGroup.add(reachArmGroup);

    scene.add(figureGroup);

    // Pointer Interaction
    const pointer = new THREE.Vector2(0, 0);
    const onMove = (e: MouseEvent) => {
      pointer.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener('mousemove', onMove);

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      clothUniforms.uTime.value = t;
      clothUniforms.uPointer.value.lerp(pointer, 0.06);

      if (figureGroupRef.current) {
        figureGroupRef.current.rotation.y +=
          (pointer.x * 0.14 + Math.sin(t * 0.6) * 0.03 - figureGroupRef.current.rotation.y) *
          0.06;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, []);

  // Choreograph 3D Figure Pose & Camera between Stage 0 (Foreshortened Reach), Stage 1 (Full-Length Standing), and Stage 2 (Macro Textile Archive)
  useEffect(() => {
    const cam = cameraRef.current;
    const fig = figureGroupRef.current;
    const arm = reachArmGroupRef.current;
    const uniforms = clothUniformsRef.current;
    if (!cam || !fig || !arm || !uniforms) return;

    gsap.to(uniforms.uLookIndex, { value: selectedLook, duration: 0.8 });
    gsap.to(uniforms.uTension, { value: fabricTension, duration: 0.6 });

    if (stage === 0) {
      // Stage 1 (c_intro_24.jpg): Dynamic foreshortened low-angle reach toward camera
      gsap.to(cam.position, { x: -0.08, y: 0.72, z: 2.35, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(fig.position, { x: 0.22, y: -0.18, z: 0.35, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(fig.rotation, { x: 0.18, z: -0.14, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(arm.rotation, { x: -0.12, y: 0.28, z: 0.05, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(arm.scale, { x: 1.35, y: 1.35, z: 1.45, duration: 1.25, ease: 'power3.inOut' });
    } else if (stage === 1) {
      // Stage 2 (c_intro_26.jpg): Full-length standing silhouette centered in the gallery
      gsap.to(cam.position, { x: 0.0, y: 0.18, z: 4.35, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(fig.position, { x: 0.0, y: 0.05, z: 0.0, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(fig.rotation, { x: 0.0, z: 0.0, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(arm.rotation, { x: 1.38, y: 0.0, z: -0.12, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(arm.scale, { x: 0.85, y: 0.85, z: 0.85, duration: 1.25, ease: 'power3.inOut' });
    } else {
      // Stage 3: Atelier Macro Weave & Garment Drape Inspection
      gsap.to(cam.position, { x: 0.12, y: 0.52, z: 2.85, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(fig.position, { x: -0.15, y: -0.05, z: 0.15, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(fig.rotation, { x: 0.04, z: 0.03, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(arm.rotation, { x: 1.15, y: 0.15, z: -0.08, duration: 1.25, ease: 'power3.inOut' });
      gsap.to(arm.scale, { x: 0.95, y: 0.95, z: 0.95, duration: 1.25, ease: 'power3.inOut' });
    }
  }, [stage, selectedLook, fabricTension]);

  return <div ref={mountRef} className="w-full h-full" />;
};
