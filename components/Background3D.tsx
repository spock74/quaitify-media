import React, { useEffect, useRef } from 'react';

const Background3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Configuration
    const particleCount = 600;
    const sphereRadius = Math.min(width, height) * 0.35;
    const rotationSpeed = 0.002;

    interface Point {
      x: number;
      y: number;
      z: number;
    }

    // Generate points on a sphere
    const points: Point[] = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.sqrt(particleCount * Math.PI) * theta;

      points.push({
        x: sphereRadius * Math.sin(theta) * Math.cos(phi),
        y: sphereRadius * Math.sin(theta) * Math.sin(phi),
        z: sphereRadius * Math.cos(theta),
      });
    }

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // Rotate
      angleX += rotationSpeed;
      angleY += rotationSpeed * 0.6;

      const cx = width / 2;
      const cy = height / 2;

      // Draw points
      points.forEach(point => {
        // Rotation Matrix logic simplified
        let x = point.x;
        let y = point.y;
        let z = point.z;

        // Rotate around Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        x = x1;
        z = z1;

        // Rotate around X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = y * cosX - z * sinX;
        const z2 = z * cosX + y * sinX;
        y = y2;
        z = z2;

        // Perspective projection
        const scale = 400 / (400 + z);
        const x2D = x * scale + cx;
        const y2D = y * scale + cy;

        // Draw particle
        // Alpha depends on Z (depth)
        const alpha = (z + sphereRadius) / (2 * sphereRadius); 
        const size = Math.max(0.5, scale * 2.5);

        ctx.beginPath();
        ctx.arc(x2D, y2D, size, 0, Math.PI * 2);
        
        // Gradient color based on depth
        const r = 6 + (alpha * 50); // minimal red
        const g = 182 + (alpha * 50); // cyan/teal range
        const b = 212;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + alpha * 0.7})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Init size
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
};

export default Background3D;