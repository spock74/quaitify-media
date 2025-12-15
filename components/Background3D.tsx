import React, { useEffect, useRef } from 'react';

export type AnimationVariant = 'sphere' | 'knot';

interface Background3DProps {
  variant?: AnimationVariant;
}

const Background3D: React.FC<Background3DProps> = ({ variant = 'sphere' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // ==================================================================================
    // 🔧 ANIMATION CONTROLS (PARAMETROS AJUSTAVEIS)
    // ==================================================================================

    // [CAMERA / ZOOM] 
    // Controla o tamanho do objeto em relação à tela.
    // Aumente para aproximar (zoom in), diminua para afastar.
    // Valor sugerido Knot: 0.22, Sphere: 0.35
    // Ajustado para afastar a camera conforme solicitado (0.14 para Knot, 0.25 para Sphere)
    const CAMERA_ZOOM = variant === 'knot' ? 0.14 : 0.25;

    // [DENSIDADE DE PARTICULAS]
    // Controla quantas partículas formam o objeto.
    // Aumente para deixar mais "sólido/denso", diminua para ficar mais disperso.
    // Valor sugerido Knot: 2600, Sphere: 600
    const PARTICLE_DENSITY = variant === 'knot' ? 2600 : 600;

    // ==================================================================================

    const baseScale = Math.min(width, height) * CAMERA_ZOOM;
    const rotationSpeed = 0.002;

    interface Point {
      x: number;
      y: number;
      z: number;
      baseColor?: string; // Used for knot gradient
    }

    // Generate points based on variant
    const points: Point[] = [];

    if (variant === 'sphere') {
      // Original Sphere Logic
      for (let i = 0; i < PARTICLE_DENSITY; i++) {
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.sqrt(PARTICLE_DENSITY * Math.PI) * theta;

        points.push({
          x: baseScale * Math.sin(theta) * Math.cos(phi),
          y: baseScale * Math.sin(theta) * Math.sin(phi),
          z: baseScale * Math.cos(theta),
        });
      }
    } else {
      // Torus Knot Logic (Trefoil-ish)
      // Parametric equation for a (p,q) torus knot
      const p = 2;
      const q = 3; 
      // Decreased radius significantly (0.6 -> 0.25) to condense the shape into a "solid" tube
      const tubeRadius = 0.25; 
      
      for (let i = 0; i < PARTICLE_DENSITY; i++) {
        // t represents the angle along the curve
        const t = Math.random() * Math.PI * 2 * p * q; 
        
        // Curve definition
        const r = 2 + Math.cos(q * t);
        const cx = r * Math.cos(p * t);
        const cy = r * Math.sin(p * t);
        const cz = -Math.sin(q * t);

        // Add volume (random fuzz around the point)
        // Simple spherical noise around the curve point
        const noiseTheta = Math.random() * Math.PI * 2;
        const noisePhi = Math.random() * Math.PI;
        const noiseR = Math.random() * tubeRadius;
        
        const nx = noiseR * Math.sin(noisePhi) * Math.cos(noiseTheta);
        const ny = noiseR * Math.sin(noisePhi) * Math.sin(noiseTheta);
        const nz = noiseR * Math.cos(noisePhi);

        // Assign color based on position along the curve (t)
        // Normalize t to 0-1 range for hue
        const normalizedT = (t % (Math.PI * 2)) / (Math.PI * 2);
        const hue = normalizedT * 360;
        
        points.push({
          x: (cx + nx) * baseScale,
          y: (cy + ny) * baseScale,
          z: (cz + nz) * baseScale,
          baseColor: `hsla(${hue}, 80%, 60%,` 
        });
      }
    }

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // Rotate
      angleX += rotationSpeed;
      angleY += rotationSpeed * 0.8;

      const cx = width / 2;
      const cy = height / 2;

      points.forEach(point => {
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
        const fov = 400;
        const scale = fov / (fov + z);
        const x2D = x * scale + cx;
        const y2D = y * scale + cy;

        // Draw particle
        const alpha = (z + baseScale * 2) / (3 * baseScale); 
        // Slightly reduced max size for knot to accommodate higher density
        const size = Math.max(0.5, scale * (variant === 'knot' ? 1.8 : 2.5));

        ctx.beginPath();
        ctx.arc(x2D, y2D, size, 0, Math.PI * 2);
        
        if (variant === 'knot' && point.baseColor) {
           // Use pre-calculated hue, modify alpha based on depth
           // Increased base opacity slightly for solid feel
           const cleanAlpha = Math.max(0.15, Math.min(1, 0.4 + alpha * 0.6));
           ctx.fillStyle = `${point.baseColor} ${cleanAlpha})`;
        } else {
           // Default Sphere Colors (Cyan/Teal)
           const r = 6 + (alpha * 50); 
           const g = 182 + (alpha * 50); 
           const b = 212;
           ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 + alpha * 0.7})`;
        }
         
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // Re-run render to clear immediately
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
};

export default Background3D;