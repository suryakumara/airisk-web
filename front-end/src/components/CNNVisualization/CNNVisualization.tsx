import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const NeuralNetworkAnimatedLinks: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // === Scene ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b0b);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // === Lights ===
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // === Network Setup ===
    const layers = [8, 10, 10, 8, 4];
    const layerSpacing = 5;
    const neuronRadius = 0.25;

    const neuronGeo = new THREE.SphereGeometry(neuronRadius, 16, 16);
    const neuronMat = new THREE.MeshPhongMaterial({
      color: 0x7f8cff,
      emissive: 0x4444ff,
      emissiveIntensity: 0.4,
    });

    const neurons: THREE.Vector3[][] = [];
    for (let i = 0; i < layers.length; i++) {
      const count = layers[i];
      const instanced = new THREE.InstancedMesh(neuronGeo, neuronMat, count);
      const layerNeurons: THREE.Vector3[] = [];
      for (let j = 0; j < count; j++) {
        const y = (j - count / 2) * 0.8;
        const x = (i - layers.length / 2) * layerSpacing;
        const position = new THREE.Vector3(x, y, 0);
        instanced.setMatrixAt(j, new THREE.Matrix4().makeTranslation(x, y, 0));
        layerNeurons.push(position);
      }
      neurons.push(layerNeurons);
      scene.add(instanced);
    }

    // === Animated Connection Lines ===
    const connectionGroup = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.25,
      linewidth: 1,
    });

    const allLines: THREE.Line[] = [];
    for (let i = 0; i < neurons.length - 1; i++) {
      const fromLayer = neurons[i];
      const toLayer = neurons[i + 1];
      for (const a of fromLayer) {
        for (const b of toLayer) {
          const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
          const line = new THREE.Line(geom, lineMaterial.clone());
          connectionGroup.add(line);
          allLines.push(line);
        }
      }
    }
    scene.add(connectionGroup);

    // === Text Labels ===
    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const layerNames = [
          "Input Layer",
          "Hidden Layer 1",
          "Hidden Layer 2",
          "Hidden Layer 3",
          "Output Layer",
        ];
        layerNames.forEach((label, i) => {
          const geometry = new TextGeometry(label, {
            font,
            size: 0.5,
            depth: 0.01,
          });
          const mesh = new THREE.Mesh(geometry, textMaterial);
          const x = (i - layers.length / 2) * layerSpacing;
          mesh.position.set(x - 1.5, layers[i] * 0.4 + 1.2, 0);
          scene.add(mesh);
        });
      }
    );

    // === Animation Loop ===
    let t = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.01;

      // Pulse neurons
      neuronMat.emissiveIntensity = 0.6 + Math.sin(t * 2) * 0.4;

      // Rotate network slightly
      connectionGroup.rotation.y = Math.sin(t * 0.3) * 0.2;

      // Animate link color through hues
      allLines.forEach((line, idx) => {
        const h = (Math.sin(t * 2 + idx * 0.1) * 0.5 + 0.5) * 0.6;
        (line.material as THREE.LineBasicMaterial).color.setHSL(h, 1.0, 0.5);
        (line.material as THREE.LineBasicMaterial).opacity =
          0.2 + Math.abs(Math.sin(t * 3 + idx * 0.3)) * 0.3;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // === Resize Handling ===
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-[600px]" />;
};

export default NeuralNetworkAnimatedLinks;
