// main.js - contiene la lógica de la aplicación (antes inline en HTML).
(function(){
  // Estado y respuestas
  const totalControls = frameworkData.cisControls.length;
  const results = Array(totalControls).fill(null); // 'yes'|'no'|'unsure'
  // Company metadata captured from pre-assessment
  const companyMeta = { employees: null, revenue: null, hasWebsite: 'no', storageTools: '', consultancyEmail: '' };

  // UI elements
  const startButton = document.getElementById('startButton');
  const saveProgressTop = document.getElementById('saveProgressTop');
  const loadProgressTop = document.getElementById('loadProgressTop');
  const assessmentModule = document.getElementById('assessmentModule');
  const resultsModule = document.getElementById('resultsModule');
  const overallScoreEl = document.getElementById('overallScore');
  const functionScoresEl = document.getElementById('functionScores');
  const statusBody = document.getElementById('statusBody');
  const guidanceContainer = document.getElementById('guidanceContainer');
  const roadmapFilters = document.getElementById('roadmapFilters');
  const themeToggle = document.getElementById('themeToggle');
  // Import confirmation modal elements
  const importConfirmModal = document.getElementById('importConfirmModal');
  const importSummaryText = document.getElementById('importSummaryText');
  const importSummarySchema = document.getElementById('importSummarySchema');
  const importSummaryResultsCount = document.getElementById('importSummaryResultsCount');
  const importSummaryExpected = document.getElementById('importSummaryExpected');
  const importSummaryMeta = document.getElementById('importSummaryMeta');
  const importSummaryCompat = document.getElementById('importSummaryCompat');
  const importConfirmBtn = document.getElementById('importConfirmBtn');
  const importCancelBtn = document.getElementById('importCancelBtn');
  const importChangesList = document.getElementById('importChangesList');
  const importOnlyDiffs = document.getElementById('importOnlyDiffs');
  const importFilterFunction = document.getElementById('importFilterFunction');
  const importFilterPriority = document.getElementById('importFilterPriority');
  const importPageSize = document.getElementById('importPageSize');
  const importPagePrev = document.getElementById('importPagePrev');
  const importPageNext = document.getElementById('importPageNext');
  const importPageIndicator = document.getElementById('importPageIndicator');
  const importLoading = document.getElementById('importLoading');
  // state for paged preview
  let changesData = [];
  let changesPage = 1;
  let changesPageSize = 10;
  let lastFocusedElement = null;

  // Theme initialization: light/dark toggle with persistence
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    if(themeToggle){
      themeToggle.textContent = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
      themeToggle.setAttribute('aria-pressed', theme === 'dark');
    }
    try{ localStorage.setItem('ciberDiag_theme', theme); }catch(e){}
  }
  // apply saved theme or prefer system (default to light)
  try{
    const saved = localStorage.getItem('ciberDiag_theme') || 'light';
    applyTheme(saved);
  }catch(e){ applyTheme('light'); }
  if(themeToggle) themeToggle.addEventListener('click', ()=>{ const next = document.documentElement.getAttribute('data-theme')==='dark' ? 'light' : 'dark'; applyTheme(next); });

  // Progress and question state
  let currentIndex = 0;
  const totalStepsEl = document.getElementById('totalSteps');
  const currentStepEl = document.getElementById('currentStep');
  const progressFill = document.getElementById('progressFill');

  totalStepsEl.textContent = Object.keys(frameworkData.nistFunctions).length; // We'll show NIST-function steps in the header

  // Group controls by NIST function for section progression
  const functionOrder = ['gobernar','identificar','proteger','detectar','responder','recuperar'];
  const controlsByFunction = {};
  functionOrder.forEach(f=>controlsByFunction[f]=[]);
  frameworkData.cisControls.forEach((c,idx)=>{
    if(!controlsByFunction[c.nistFunction]) controlsByFunction[c.nistFunction]=[];
    controlsByFunction[c.nistFunction].push({...c, _index: idx});
  });

  // Create a flat list in the order of functions (to ask sequentially)
  const orderedControls = functionOrder.flatMap(fn => controlsByFunction[fn] || []);

  // Start assessment: show module and display first question
  function startAssessment(){
    // capture pre-assessment metadata
    const emp = parseInt(document.getElementById('inputEmployees').value,10);
    const rev = parseInt(document.getElementById('inputRevenue').value,10);
    const hasWeb = document.getElementById('inputHasWebsite').value;
    const tools = document.getElementById('inputStorageTools').value;
    companyMeta.employees = Number.isFinite(emp) ? emp : null;
    companyMeta.revenue = Number.isFinite(rev) ? rev : null;
    companyMeta.hasWebsite = hasWeb || 'no';
    companyMeta.storageTools = tools || '';
  // optional consultancy email to send results
  const consultEmail = document.getElementById('inputConsultancyEmail') ? document.getElementById('inputConsultancyEmail').value.trim() : '';
  companyMeta.consultancyEmail = consultEmail || '';

    // hide the intro header (keep page clean)
    document.querySelector('header').style.display='none';
    assessmentModule.style.display='block';
    assessmentModule.setAttribute('aria-hidden','false');
    resultsModule.style.display='none';
    currentIndex = 0;
    displayQuestion(currentIndex);
  }

  // Display question at index in orderedControls
  function displayQuestion(idx){
    const total = orderedControls.length;
    const ctrl = orderedControls[idx];
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionIntro = document.getElementById('sectionIntro');
    const questionText = document.getElementById('questionText');

    // Determine current NIST function and update header meta
    const currentFunction = ctrl.nistFunction;
    sectionTitle.textContent = frameworkData.nistFunctions[currentFunction] || currentFunction;
    currentStepEl.textContent = Math.max(1, functionOrder.indexOf(currentFunction)+1);
    // Dynamic intro per function; special note before 'proteger'
    let intro = '';
    switch(currentFunction){
      case 'gobernar': intro = 'Estrategia y gobernanza para tomar decisiones de seguridad acordes al negocio.'; break;
      case 'identificar': intro = 'Comprender sus activos, datos y riesgos para priorizar esfuerzos.'; break;
      case 'proteger': intro = 'Nota: Esta es la sección más extensa, ya que cubre las defensas técnicas fundamentales para proteger sus sistemas y datos. Tómese su tiempo para responder con atención.' + ' ' + 'Medidas para prevenir y reducir riesgos.'; break;
      case 'detectar': intro = 'Capacidades para identificar eventos y anomalías.'; break;
      case 'responder': intro = 'Acciones para contener y mitigar incidentes.'; break;
      case 'recuperar': intro = 'Planes y procesos para restaurar operaciones tras un incidente.'; break;
      default: intro = '';
    }
    sectionIntro.textContent = intro;
    questionText.textContent = `${ctrl.question} \n\n(${ctrl.title})`;

    // Update progress: percent of controls answered
    const answered = results.filter(r=>r!==null).length;
    const pct = Math.round((answered / total) * 100);
    progressFill.style.width = pct + '%';

    // attach listeners to buttons (answers)
    document.querySelectorAll('.answer-btn').forEach(btn=>{
      // prevent binding the back button here
      if(btn.id==='backButton') return;
      btn.onclick = ()=>{
        const answer = btn.dataset.answer;
        // Save the answer in the results using the control's original index
        results[ctrl._index] = answer;
        // Auto-save after each answer
        saveProgress(false);
        // Next: advance currentIndex; if last -> finish
        if(idx+1 < orderedControls.length){
          displayQuestion(idx+1);
        } else {
          calculateAndShowResults();
        }
      };
    });

    // Back button behavior
    const backBtn = document.getElementById('backButton');
    backBtn.onclick = ()=>{
      if(idx>0){
        displayQuestion(idx-1);
      } else {
        // if at very first question, show header again
        assessmentModule.style.display='none';
        document.querySelector('header').style.display='block';
      }
    };

    // Visual feedback: highlight previously selected answer for this control
    document.querySelectorAll('.answer-btn').forEach(b=>b.style.boxShadow='none');
    const prev = results[ctrl._index];
    if(prev){
      const sel = document.querySelector(`.answer-btn[data-answer="${prev}"]`);
      if(sel) sel.style.boxShadow='0 4px 12px rgba(0,0,0,0.08) inset';
    }
  }

  // Calculate and show results
  function calculateAndShowResults(){
    assessmentModule.style.display='none';
    resultsModule.style.display='block';

    // Calculate overall score: count 'yes' / totalControls
    const yesCount = results.reduce((acc,r)=>acc + (r==='yes'?1:0),0);
    const overallPct = Math.round((yesCount / totalControls) * 100);
    overallScoreEl.textContent = overallPct + '%';

    // Scores per function
    functionScoresEl.innerHTML = '';
    functionOrder.forEach(fn=>{
      const controls = frameworkData.cisControls.filter(c=>c.nistFunction===fn);
      const total = controls.length;
      const yes = controls.reduce((acc,c)=>{
        const r = results[cIndex(c.id)];
        return acc + (r==='yes'?1:0);
      },0);
      const pct = total ? Math.round((yes/total)*100) : 0;

      const row = document.createElement('div'); row.className='func-row';
      row.innerHTML = `<div class="func-name">${frameworkData.nistFunctions[fn] || fn}</div><div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div><div style="width:56px;text-align:right;font-weight:700">${pct}%</div>`;
      functionScoresEl.appendChild(row);
    });

    // Populate status table
    statusBody.innerHTML = '';
    frameworkData.cisControls.forEach(c=>{
      const r = results[cIndex(c.id)];
      const implemented = (r==='yes');
      const tr = document.createElement('tr');
      const stateHtml = implemented ? `<span class="status-yes">✔ Implementado</span>` : `<span class="status-no">✖ Pendiente</span>`;
      const actionHtml = implemented ? '' : `<button class="guide-link" data-control-id="${c.id}">Ver Guía</button>`;
      tr.innerHTML = `<td>${frameworkData.nistFunctions[c.nistFunction] || c.nistFunction}</td><td>${c.id}</td><td title="${c.description}">${escapeHtml(c.title)}</td><td>${stateHtml}</td><td>${actionHtml}</td>`;
      statusBody.appendChild(tr);
    });

    // Wire up guide-link buttons
    document.querySelectorAll('.guide-link').forEach(btn=>{
      btn.onclick = ()=>{
        const id = btn.dataset.controlId;
        const target = document.querySelector(`[data-guidance-for='${id}']`);
        if(target){ target.scrollIntoView({behavior:'smooth', block:'center'}); target.style.boxShadow='0 6px 24px rgba(40,80,160,0.08)'; setTimeout(()=>target.style.boxShadow='none',1600); }
      };
    });

    // Generate roadmap
    generateRoadmap();

    // Generate simple conclusions based on company metadata and overall score
    const conclusionsEl = document.getElementById('resultsConclusions');
    conclusionsEl.innerHTML = '';
    const parts = [];
    const emp = companyMeta.employees;
    const rev = companyMeta.revenue;
    const hasWeb = companyMeta.hasWebsite === 'yes';

    if(emp===null || emp===undefined){
      parts.push('No se proporcionó el tamaño de la empresa.');
    } else if(emp<=10){
      parts.push('Su empresa parece pequeña (≤10 empleados). Priorice controles de higiene básica: contraseñas únicas, copias de seguridad, antimalware y MFA en servicios críticos.');
    } else if(emp<=50){
      parts.push('Empresa de tamaño medio (11-50 empleados): además de la higiene básica, dedique esfuerzos a la gobernanza, gestión de accesos y parches automatizados.');
    } else {
      parts.push('Empresa mayor (>50 empleados): además de lo anterior, priorice gestión de registros, segmentación de red y procesos formales de respuesta a incidentes.');
    }

    if(hasWeb){
      parts.push('Detectamos que utiliza sitio web o servicios en la nube. Asegúrese de protegerlos con MFA, backups aislados y revisiones periódicas de vulnerabilidades.');
    }

    if(companyMeta.storageTools){
      parts.push(`Herramientas detectadas para almacenamiento: ${escapeHtml(companyMeta.storageTools)}. Revise configuraciones de permisos y active cifrado/controles de acceso según corresponda.`);
    }

    parts.push(`Su puntuación de madurez es ${overallPct}%. Concéntrese primero en los controles marcados como Pendiente en la tabla y la hoja de ruta.`);

  conclusionsEl.innerHTML = `<div class="card" style="margin-top:12px"><h3>Observaciones y Prioridades</h3><p>${parts.join('</p><p>')}</p><div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"><button id="printBtn" style="background:var(--accent);color:#fff;padding:8px 12px;border-radius:8px;border:none;cursor:pointer">Imprimir / Exportar PDF</button><button id="downloadJsonBtn" style="background:#0b5; color:#fff;padding:8px 12px;border-radius:8px;border:none;cursor:pointer">Descargar resultados (JSON)</button><button id="sendToConsultancyBtn" style="background:#6c757d;color:#fff;padding:8px 12px;border-radius:8px;border:none;cursor:pointer">Enviar a consultoría</button><button id="clearProgressBtn" style="background:#fff;border:1px solid #dfe6ef;padding:8px 12px;border-radius:8px;">Borrar progreso</button></div></div>`;

    document.getElementById('printBtn').onclick = ()=>{
      exportResultsPDF();
    };
    document.getElementById('downloadJsonBtn').onclick = ()=>{
      downloadResultsJSON();
    };
    document.getElementById('sendToConsultancyBtn').onclick = ()=>{
      sendToConsultancy();
    };
    document.getElementById('clearProgressBtn').onclick = ()=>{
      if(confirm('¿Eliminar todo el progreso guardado localmente?')){
        localStorage.removeItem('ciberDiag_v1');
        alert('Progreso borrado.');
      }
    };
  }

  // Send summary to consultancy via mailto: opens user's mail client prefilled
  function sendToConsultancy(){
    // prefer stored consultancy email, else fallback to input field
    const email = companyMeta.consultancyEmail || (document.getElementById('inputConsultancyEmail') ? document.getElementById('inputConsultancyEmail').value.trim() : '');
    if(!email){
      return alert('Por favor ingrese el email de la consultoría en el formulario previo antes de enviar.');
    }

    const yesCount = results.reduce((acc,r)=>acc + (r==='yes'?1:0),0);
    const overallPct = Math.round((yesCount / totalControls) * 100);

    // Build a concise summary and list of pendientes
    let body = `Diagnóstico de Ciberseguridad - Resumen%0A`;
    body += `Empresa - Empleados: ${companyMeta.employees ?? 'N/D'}, Facturación: ${companyMeta.revenue ?? 'N/D'}%0A`;
    body += `Servicios en la nube/sitio: ${companyMeta.hasWebsite}%0A`;
    if(companyMeta.storageTools) body += `Herramientas de almacenamiento: ${companyMeta.storageTools}%0A`;
    body += `%0APuntuación global: ${overallPct}%25%0A`;
    body += `%0AControles pendientes o inciertos:%0A`;

    frameworkData.cisControls.forEach(c=>{
      const r = results[cIndex(c.id)];
      if(r!=='yes'){
        body += `- ${c.id} ${c.title} => Estado: ${r || 'No evaluado'}%0A`;
      }
    });

    body += `%0ANotas:%0AAdjunte el archivo JSON si desea enviarlo (use 'Descargar resultados (JSON)') para análisis más detallado.%0A`;
    body += `%0AEnviado desde herramienta de diagnóstico.`;

    const subject = encodeURIComponent(`Informe: Diagnóstico Ciberseguridad - ${new Date().toLocaleDateString()}`);
    const mailto = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${encodeURIComponent(decodeURIComponent(body))}`;

    // open mail client
    window.location.href = mailto;
  }

  // Utility: find index in frameworkData.cisControls by id
  function cIndex(id){
    return frameworkData.cisControls.findIndex(x=>x.id===id);
  }

  // Create roadmap cards for controls with 'no' or 'unsure'
  function generateRoadmap(){
    guidanceContainer.innerHTML = '';

    // Prepare filters
    roadmapFilters.innerHTML = '';
    ['todos',...Object.keys(frameworkData.nistFunctions)].forEach(key=>{
      const btn = document.createElement('button'); btn.className='filter-btn'; btn.textContent = key==='todos' ? 'Todos' : frameworkData.nistFunctions[key]; btn.dataset.filter = key; roadmapFilters.appendChild(btn);
    });

    // For each control that is pending
    frameworkData.cisControls.forEach(c=>{
      const r = results[cIndex(c.id)];
      if(r!=='yes'){
        const card = document.createElement('article'); card.className='guidance-card'; card.dataset.nist = c.nistFunction; card.dataset.guidanceFor = c.id; card.setAttribute('data-guidance-for', c.id);
        // priority heuristic: for very small companies, mark core hygiene as Alta prioridad
        let priority = 'Media';
        if(companyMeta.employees!==null){
          if(companyMeta.employees<=10 && (c.nistFunction==='proteger' || c.nistFunction==='gobernar' || c.id.startsWith('5.') || c.id.startsWith('11.'))) priority = 'Alta';
          else if(companyMeta.employees>50) priority = 'Alta';
        }
        const prBadge = `<div style="float:right;font-weight:700;color:#fff;padding:4px 8px;border-radius:6px;background:${priority==='Alta'? 'var(--danger)':'var(--warning)'}">Prioridad: ${priority}</div>`;
        const why = (c.guidance && c.guidance.why) ? c.guidance.why : 'Esta medida reduce riesgos relevantes para su negocio.';
        const steps = (c.guidance && c.guidance.steps && c.guidance.steps.length) ? c.guidance.steps : ['1) Revisar el control relacionado y planificar una mejora simple.','2) Implementar la acción más baja en costo/impacto primero.','3) Revisar resultado y documentar.'];
        card.innerHTML = `${prBadge}<h3>${escapeHtml(c.id)} — ${escapeHtml(c.title)}</h3><h4>¿Por qué es importante para su negocio?</h4><p>${escapeHtml(why)}</p><h4>Primeros Pasos Prácticos y de Bajo Costo</h4>`;
        const ol = document.createElement('ol'); steps.forEach(s=>{ const li = document.createElement('li'); li.textContent = s; ol.appendChild(li); });
        card.appendChild(ol);

        // Add template download buttons for some controls (map heuristically)
        if(c.id.startsWith('5.')){
          const dl = createDownloadButton('template-pass','Politica_Contraseñas.txt'); card.appendChild(dl);
        } else if(c.id.startsWith('11.')){
          const dl = createDownloadButton('template-backup','Politica_Backup.txt'); card.appendChild(dl);
        } else if(c.id.startsWith('14.')){
          const dl = createDownloadButton('template-pua','Politica_Uso_Aceptable.txt'); card.appendChild(dl);
        }

        guidanceContainer.appendChild(card);
      }
    });

    // Filter buttons behavior
    roadmapFilters.querySelectorAll('.filter-btn').forEach(btn=>{
      btn.onclick = ()=>{
        const f = btn.dataset.filter;
        document.querySelectorAll('.guidance-card').forEach(card=>{
          card.style.display = (f==='todos' || card.dataset.nist===f) ? '' : 'none';
        });
      };
    });
  }

  // Create a download button element bound to a template id
  function createDownloadButton(templateId, filename){
    const btn = document.createElement('button');
    btn.className = 'download-template'; btn.textContent = 'Descargar Plantilla de Política (.txt)';
    btn.style.marginTop='8px'; btn.dataset.templateId = templateId;
    btn.onclick = async ()=>{
      const tid = btn.dataset.templateId; const tpl = document.getElementById(tid);
      if(!tpl) return alert('Plantilla no encontrada');
      const txt = tpl.innerText.trim();
      const blob = new Blob([txt], {type:'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename || 'plantilla.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    };
    return btn;
  }

  // Helper to escape HTML injection in titles/descriptions
  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; }); }

  // Compute a simple priority for a control based on company size and function/ID heuristics
  function computePriorityForControl(c){
    let priority = 'Media';
    try{
      const emp = companyMeta.employees;
      if(emp!==null && emp!==undefined){
        if(emp<=10 && (c.nistFunction==='proteger' || c.nistFunction==='gobernar' || String(c.id).startsWith('5.') || String(c.id).startsWith('11.'))) priority = 'Alta';
        else if(emp>50) priority = 'Alta';
        else priority = 'Media';
      } else {
        // no meta: assume Media
        priority = 'Media';
      }
    }catch(e){ priority = 'Media'; }
    return priority;
  }

  // Show/Hide loading overlay inside modal
  function showLoading(on){ if(!importLoading) return; importLoading.style.display = on ? 'flex' : 'none'; }

  // Render paged/filtered changes into the list
  function renderChanges(){
    if(!importChangesList) return;
    const fnFilter = importFilterFunction ? importFilterFunction.value : 'all';
    const prFilter = importFilterPriority ? importFilterPriority.value : 'all';
    const onlyDiffs = importOnlyDiffs ? importOnlyDiffs.checked : false;

    const normalItems = changesData.filter(x=>!x._meta);
    let filtered = normalItems.filter(it=>{
      if(onlyDiffs && it.cur === it.inc) return false;
      if(fnFilter && fnFilter!=='all' && (it.nist || 'unknown') !== fnFilter) return false;
      if(prFilter && prFilter!=='all' && it.priority !== prFilter) return false;
      return true;
    });

    const total = filtered.length;
    const pageSize = changesPageSize || 10;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if(changesPage > totalPages) changesPage = totalPages;
    if(changesPage < 1) changesPage = 1;

    // slice for page
    const start = (changesPage-1)*pageSize; const end = start + pageSize;
    const pageItems = filtered.slice(start, end);

    // clear and append
    importChangesList.innerHTML = '';
    pageItems.forEach(it=>{
      const div = document.createElement('div'); div.className='import-change-item';
      const prColor = it.priority==='Alta' ? 'var(--danger)' : (it.priority==='Media' ? 'var(--warning)' : 'var(--success)');
      div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><span class="ctrl-id">${escapeHtml(it.ctrl.id)}</span> <span class="ctrl-title">${escapeHtml(it.ctrl.title)}</span></div><div style="font-weight:700;color:${prColor};padding:4px 8px;border-radius:6px">${it.priority}</div></div><div class="from-to">Actual: <strong>${it.cur===null?'No evaluado':it.cur}</strong> → Nuevo: <strong>${it.inc===null?'No evaluado':it.inc}</strong></div>`;
      importChangesList.appendChild(div);
    });

    // append meta notes at the end (if any) regardless of filters
    changesData.filter(x=>x._meta).forEach(m=>{
      const div = document.createElement('div'); div.className='import-change-item'; div.innerHTML = `<div>${escapeHtml(m.note)}</div>`; importChangesList.appendChild(div);
    });

    // update pager UI
    if(importPageIndicator) importPageIndicator.textContent = `${changesPage} / ${totalPages}`;
    if(importPagePrev) importPagePrev.disabled = changesPage<=1;
    if(importPageNext) importPageNext.disabled = changesPage>=totalPages;
  }

  // Bind start button
  if(startButton) startButton.addEventListener('click', startAssessment);

  // Accessibility: allow keyboard responses (Y/N/U)
  document.addEventListener('keydown', (e)=>{
    if(assessmentModule.style.display!=='block') return;
    if(e.key.toLowerCase()==='y') document.querySelector('.answer-btn[data-answer="yes"]').click();
    if(e.key.toLowerCase()==='n') document.querySelector('.answer-btn[data-answer="no"]').click();
    if(e.key.toLowerCase()==='u') document.querySelector('.answer-btn[data-answer="unsure"]').click();
  });

  // Bind save/load top buttons
  if(saveProgressTop) saveProgressTop.addEventListener('click', ()=>saveProgress(true));
  if(loadProgressTop) loadProgressTop.addEventListener('click', loadProgress);
  // Import progress from JSON file (for resuming on another device)
  const importProgressBtn = document.getElementById('importProgressBtn');
  const importProgressFile = document.getElementById('importProgressFile');
  if(importProgressBtn && importProgressFile){
    importProgressBtn.addEventListener('click', ()=> importProgressFile.click());
    // New flow: parse and show confirmation modal before applying
    importProgressFile.addEventListener('change', (ev)=>{
      const f = ev.target.files && ev.target.files[0];
      if(!f) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        let payload;
        try{
          payload = JSON.parse(reader.result);
        }catch(err){
          console.error(err);
          alert('No se pudo leer el archivo: JSON inválido.');
          importProgressFile.value = '';
          return;
        }

        // Basic structure validation
        if(!payload || typeof payload !== 'object' || !Array.isArray(payload.results) || !payload.meta){
          alert('Formato inválido: se requiere un objeto con al menos { meta, results }. Asegúrese de usar un archivo exportado por esta herramienta.');
          importProgressFile.value = '';
          return;
        }

        // Allow migrations and compatibility handling
        function migratePayload(p){
          // Simple, extensible migration hook.
          if(!p || typeof p !== 'object') return p;
          const from = p.schemaVersion || 'unknown';
          if(from === '1.0') return p; // already current
          const migrated = JSON.parse(JSON.stringify(p));
          // Example migration strategy: if older schema had fewer fields, keep results as-is and pad later.
          // Specific migrations can be added here keyed by from-version.
          // Mark that a migration was applied so UI can inform the user.
          migrated._migratedFrom = from;
          migrated.schemaVersion = '1.0';
          return migrated;
        }

        const migratedPayload = migratePayload(payload);

  // Prepare compatibility checks
        const supportedSchema = '1.0';
        const incomingSchema = migratedPayload.schemaVersion || 'unknown';
        const incomingResultsCount = Array.isArray(migratedPayload.results) ? migratedPayload.results.length : 0;
        const expectedCount = results.length;

        // Fill modal with summary
        importSummarySchema.textContent = incomingSchema;
        importSummaryResultsCount.textContent = incomingResultsCount;
        importSummaryExpected.textContent = expectedCount;
        importSummaryMeta.innerHTML = '';
        const meta = payload.meta || {};
        const li = (k,v)=>{ const el = document.createElement('li'); el.textContent = `${k}: ${v===null||v===undefined? 'N/D' : v}`; importSummaryMeta.appendChild(el); };
        li('Empleados', meta.employees ?? 'N/D'); li('Facturación (CLP)', meta.revenue ?? 'N/D'); li('Sitio web', meta.hasWebsite || 'N/D'); li('Herramientas almacenamiento', meta.storageTools || 'N/D'); li('Email consultoría', meta.consultancyEmail || 'N/D');

        // Compatibility message
        if(incomingSchema !== supportedSchema){
          importSummaryCompat.style.color = 'var(--danger)';
          importSummaryCompat.textContent = `Aviso: la versión del esquema del archivo (${incomingSchema}) no coincide con la versión admitida por esta herramienta (${supportedSchema}). Proceda con precaución.`;
        } else if(incomingResultsCount !== expectedCount){
          importSummaryCompat.style.color = 'var(--warning)';
          importSummaryCompat.textContent = `Advertencia: el archivo contiene ${incomingResultsCount} respuestas pero esta herramienta espera ${expectedCount}. Se importarán las respuestas que coincidan con los índices y el resto quedará sin evaluar.`;
        } else {
          importSummaryCompat.style.color = 'var(--muted)';
          importSummaryCompat.textContent = 'El archivo parece compatible. Revise la información y confirme para importar.';
        }

        // Build changes preview: create data array for filtering/pagination
        const incomingRaw = migratedPayload.results;
        // normalize incoming into array of length expectedCount
        const normalizeIncoming = (r)=>{
          if(Array.isArray(r)) return r;
          if(r && typeof r === 'object'){
            // object mapping id->answer
            const arr = new Array(expectedCount).fill(null);
            frameworkData.cisControls.forEach((c, idx)=>{
              if(Object.prototype.hasOwnProperty.call(r, c.id)) arr[idx] = r[c.id];
            });
            return arr;
          }
          return new Array(expectedCount).fill(null);
        };

        showLoading(true);
        changesData = [];
        setTimeout(()=>{ // allow UI to show spinner for large files
          const incoming = normalizeIncoming(incomingRaw);
          for(let i=0;i<Math.min(incoming.length, expectedCount); i++){
            const inc = incoming[i];
            const cur = results[i];
            const ctrl = frameworkData.cisControls[i] || { id: `#${i}`, title: 'Control desconocido', nistFunction: null };
            const pr = computePriorityForControl(ctrl);
            changesData.push({ index:i, ctrl, cur, inc, priority: pr, nist: ctrl.nistFunction || 'unknown' });
          }
          // add metadata notes as pseudo-items if needed
          if(incoming.length > expectedCount) changesData.push({ note: `El archivo contiene ${incoming.length - expectedCount} respuestas adicionales que serán ignoradas.`, _meta:true });
          if(incoming.length < expectedCount) changesData.push({ note: `El archivo contiene ${incoming.length} respuestas. Se importarán y el resto quedará sin evaluar.`, _meta:true });
          if(migratedPayload._migratedFrom) changesData.push({ note: `Se aplicó una migración desde la versión ${migratedPayload._migratedFrom} a la versión 1.0.`, _meta:true });

          // initialize filters UI (functions list)
          if(importFilterFunction && importFilterFunction.options.length<=1){
            Object.keys(frameworkData.nistFunctions).forEach(key=>{
              const opt = document.createElement('option'); opt.value = key; opt.textContent = frameworkData.nistFunctions[key]; importFilterFunction.appendChild(opt);
            });
          }
          // set page size default
          if(importPageSize) changesPageSize = parseInt(importPageSize.value,10) || 10;
          changesPage = 1;
          renderChanges();
          showLoading(false);
        }, 80);

        // show modal: trap focus and set handlers
        lastFocusedElement = document.activeElement;
        importConfirmModal.style.display = 'flex';
        importConfirmModal.setAttribute('aria-hidden','false');
        // focus first actionable element
        setTimeout(()=>{ importConfirmBtn.focus(); }, 60);

        // simple focus trap: keep focus inside modal
        function keepFocus(e){
          if(importConfirmModal.getAttribute('aria-hidden')==='true') return;
          if(!importConfirmModal.contains(document.activeElement)){
            importConfirmBtn.focus();
          }
        }
        document.addEventListener('focus', keepFocus, true);

        // ESC to close modal
        function escHandler(ev){ if(ev.key==='Escape'){ onCancel(); } }
        document.addEventListener('keydown', escHandler);

        // filter toggle
        if(importOnlyDiffs){
          importOnlyDiffs.checked = true; // default to show only diffs
          const applyFilter = ()=>{
            const showOnly = importOnlyDiffs.checked;
            // re-render using current filters
            renderChanges();
          };
          importOnlyDiffs.addEventListener('change', applyFilter);
          applyFilter();
        }

        // wire up filter/pager controls (one-time handlers)
        if(importFilterFunction){ importFilterFunction.onchange = ()=>{ changesPage=1; renderChanges(); }; }
        if(importFilterPriority){ importFilterPriority.onchange = ()=>{ changesPage=1; renderChanges(); }; }
        if(importPageSize){ importPageSize.onchange = ()=>{ changesPageSize = parseInt(importPageSize.value,10)||10; changesPage=1; renderChanges(); }; }
        if(importPagePrev){ importPagePrev.onclick = ()=>{ if(changesPage>1){ changesPage--; renderChanges(); } }; }
        if(importPageNext){ importPageNext.onclick = ()=>{ changesPage++; renderChanges(); }; }

        // confirm handler: apply payload
        const onConfirm = ()=>{
          try{
            // Map meta safely from migrated payload
            const meta = migratedPayload.meta || {};
            companyMeta.employees = meta.employees ?? null;
            companyMeta.revenue = meta.revenue ?? null;
            companyMeta.hasWebsite = meta.hasWebsite || 'no';
            companyMeta.storageTools = meta.storageTools || '';
            companyMeta.consultancyEmail = meta.consultancyEmail || '';

            // copy results array up to expected length (from migrated payload)
            const incoming = Array.isArray(migratedPayload.results) ? migratedPayload.results : [];
            for(let i=0;i<Math.min(incoming.length, results.length); i++) results[i]=incoming[i];

            // persist and resume
            saveProgress(false);
            alert('Progreso importado correctamente. Se reanudará donde quedó.');

            const firstUnanswered = results.findIndex(r=>r===null);
            if(firstUnanswered===-1){
              calculateAndShowResults();
            } else {
              document.querySelector('header').style.display='none';
              assessmentModule.style.display='block';
              displayQuestion( orderedControls.findIndex(c=>c._index===firstUnanswered) );
            }
          }catch(err){ console.error(err); alert('Error al aplicar la importación.'); }
          finally{
            // cleanup modal and handlers
            importConfirmModal.style.display = 'none';
            importConfirmModal.setAttribute('aria-hidden','true');
            importConfirmBtn.removeEventListener('click', onConfirm);
            importCancelBtn.removeEventListener('click', onCancel);
            importProgressFile.value = '';
            // remove global listeners
            document.removeEventListener('focus', keepFocus, true);
            document.removeEventListener('keydown', escHandler);
            // restore focus
            try{ if(lastFocusedElement) lastFocusedElement.focus(); }catch(e){}
          }
        };

        const onCancel = ()=>{
          importConfirmModal.style.display = 'none';
          importConfirmModal.setAttribute('aria-hidden','true');
          importConfirmBtn.removeEventListener('click', onConfirm);
          importCancelBtn.removeEventListener('click', onCancel);
          importProgressFile.value = '';
          document.removeEventListener('focus', keepFocus, true);
          document.removeEventListener('keydown', escHandler);
          try{ if(lastFocusedElement) lastFocusedElement.focus(); }catch(e){}
        };

        importConfirmBtn.addEventListener('click', onConfirm);
        importCancelBtn.addEventListener('click', onCancel);

      };
      reader.readAsText(f);
    });
  }

  // Save progress to localStorage. If showAlert true, show confirmation alert.
  function saveProgress(showAlert=true){
    try{
    const payload = { schemaVersion: '1.0', meta: companyMeta, results, timestamp: new Date().toISOString() };
      localStorage.setItem('ciberDiag_v1', JSON.stringify(payload));
      if(showAlert) alert('Progreso guardado localmente.');
    }catch(e){ console.error(e); alert('No se pudo guardar el progreso en este navegador.'); }
  }

  // Load progress from localStorage (if exists)
  function loadProgress(){
    try{
      const raw = localStorage.getItem('ciberDiag_v1');
      if(!raw){ alert('No hay progreso guardado localmente.'); return; }
      const payload = JSON.parse(raw);
      // Optional schema validation
      if(payload.schemaVersion && payload.schemaVersion!=='1.0'){
        if(!confirm(`El progreso guardado fue exportado con la versión de esquema ${payload.schemaVersion} — diferente de la versión actual 1.0. Desea intentar cargarlo de todos modos?`)){
          return;
        }
      }
      // populate companyMeta and inputs
      if(payload.meta){
        companyMeta.employees = payload.meta.employees ?? null;
        companyMeta.revenue = payload.meta.revenue ?? null;
        companyMeta.hasWebsite = payload.meta.hasWebsite || 'no';
        companyMeta.storageTools = payload.meta.storageTools || '';
        companyMeta.consultancyEmail = payload.meta.consultancyEmail || '';
        document.getElementById('inputEmployees').value = companyMeta.employees ?? '';
        document.getElementById('inputRevenue').value = companyMeta.revenue ?? '';
        document.getElementById('inputHasWebsite').value = companyMeta.hasWebsite || 'no';
        document.getElementById('inputStorageTools').value = companyMeta.storageTools || '';
        if(document.getElementById('inputConsultancyEmail')) document.getElementById('inputConsultancyEmail').value = companyMeta.consultancyEmail || '';
      }
      // load results (ensure correct length)
      if(Array.isArray(payload.results)){
        for(let i=0;i<Math.min(payload.results.length, results.length); i++) results[i]=payload.results[i];
      }
      alert('Progreso cargado. Se abrirá el diagnóstico en la última posición no completada.');
      // decide whether to show results or resume
      const firstUnanswered = results.findIndex(r=>r===null);
      if(firstUnanswered===-1){
        calculateAndShowResults();
      } else {
        // prepare to resume
        document.querySelector('header').style.display='none';
        assessmentModule.style.display='block';
        displayQuestion( orderedControls.findIndex(c=>c._index===firstUnanswered) );
      }
    }catch(e){ console.error(e); alert('Error al leer progreso guardado.'); }
  }

  // Download results and metadata as JSON file
  function downloadResultsJSON(){
    const yesCount = results.reduce((acc,r)=>acc + (r==='yes'?1:0),0);
    const overallPct = Math.round((yesCount / totalControls) * 100);
    const payload = { schemaVersion: '1.0', meta: companyMeta, results, overallPct, framework: { totalControls }, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `diagnostico_ciber_${(new Date()).toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  // Export results to PDF by opening a formatted window and printing
  function exportResultsPDF(){
    const yesCount = results.reduce((acc,r)=>acc + (r==='yes'?1:0),0);
    const overallPct = Math.round((yesCount / totalControls) * 100);
    let html = `<!doctype html><html><head><meta charset="utf-8"><title>Informe de Diagnóstico</title><style>body{font-family:Arial,Helvetica,sans-serif;margin:20px;color:#111}h1{color:#2b6cb0}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #ddd;padding:8px;text-align:left} .card{border:1px solid #eee;padding:10px;margin-top:10px;border-radius:6px}</style></head><body>`;
    html += `<h1>Diagnóstico y Hoja de Ruta - Resumen</h1>`;
    html += `<p><strong>Empresa:</strong> Empleados: ${companyMeta.employees ?? 'N/D'} — Facturación: ${companyMeta.revenue ?? 'N/D'} — Sitio web: ${companyMeta.hasWebsite}</p>`;
    html += `<div class="card"><h2>Resultado global: ${overallPct}%</h2><p>Fecha: ${(new Date()).toLocaleString()}</p></div>`;
    html += `<h2>Estado de controles</h2><table><thead><tr><th>Función</th><th>ID</th><th>Control</th><th>Estado</th></tr></thead><tbody>`;
    frameworkData.cisControls.forEach(c=>{
      const r = results[cIndex(c.id)];
      const state = r==='yes' ? 'Implementado' : (r==='unsure' ? 'Incierto' : 'Pendiente');
      html += `<tr><td>${frameworkData.nistFunctions[c.nistFunction] || c.nistFunction}</td><td>${c.id}</td><td>${escapeHtml(c.title)}</td><td>${state}</td></tr>`;
    });
    html += `</tbody></table>`;

    // Roadmap: include pending controls with steps
    html += `<h2>Hoja de Ruta (controles pendientes)</h2>`;
    frameworkData.cisControls.forEach(c=>{
      const r = results[cIndex(c.id)];
      if(r!=='yes'){
        const why = (c.guidance && c.guidance.why) ? c.guidance.why : '';
        const steps = (c.guidance && c.guidance.steps) ? c.guidance.steps : [];
        html += `<div class="card"><h3>${c.id} — ${escapeHtml(c.title)}</h3><p><strong>Por qué:</strong> ${escapeHtml(why)}</p>`;
        if(steps.length){ html += `<ol>`; steps.forEach(s=> html += `<li>${escapeHtml(s)}</li>`); html += `</ol>`; }
        html += `</div>`;
      }
    });

    html += `</body></html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    if(!w){ alert('No se pudo abrir ventana para imprimir. Revise bloqueadores de ventanas emergentes.'); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    // wait for content to render then print
    w.onload = ()=>{ w.focus(); w.print(); setTimeout(()=>w.close(), 800); };
  }

  // Quick note for users: if dataset is large, progress is measured por preguntas respondidas
  // End IIFE
})();
