import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function Whiteboard3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(75, 800 / 500, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(800, 500);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const geometry = new THREE.PlaneGeometry(5, 3);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const board = new THREE.Mesh(geometry, material);
    scene.add(board);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let lastPoint = null;
    let drawing = false;

    const onMouseDown = () => (drawing = true);
    const onMouseUp = () => {
      drawing = false;
      lastPoint = null;
    };

    const onMouseMove = (e) => {
      if (!drawing) return;
      mouse.x = (e.offsetX / 800) * 2 - 1;
      mouse.y = -(e.offsetY / 500) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(board);
      if (!hits.length) return;

      const point = hits[0].point;

      if (lastPoint) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          lastPoint,
          point,
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x000000 });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
      }

      lastPoint = point.clone();
    };

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mouseleave", onMouseUp);
    renderer.domElement.addEventListener("mousemove", onMouseMove);

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  }, []);
  // useEffect(() => {
  //   let mode = "draw";

  //   const scene = new THREE.Scene();
  //   scene.background = new THREE.Color(0xffffff);

  //   const camera = new THREE.PerspectiveCamera(75, 800 / 500, 0.1, 1000);
  //   camera.position.z = 5;

  //   const renderer = new THREE.WebGLRenderer();
  //   renderer.setSize(800, 500);
  //   mountRef.current.appendChild(renderer.domElement);

  //   const controls = new OrbitControls(camera, renderer.domElement);
  //   controls.enableDamping = true;
  //   controls.enabled = false;

  //   const geometry = new THREE.PlaneGeometry(5, 3);
  //   const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  //   const board = new THREE.Mesh(geometry, material);
  //   scene.add(board);

  //   const raycaster = new THREE.Raycaster();
  //   const mouse = new THREE.Vector2();
  //   let lastPoint = null;
  //   let drawing = false;

  //   window.addEventListener("keydown", (e) => {
  //     if (e.code === "Space") mode = "rotate";
  //   });
  //   window.addEventListener("keyup", () => (mode = "draw"));

  //   const onMouseDown = (e) => {
  //     if (mode === "draw") drawing = true;
  //     if (mode === "rotate") {
  //       controls.enabled = true;
  //       controls.onMouseDown(e); // 👈 forward event to OrbitControls
  //     }
  //   };

  //   const onMouseUp = () => {
  //     drawing = false;
  //     lastPoint = null;
  //     controls.enabled = false;
  //   };

  //   const onMouseMove = (e) => {
  //     if (mode !== "draw" || !drawing) return;
  //     if (!drawing) return;
  //     mouse.x = (e.offsetX / 800) * 2 - 1;
  //     mouse.y = -(e.offsetY / 500) * 2 + 1;
  //     raycaster.setFromCamera(mouse, camera);
  //     const hits = raycaster.intersectObject(board);
  //     if (!hits.length) return;

  //     const point = hits[0].point;
  //     if (lastPoint) {
  //       const lineGeo = new THREE.BufferGeometry().setFromPoints([
  //         lastPoint,
  //         point,
  //       ]);
  //       const line = new THREE.Line(
  //         lineGeo,
  //         new THREE.LineBasicMaterial({ color: 0x000000 }),
  //       );
  //       scene.add(line);
  //     }
  //     lastPoint = point.clone();
  //   };

  //   renderer.domElement.addEventListener("mousedown", onMouseDown);
  //   renderer.domElement.addEventListener("mouseup", onMouseUp);
  //   renderer.domElement.addEventListener("mouseleave", onMouseUp);
  //   renderer.domElement.addEventListener("mousemove", onMouseMove);

  //   function animate() {
  //     requestAnimationFrame(animate);
  //     controls.update();
  //     renderer.render(scene, camera);
  //   }
  //   animate();
  // }, []);

  return <div ref={mountRef}></div>;
}
