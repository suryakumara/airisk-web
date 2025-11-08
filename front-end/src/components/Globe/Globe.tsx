import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface Props {
  glbPath?: string; // e.g. "/assets/barong-glb/base_basic_pbr.glb"
}

const Globe: React.FC<Props> = ({ glbPath = "/assets/barong-glb/base_basic_pbr.glb" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.5, 2.5);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.2;

    // --- Environment ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const neutralEnv = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = neutralEnv;

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(2, 2, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-3, 1, -2);
    scene.add(rimLight);

    // --- Background Particles ---
    const particleCount = 1200;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < posArray.length; i++) posArray[i] = (Math.random() - 0.5) * 5;
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ size: 0.005, color: 0x77aaff })
    );
    scene.add(particles);

    // --- Eye Geometry / Material ---
    const pupilGeo = new THREE.SphereGeometry(0.05, 15, 15);
    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.5,
      metalness: 0.7,
      roughness: 0.2,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    // --- GLTF Loader ---
    const loader = new GLTFLoader();
    const globeRef = { current: null as THREE.Object3D | null };
    let leftEye: THREE.Mesh | null = null;
    let rightEye: THREE.Mesh | null = null;

    loader.load(
      glbPath,
      (gltf) => {
        const object = gltf.scene;

        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        // --- Center and scale the model ---
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);
        object.position.y = 0.2;

        const size = box.getSize(new THREE.Vector3());
        const scale = 2 / Math.max(size.x, size.y, size.z);
        object.scale.multiplyScalar(scale);

        // --- Attach Eyes to Model (LOCAL SPACE) ---
        leftEye = new THREE.Mesh(pupilGeo, pupilMat.clone());
        rightEye = new THREE.Mesh(pupilGeo, pupilMat.clone());
        leftEye.renderOrder = 999;
        rightEye.renderOrder = 999;

        // 🧩 These are now LOCAL positions relative to the mask’s origin
        // Adjust freely here — Z no longer changes size visually
        // leftEye.position.set(-4, 0.9, -0.08);
        // rightEye.position.set(0.35, 0.9, -0.08);

        // Attach directly to the mask
        object.add(leftEye);
        object.add(rightEye);

        scene.add(object);
        globeRef.current = object;
      },
      undefined,
      (err) => console.error("Error loading GLB:", err)
    );

    // --- Mouse tracking ---
    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener("mousemove", (e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    });

    // --- Animation Loop ---
    let t = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.01;

      const baseWave = Math.sin(t) * 0.05;
      const subWave = Math.sin(t * 1.5) * 0.02;
      const sideWave = Math.sin(t * 0.5) * 0.05;
      const twistWave = Math.cos(t * 0.6) * 0.1;

      // Float & rotate mask
      if (globeRef.current) {
        globeRef.current.position.y = 0.2 + baseWave + subWave;
        globeRef.current.position.x = sideWave * 0.2;
        globeRef.current.rotation.x = Math.sin(t * 0.7) * 0.1;
        globeRef.current.rotation.y = Math.sin(t * 0.9) * 0.1;
        globeRef.current.rotation.z = twistWave;
      }

      // Animate eyes relative to mask
      if (leftEye && rightEye) {
        const eyeMoveX = mouseX * 0.05;
        const eyeMoveY = mouseY * 0.05;

        leftEye.position.x = -0.23 + eyeMoveX;
        rightEye.position.x = 0.23 + eyeMoveX;
        leftEye.position.y = 0.72 + eyeMoveY;
        rightEye.position.y = 0.72 + eyeMoveY;

        const pulse = (Math.sin(t * 3) + 1) / 2;
        (leftEye.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2 + pulse * 0.8;
        (rightEye.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2 + pulse * 0.8;
      }

      particles.rotation.y += 0.0003;
      renderer.render(scene, camera);
    };
    animate();

    // --- Resize ---
    const onResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      pmremGenerator.dispose();
      neutralEnv.dispose();
    };
  }, [glbPath]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
};

export default Globe;
