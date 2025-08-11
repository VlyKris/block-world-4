import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";

interface GameControlsProps {
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  playerPosition: React.MutableRefObject<THREE.Vector3>;
  playerRotation: React.MutableRefObject<THREE.Euler>;
}

export function GameControls({ cameraRef, playerPosition, playerRotation }: GameControlsProps) {
  const { camera, gl } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});
  const mouseMovement = useRef({ x: 0, y: 0 });
  const isPointerLocked = useRef(false);

  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  // Pointer lock controls
  const requestPointerLock = useCallback(() => {
    gl.domElement.requestPointerLock();
  }, [gl]);

  const handlePointerLockChange = useCallback(() => {
    isPointerLocked.current = document.pointerLockElement === gl.domElement;
  }, [gl]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isPointerLocked.current) return;

    const sensitivity = 0.002;
    mouseMovement.current.x -= event.movementX * sensitivity;
    mouseMovement.current.y -= event.movementY * sensitivity;

    // Clamp vertical rotation
    mouseMovement.current.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseMovement.current.y));
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keys.current[event.code] = true;
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keys.current[event.code] = false;
  }, []);

  useEffect(() => {
    // Click to start controls
    gl.domElement.addEventListener('click', requestPointerLock);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      gl.domElement.removeEventListener('click', requestPointerLock);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [gl, requestPointerLock, handlePointerLockChange, handleMouseMove, handleKeyDown, handleKeyUp]);

  useFrame((state, delta) => {
    if (!isPointerLocked.current) return;

    // Update rotation
    playerRotation.current.y = mouseMovement.current.x;
    playerRotation.current.x = mouseMovement.current.y;

    // Movement
    const speed = 10;
    direction.current.set(0, 0, 0);

    if (keys.current['KeyW']) direction.current.z -= 1;
    if (keys.current['KeyS']) direction.current.z += 1;
    if (keys.current['KeyA']) direction.current.x -= 1;
    if (keys.current['KeyD']) direction.current.x += 1;
    if (keys.current['Space']) direction.current.y += 1;
    if (keys.current['ShiftLeft']) direction.current.y -= 1;

    // Apply rotation to movement direction
    direction.current.normalize();
    direction.current.applyEuler(new THREE.Euler(0, playerRotation.current.y, 0));

    // Update velocity
    velocity.current.multiplyScalar(0.8); // Damping
    velocity.current.addScaledVector(direction.current, speed * delta);

    // Update position
    playerPosition.current.add(velocity.current);

    // Update camera
    camera.position.copy(playerPosition.current);
    camera.position.y += 1.8; // Eye height
    camera.rotation.copy(playerRotation.current);
  });

  return null;
}