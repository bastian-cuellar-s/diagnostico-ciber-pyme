// app.js - lógica de la UI, almacenamiento local y reportes
document.addEventListener('DOMContentLoaded', function(){
  const STORAGE_KEY = 'ciberDiagMVP';
  const THEME_KEY = 'ciberDiagTheme';
  
  // Verificar que las preguntas estén cargadas
  if(typeof questions === 'undefined' || !Array.isArray(questions)){
    console.error('Error: Las preguntas no están cargadas correctamente.');
    return;
  }

  // Fuente activa (completo o demo)
  let activeQuestions = questions;
  const demoSet = (typeof demoQuestions !== 'undefined' && Array.isArray(demoQuestions)) ? demoQuestions : questions.slice(0, 5);
  let demoMode = false;

  const state = {
    currentIndex: 0,
    answers: Array.from({ length: activeQuestions.length }, () => null),
    chart: null
  };

  // Referencias de UI
  const themeToggle = document.getElementById('themeToggle');
  const wizardCard = document.getElementById('wizardCard');
  const resultsCard = document.getElementById('resultsCard');
  const startBtn = document.getElementById('startBtn');
  const demoBtn = document.getElementById('demoBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const clearBtn = document.getElementById('clearBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const saveBtn = document.getElementById('saveBtn');
  const restartBtn = document.getElementById('restartBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const questionText = document.getElementById('questionText');
  const categoryTitle = document.getElementById('categoryTitle');
  const questionId = document.getElementById('questionId');
  const stepLabel = document.getElementById('stepLabel');
  const progressBar = document.getElementById('progressBar');
  const pillScore = document.getElementById('pillScore');
  const overallScore = document.getElementById('overallScore');
  const answeredCount = document.getElementById('answeredCount');
  const resultsTableBody = document.querySelector('#resultsTable tbody');
  const radarCanvas = document.getElementById('radarChart');

  const answerButtons = Array.from(document.querySelectorAll('[data-answer]'));

  const getQ = () => activeQuestions;

  // ========== TEMA OSCURO ==========
  function initTheme(){
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme);
  }

  function applyTheme(theme){
    if(theme === 'dark'){
      document.body.classList.add('dark-mode');
      if(themeToggle) themeToggle.textContent = '☀️';
    } else {
      document.body.classList.remove('dark-mode');
      if(themeToggle) themeToggle.textContent = '🌙';
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const isDark = document.body.classList.contains('dark-mode');
      applyTheme(isDark ? 'light' : 'dark');
      if(wizardCard.classList.contains('d-none') && state.chart){
        renderResults();
      }
    });
  }

  // ========== PERSISTENCIA ==========
  function persist(showMessage){
    if(demoMode) return; // no se persiste el modo demo
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: state.answers, currentIndex: state.currentIndex }));
      if(showMessage) toast('Progreso guardado en este navegador.');
    }catch(e){
      console.error(e);
      if(showMessage) alert('No se pudo guardar el progreso. Verifique permisos de almacenamiento.');
    }
  }

  function loadSaved(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      if(!parsed.answers || !Array.isArray(parsed.answers)) return null;
      const answers = Array.from({ length: questions.length }, (_, i) => parsed.answers[i] ?? null);
      const currentIndex = Math.min(parsed.currentIndex ?? 0, questions.length - 1);
      return { answers, currentIndex };
    }catch(e){
      console.error(e);
      return null;
    }
  }

  function clearStorage(){
    localStorage.removeItem(STORAGE_KEY);
    toast('Datos borrados.');
  }

  function toast(msg){
    const el = document.createElement('div');
    el.className = 'shadow-sm bg-dark text-white small px-3 py-2 rounded position-fixed';
    el.style.top = '16px';
    el.style.right = '16px';
    el.style.zIndex = '2000';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(()=>{ el.remove(); }, 2000);
  }

  // ========== NAVEGACIÓN ==========
  function goTo(index){
    state.currentIndex = Math.max(0, Math.min(index, getQ().length));
    if(state.currentIndex >= getQ().length){
      renderResults();
      return;
    }
    wizardCard.classList.remove('d-none');
    resultsCard.classList.add('d-none');
    renderQuestion();
  }

  function renderQuestion(){
    const q = getQ()[state.currentIndex];
    if(!q) return;
    questionText.textContent = q.text;
    categoryTitle.textContent = q.category;
    questionId.textContent = q.id;
    stepLabel.textContent = `Paso ${state.currentIndex + 1} de ${getQ().length}`;
    const progressPct = Math.round(((state.currentIndex) / getQ().length) * 100);
    progressBar.style.width = `${progressPct}%`;

    answerButtons.forEach(btn=>{
      const selected = state.answers[state.currentIndex] === btn.dataset.answer;
      btn.classList.toggle('active', selected);
    });

    if(prevBtn) prevBtn.disabled = state.currentIndex === 0;
  }

  function recordAnswer(value){
    state.answers[state.currentIndex] = value;
    persist(false);
    updatePillScore();
  }

  function updatePillScore(){
    const answered = state.answers.filter(Boolean).length;
    const yes = state.answers.filter(v=>v==='yes').length;
    const score = Math.round((yes / (getQ().length || 1)) * 100);
    pillScore.textContent = isFinite(score) ? `${score}%` : '--%';
    answeredCount.textContent = `${answered} de ${getQ().length} respondidas`;
  }

  // ========== RESULTADOS ==========
  function calculateScores(){
    const buckets = {};
    getQ().forEach(q=>{ 
      buckets[q.category] = buckets[q.category] || { total:0, yes:0, unsure:0 }; 
      buckets[q.category].total += 1; 
    });
    state.answers.forEach((ans, idx)=>{
      const cat = getQ()[idx].category;
      if(ans === 'yes') buckets[cat].yes += 1;
      if(ans === 'unsure') buckets[cat].unsure += 1;
    });

    const labels = Object.keys(buckets);
    const values = labels.map(cat=>{
      const b = buckets[cat];
      const pct = b.total ? Math.round(((b.yes + 0.5 * b.unsure) / b.total) * 100) : 0;
      return pct;
    });
    const overallYes = state.answers.filter(a=>a==='yes').length;
    const overall = Math.round((overallYes / (getQ().length || 1)) * 100);
    return { labels, values, overall };
  }

  function renderResults(){
    wizardCard.classList.add('d-none');
    resultsCard.classList.remove('d-none');
    const { labels, values, overall } = calculateScores();
    overallScore.textContent = `${overall}%`;
    updatePillScore();

    // Detectar modo oscuro para ajustar colores del gráfico
    const isDarkMode = document.body.classList.contains('dark-mode');
    const gridColor = isDarkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(107, 114, 128, 0.3)';
    const tickColor = isDarkMode ? '#9ca3af' : '#6b7280';
    const labelColor = isDarkMode ? '#e5e7eb' : '#374151';

    // Render radar
    if(state.chart){ state.chart.destroy(); }
    state.chart = new Chart(radarCanvas, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Nivel por función',
          data: values,
          backgroundColor: 'rgba(99, 102, 241, 0.25)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 3,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: 'rgb(79, 70, 229)',
          pointHoverBorderColor: '#fff'
        }]
      },
      options: {
        scales: { 
          r: { 
            suggestedMin: 0, 
            suggestedMax: 100, 
            ticks: { 
              stepSize: 20,
              backdropColor: 'transparent',
              color: tickColor,
              font: { size: 12, weight: '600' }
            },
            grid: {
              color: gridColor,
              lineWidth: 2
            },
            angleLines: {
              color: gridColor,
              lineWidth: 2
            },
            pointLabels: {
              color: labelColor,
              font: { size: 13, weight: '700' }
            }
          } 
        },
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed.r + '%';
              }
            }
          }
        }
      }
    });

    // Recommendations table
    resultsTableBody.innerHTML = '';
    getQ().forEach((q, idx)=>{
      const ans = state.answers[idx];
      if(ans === 'yes') return;
      const tr = document.createElement('tr');
      const label = ans === 'no' ? 'No' : (ans === 'unsure' ? 'No seguro' : 'Sin respuesta');
      tr.innerHTML = `
        <td>${q.category}</td>
        <td><span class="badge text-bg-light">${q.id}</span></td>
        <td>${q.text}</td>
        <td>${label}</td>
        <td>${q.recommendation}</td>`;
      resultsTableBody.appendChild(tr);
    });
  }

  function generatePdf(){
    const element = document.getElementById('report');
    const opt = {
      margin: 10,
      filename: 'diagnostico-ciberseguridad.pdf',
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  }

  // ========== EVENT LISTENERS ==========
  if(startBtn){
    startBtn.addEventListener('click', ()=>{
      activeQuestions = questions;
      demoMode = false;
      state.answers = Array.from({ length: getQ().length }, () => null);
      state.currentIndex = 0;
      updatePillScore();
      persist(false);
      goTo(0);
      if(resumeBtn) resumeBtn.classList.remove('disabled');
    });
  }

  if(demoBtn){
    demoBtn.addEventListener('click', ()=>{
      activeQuestions = demoSet;
      demoMode = true;
      state.answers = Array.from({ length: getQ().length }, () => null);
      state.currentIndex = 0;
      updatePillScore();
      goTo(0);
      if(resumeBtn) resumeBtn.classList.add('disabled');
    });
  }

  if(resumeBtn){
    resumeBtn.addEventListener('click', ()=>{
      const saved = loadSaved();
      if(!saved){
        alert('No hay progreso guardado.');
        return;
      }
      activeQuestions = questions;
      demoMode = false;
      state.answers = saved.answers;
      state.currentIndex = saved.currentIndex;
      updatePillScore();
      goTo(state.currentIndex);
    });
  }

  if(clearBtn){
    clearBtn.addEventListener('click', ()=>{
      if(confirm('Esto borrará todas las respuestas guardadas en este navegador.')){
        clearStorage();
        activeQuestions = questions;
        demoMode = false;
        state.answers = Array.from({ length: getQ().length }, () => null);
        state.currentIndex = 0;
        updatePillScore();
        if(resumeBtn) resumeBtn.classList.add('disabled');
        wizardCard.classList.add('d-none');
        resultsCard.classList.add('d-none');
      }
    });
  }

  if(restartBtn){
    restartBtn.addEventListener('click', ()=>{
      activeQuestions = demoMode ? demoSet : questions;
      state.answers = Array.from({ length: getQ().length }, () => null);
      state.currentIndex = 0;
      updatePillScore();
      persist(false);
      goTo(0);
    });
  }

  if(downloadPdfBtn){
    downloadPdfBtn.addEventListener('click', generatePdf);
  }

  if(saveBtn){
    saveBtn.addEventListener('click', ()=>persist(true));
  }

  if(nextBtn){
    nextBtn.addEventListener('click', ()=>{
      if(state.currentIndex < getQ().length - 1){
        goTo(state.currentIndex + 1);
      } else {
        goTo(getQ().length);
      }
    });
  }

  if(prevBtn){
    prevBtn.addEventListener('click', ()=>{
      goTo(state.currentIndex - 1);
    });
  }

  answerButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      recordAnswer(btn.dataset.answer);
      if(state.currentIndex < getQ().length - 1){
        goTo(state.currentIndex + 1);
      } else {
        goTo(getQ().length);
      }
    });
  });

  // ========== INICIALIZACIÓN ==========
  initTheme();
  activeQuestions = questions;
  demoMode = false;
  const saved = loadSaved();
  if(saved){
    if(resumeBtn) resumeBtn.classList.remove('disabled');
    state.answers = saved.answers;
    state.currentIndex = saved.currentIndex;
    updatePillScore();
  } else {
    if(resumeBtn) resumeBtn.classList.add('disabled');
  }
});
