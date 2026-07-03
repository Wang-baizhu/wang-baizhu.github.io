// 轻量工作流画布交互脚本：拖动视角、滚轮缩放、按钮缩放、适配视图。
(function(){
  const viewport = document.getElementById('viewport');
  const stage = document.getElementById('stage');
  const fitBtn = document.getElementById('fitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const scaleLabel = document.getElementById('scaleLabel');
  const bounds = {"minX": 0.0, "minY": -0.0, "width": 2280.0, "height": 620.4};
  const minScale = 0.08, maxScale = 2.8;
  let view = {x: 60, y: 60, scale: 0.701754};
  function clampScale(s) { return Math.max(minScale, Math.min(maxScale, s)); }
  function apply() { stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`; scaleLabel.textContent = Math.round(view.scale * 100) + '%'; }
  function fit() { const pad = 54, vw = Math.max(320, viewport.clientWidth), vh = Math.max(240, viewport.clientHeight); const scale = Math.min((vw-pad*2)/bounds.width, (vh-pad*2)/bounds.height, 1); view.scale = clampScale(scale); view.x = pad - bounds.minX * view.scale; view.y = pad - bounds.minY * view.scale; apply(); }
  function reset() { fit(); }
  function zoomAt(clientX, clientY, factor) { const old = view.scale, next = clampScale(old * factor); const rect = viewport.getBoundingClientRect(); const cx = clientX - rect.left, cy = clientY - rect.top; const wx = (cx - view.x) / old, wy = (cy - view.y) / old; view.scale = next; view.x = cx - wx * next; view.y = cy - wy * next; apply(); }
  function zoomCenter(factor) { const rect = viewport.getBoundingClientRect(); zoomAt(rect.left + rect.width/2, rect.top + rect.height/2, factor); }
  let dragging = false, last = {x:0,y:0};
  viewport.addEventListener('pointerdown', e => { if(e.button!==0) return; dragging=true; last={x:e.clientX,y:e.clientY}; viewport.classList.add('dragging'); viewport.setPointerCapture(e.pointerId); });
  viewport.addEventListener('pointermove', e => { if(!dragging) return; view.x += e.clientX-last.x; view.y += e.clientY-last.y; last={x:e.clientX,y:e.clientY}; apply(); });
  function stopDrag(e) { dragging=false; viewport.classList.remove('dragging'); try{viewport.releasePointerCapture(e.pointerId)}catch(_){} }
  viewport.addEventListener('pointerup', stopDrag); viewport.addEventListener('pointercancel', stopDrag);
  viewport.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? 0.90 : 1.10); }, {passive:false});
  fitBtn && fitBtn.addEventListener('click', fit); resetBtn && resetBtn.addEventListener('click', reset);
  zoomInBtn && zoomInBtn.addEventListener('click', () => zoomCenter(1.18)); zoomOutBtn && zoomOutBtn.addEventListener('click', () => zoomCenter(1/1.18));
  window.addEventListener('resize', fit);
  window.addEventListener('keydown', e => { if((e.ctrlKey||e.metaKey)&&e.key==='0'){e.preventDefault();fit();} if((e.ctrlKey||e.metaKey)&&(e.key==='+'||e.key==='=')){e.preventDefault();zoomCenter(1.18);} if((e.ctrlKey||e.metaKey)&&e.key==='-'){e.preventDefault();zoomCenter(1/1.18);} });
  fit();
  window.__workflowView = {fit, reset, zoomCenter, getView:()=>({...view}), bounds};
})();
