/* Neural background: nodes + synapses with traveling "thought" pulses.
   Cursor excites nearby nodes; clicks fire cascades. Replaces particles.js. */
(() => {
   const canvas = document.getElementById('neural-bg');
   if (!canvas) return;
   const ctx = canvas.getContext('2d');
   const isMobile = matchMedia('(max-width: 768px)').matches;
   const NODE_COUNT = isMobile ? 28 : 55;
   const LINK_DIST = 160;
   const mouse = { x: -9999, y: -9999 };
   let nodes = [], pulses = [], W, H, raf;
   let frameCount = 0;

   const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

   function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth;
      H = innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
   }

   function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
         x: Math.random() * W,
         y: Math.random() * H,
         vx: (Math.random() - 0.5) * 0.15,
         vy: (Math.random() - 0.5) * 0.15,
         charge: 0
      }));
   }

   function neighbors(node) {
      return nodes.filter(m => m !== node && dist(node, m) < LINK_DIST);
   }

   function fire(node, depth) {
      if (depth <= 0) return;
      node.charge = 1;
      const ns = neighbors(node);
      if (!ns.length) return;
      const target = ns[Math.floor(Math.random() * ns.length)];
      pulses.push({ from: node, to: target, t: 0, depth });
   }

   function pulseArrived(p) {
      p.to.charge = 1;
      if (Math.random() < 0.75) fire(p.to, p.depth - 1);
   }

   let lastFire = 0, nextFireDelay = 1000;
   function autoFire(now) {
      if (now - lastFire > nextFireDelay) {
         fire(nodes[Math.floor(Math.random() * nodes.length)], 3);
         lastFire = now;
         nextFireDelay = 800 + Math.random() * 1400;
      }
   }

   let lastCursorFire = 0;
   window.addEventListener('pointermove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const now = performance.now();
      if (now - lastCursorFire > 600) {
         const near = nodes.find(n => dist(n, mouse) < 120);
         if (near) {
            fire(near, 2);
            lastCursorFire = now;
         }
      }
   });

   window.addEventListener('click', e => {
      let best = null, bestD = Infinity;
      for (const n of nodes) {
         const d = Math.hypot(n.x - e.clientX, n.y - e.clientY);
         if (d < bestD) { bestD = d; best = n; }
      }
      if (best) fire(best, 5);
   });

   function tick(now) {
      ctx.clearRect(0, 0, W, H);
      autoFire(now);

      for (const n of nodes) {
         n.x += n.vx;
         n.y += n.vy;
         if (n.x < 0) n.x += W;
         if (n.x > W) n.x -= W;
         if (n.y < 0) n.y += H;
         if (n.y > H) n.y -= H;
         n.charge *= 0.96;
         const md = Math.hypot(n.x - mouse.x, n.y - mouse.y);
         if (md < 120) n.charge = Math.max(n.charge, (1 - md / 120) * 0.6);
      }

      for (let i = 0; i < nodes.length; i++) {
         for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j], d = dist(a, b);
            if (d < LINK_DIST) {
               const alpha = (1 - d / LINK_DIST) * 0.18 + Math.max(a.charge, b.charge) * 0.1;
               ctx.strokeStyle = 'rgba(6,168,243,' + alpha.toFixed(3) + ')';
               ctx.lineWidth = 1;
               ctx.beginPath();
               ctx.moveTo(a.x, a.y);
               ctx.lineTo(b.x, b.y);
               ctx.stroke();
            }
         }
      }

      pulses = pulses.filter(p => {
         p.t += 16 / 600;
         if (p.t >= 1) {
            pulseArrived(p);
            return false;
         }
         const x = p.from.x + (p.to.x - p.from.x) * p.t;
         const y = p.from.y + (p.to.y - p.from.y) * p.t;
         ctx.fillStyle = 'rgba(0,240,255,0.9)';
         ctx.shadowColor = '#00f0ff';
         ctx.shadowBlur = 8;
         ctx.beginPath();
         ctx.arc(x, y, 2.2, 0, 7);
         ctx.fill();
         ctx.shadowBlur = 0;
         return true;
      });

      for (const n of nodes) {
         const r = 1.6 + n.charge * 2.2;
         ctx.fillStyle = n.charge > 0.15
            ? 'rgba(0,240,255,' + (0.5 + 0.5 * n.charge).toFixed(3) + ')'
            : 'rgba(6,168,243,0.55)';
         ctx.beginPath();
         ctx.arc(n.x, n.y, r, 0, 7);
         ctx.fill();
      }

      frameCount++;
      raf = requestAnimationFrame(tick);
   }

   document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
         cancelAnimationFrame(raf);
      } else {
         raf = requestAnimationFrame(tick);
      }
   });

   window.addEventListener('resize', () => {
      resize();
      initNodes();
   });

   window.__neuralStats = () => ({ nodes: nodes.length, pulses: pulses.length, frames: frameCount });

   resize();
   initNodes();
   raf = requestAnimationFrame(tick);
})();
