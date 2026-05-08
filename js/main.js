// ============================================
// Eukaryotic Transcription Initiation Model
// Interactive visualization + drag & drop
// ============================================

/*
  Este archivo fue reescrito completo para corregir el estado corrupto anterior.
  Objetivos:
  - Drag & drop funcional (HTML5 DnD)
  - Mostrar el ADN y animación por pasos
  - Publicar estado para lab-assistant.js:
      window.__LAB_STATE__
      window.transcriptionState
      window.getHelixPoint
  - Mantener compatibilidad con UI existente (buttons/stepper/sidebar).
*/

// ============ Quiz Data ============

const QUIZ_DATA = [
  {q:"¿Cuál factor se une primero a la Caja TATA?",o:["TFIIB","TFIID","TFIIF","TFIIH"],c:1,e:"TFIID (con TBP) se une primero marcando el inicio del ensamblaje."},
  {q:"¿Qué función tiene la subunidad sigma de Pol II?",o:["Sintetizar ARN","Unirse al ADN","Ayudar a encontrar el sitio de inicio","Abrir la doble hélice"],c:2,e:"Sigma ayuda a localizar el promotor y sitio de inicio correcto."},
  {q:"¿Qué indica Py2CAPy4?",o:["Inicio de traducción","Sitio de unión de ribosomas","Secuencia del iniciador (INR)","Señal de poliadenilación"],c:2,e:"Py2CAPy4 es la secuencia del Iniciador (INR). Py=pirimidina, Cap=nucleótido +1."},
  {q:"¿Qué hace TFIIH?",o:["Solo estabiliza Pol II","Actúa como puente","Abre el ADN y activa Pol II","Une ribonucleótidos"],c:2,e:"Sus helicasas abren el ADN (burbuja) y su quinasa fosforila Pol II activándola."},
  {q:"¿Cuál es la secuencia de la Caja TATA?",o:["TATAAT","ATGCAT","GGGCCC","TATATA"],c:0,e:"TATAAA, ubicada 25-35 pb antes del inicio."},
  {q:"¿Qué pasaría si TFIIB se coloca antes que TFIID?",o:["Ensamblaje normal","Más eficiente","No puede ocurrir","Se activa transcripción"],c:2,e:"TFIID debe unirse primero para reclutar a TFIIB. El orden es secuencial y crucial."},
  {q:"¿Qué es esencial para todos los genes pol II?",o:["Caja TATA","INR","ARN Polimerasa II","TFIIH"],c:2,e:"Pol II es absolutamente esencial para sintetizar ARNm."},
  {q:"¿Cuántos pb se separan en la burbuja?",o:["10-14 pb","25-35 pb","50-60 pb","100+ pb"],c:0,e:"Generalmente 10-14 pb, suficientes para que Pol II lea la plantilla."}
];

// ============ Data ============

const DATA = {
  elements: {
    tata: {
      name: "Caja TATA",
      sequence: "TATAAA",
      position: "25-35 pb antes del inicio",
      color: "#ef4444",
      short: "Secuencia TATAAA reconocida por TFIID/TBP",
      description:
        "Secuencia consenso situada 25-35 pares de bases antes del inicio. La subunidad TBP (TATA-binding protein) de TFIID se une aquí, curvando el ADN para facilitar el ensamblaje.",
      function: "Anclaje inicial que define la precisión del promotor"
    },
    inr: {
      name: "Iniciador (INR)",
      sequence: "Py2CAPy4",
      position: "Punto de inicio +1",
      color: "#3b82f6",
      short: "Py=pirimidina, Cap=nucleótido +1",
      description:
        "Inicio exacto de transcripción. 'Py2' indica dos pirimidinas en -2 y -1; 'Cap' es la base +1 que se transcribe primero; 'y4' son cuatro purinas siguientes.",
      function: "Define el nucleótido +1 que inicia el ARN"
    },
    promoter: {
      name: "Promotor",
      sequence: "Región reguladora",
      position: "Alrededor del inicio",
      color: "#6b7280",
      short: " donde se unen los factores",
      description:
        "Región del ADN que contiene la caja TATA, INR y otros elementos. Es el sitio de reconocimiento para la maquinaria de transcripción.",
      function: "Coordina el ensamblaje del complejo de iniciación"
    }
  },

  polymerases: {
    pol2: {
      name: "ARN Polimerasa II",
      subunits: ["alfa", "beta", "beta'", "sigma"],
      color: "#f97316",
      description:
        "Principal enzima que sintetiza ARN mensajero. Para hacerlo más fácil de entender, la mostramos con sus 4 partes principales: dos copias de alfa (que forman los lados), beta (izquierda), beta' (derecha) y sigma (frente, que ayuda a encontrar el inicio).",
      role: "Une los nucleótidos para hacer la cadena de ARN siguiendo las instrucciones del ADN"
    }
  },

  factors: [
    {
      name: "TFIID",
      subunits: "20 subunidades (TBP + 13-14 TAFs)",
      key: "TBP (TATA-binding protein)",
      color: "#f59e0b",
      position: "En caja TATA",
      description:
        "Primer factor en unirse. TBP reconoce la caja TATA, dobla el ADN y sirve como andamio para el resto.",
      function: "Reconocimiento del promotor y reclutamiento inicial"
    },
    {
      name: "TFIIB",
      subunits: "1",
      key: "B-finger",
      color: "#ef4444",
      position: "Entre TATA y Pol II",
      description:
        "Se une después de TFIID. Interactúa con TBP y la polimerasa, determinando el sitio preciso de inicio.",
      function: "Posiciona Pol II y regula la unión de TFIID y la polimerasa"
    },
    {
      name: "TFIIF",
      subunits: "2 (RAP74/RAP30)",
      key: "RAP74/RAP30",
      color: "#8b5cf6",
      position: "Unido a Pol II",
      description:
        "Viaja con Pol II y estabiliza su unión al promotor. También ayuda a reclutar TFIIE.",
      function: "Escolta y estabilización de Pol II"
    },
    {
      name: "TFIIE",
      subunits: "2 (α y β)",
      key: "α/β subunidades",
      color: "#06b6d4",
      position: "Lado de Pol II",
      description:
        "Se une después de TFIIF, atrae a TFIIH y regula su actividad quinasa y helicasa.",
      function: "Reclutamiento y activación de TFIIH"
    },
    {
      name: "TFIIH",
      subunits: "10+ (XPB, XPD helicasas; quinasa CDK7)",
      key: "XPB, XPD, CDK7",
      color: "#6366f1",
      position: "Complejo enzimático",
      description:
        "Complejo multifuncional: abre la doble hélice (helicasas XPB/XPD) y fosforila a Pol II (quinasa CDK7), activándola.",
      function: "Apertura de la burbuja de transcripción y activación de Pol II"
    }
  ]
};

// ============ State ============

const state = {
  step: 0,
  steps: 5,
  displayStep: 0,
  playing: false,
  frameId: null,
  timeoutId: null,

  dna: null,
  bubbleOpen: false,
  phase: 0,
  renderId: null,

  // Drag & drop
  isDragging: false,
  draggedElement: null,
  droppedElements: {},

  // Drag offset (opcional)
  dragOffset: { x: 0, y: 0 },

  // Highlight
  highlightedElement: null,
  highlightPulse: false,

  animation: {
    active: false,
    from: 0,
    to: 0,
    start: 0,
    duration: 900
  }
};

// Publish for lab assistant
window.__LAB_STATE__ = state;
window.transcriptionState = state;

// ============ DOM refs ============

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cardTitle = document.getElementById('cardTitle');
const cardBody = document.getElementById('cardBody');
const detailTitle = document.getElementById('detailTitle');
const detailText = document.getElementById('detailText');

let width = 0;
let height = 0;
let cy = 0;

const baseSpacing = 12;
const baseRadius = 60;

// ============ Utils ============

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function getCss(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function getHelixPoint(index, strand = 1) {
  const phase = state.phase || 0;
  const x = 30 + index * baseSpacing;
  const offset = strand === 2 ? 18 : 0;
  const wave = Math.sin(index * 0.05 + (strand === 2 ? Math.PI : 0) + phase) * baseRadius * 0.9;
  const y = cy + offset + wave + Math.cos(index * 0.02 + phase * 0.8) * 8;
  return { x, y };
}

window.getHelixPoint = getHelixPoint;

function getCorrectPosition(elementId) {
  if (!state.dna) return { x: 0, y: 0 };

  const { tataIndex, inrIndex } = state.dna;
  const tataPoint = getHelixPoint(tataIndex, 1);
  const inrPoint = getHelixPoint(inrIndex, 1);
  const promoterMid = { x: (tataPoint.x + inrPoint.x) / 2, y: (tataPoint.y + inrPoint.y) / 2 + 6 };

  const positions = {
    tata: { x: tataPoint.x, y: tataPoint.y - 45 },
    promotor: { x: promoterMid.x, y: promoterMid.y - 12 },
    promoter: { x: promoterMid.x, y: promoterMid.y - 12 },
    inr: { x: inrPoint.x, y: inrPoint.y + 10 },
    tfiid: { x: tataPoint.x, y: tataPoint.y - 80 },
    tfiib: { x: tataPoint.x + 55, y: tataPoint.y - 25 },
    tfiif: { x: inrPoint.x - 95, y: inrPoint.y - 55 },
    tfiie: { x: inrPoint.x + 95, y: inrPoint.y - 55 },
    tfiih: { x: inrPoint.x + 95, y: inrPoint.y - 20 },
    polii: { x: inrPoint.x, y: inrPoint.y - 80 }
  };

  const key = String(elementId).toLowerCase();
  return positions[key] || { x: 0, y: 0 };
}

// ============ Quiz Modal (si existe en DOM) ============

(function initQuizModal(){
  const quizBtn = document.getElementById('quizBtn');
  const quizModal = document.getElementById('quizModal');
  if (!quizBtn || !quizModal) return;

  const quizQuestion = document.getElementById('quizQuestion');
  const quizOptions = document.getElementById('quizOptions');
  const quizFeedback = document.getElementById('quizFeedback');
  const quizNext = document.getElementById('quizNext');
  const quizPrev = document.getElementById('quizPrev');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizComplete = document.getElementById('quizComplete');
  const quizArea = document.getElementById('quizArea');
  const quizScore = document.getElementById('quizScore');
  const quizRestart = document.getElementById('quizRestart');
  const quizClose = document.getElementById('quizClose');
  const nameInput = document.getElementById('quizName');

  // Guardar nombre automáticamente mientras se escribe
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      localStorage.setItem('quizLastUserName', nameInput.value.trim());
    });
  }

  let cq = 0;
  let ca = [];

  function renderQuestion(){
    quizQuestion.textContent = (cq + 1) + '. ' + QUIZ_DATA[cq].q;
    quizOptions.innerHTML = '';
    quizProgressFill.style.width = ((cq + 1) / QUIZ_DATA.length) * 100 + '%';

    QUIZ_DATA[cq].o.forEach((o, i) => {
      const el = document.createElement('div');
      el.className = 'quiz-option';
      if (ca[cq] === i) el.classList.add('selected');
      el.textContent = String.fromCharCode(65 + i) + '. ' + o;
      el.onclick = () => {
        ca[cq] = i;
        renderQuestion();
      };
      quizOptions.appendChild(el);
    });

    quizFeedback.className = 'quiz-feedback';
    quizFeedback.classList.remove('show');
    if (ca[cq] !== undefined) showFeedback();

    quizPrev.style.display = cq > 0 ? 'block' : 'none';
    quizNext.textContent = (cq === QUIZ_DATA.length - 1)
      ? (ca[cq] !== undefined ? 'Finalizar' : 'Responder y Finalizar')
      : (ca[cq] !== undefined ? 'Siguiente' : 'Responder y Continuar');
  }

  function showFeedback(){
    const d = QUIZ_DATA[cq];
    const correct = ca[cq] === d.c;

    // Regla del mini-examen:
    // - Si te equivocas, se bloquea esa pregunta (y ya no se puede corregir)
    if (!correct) {
      lockedQuestions.add(cq);
      quizFailed = true;
      saveQuizLockState();

      // Bloquear visualmente: deshabilitamos click en las opciones
      quizOptions.querySelectorAll('.quiz-option').forEach((opt, i) => {
        opt.onclick = null;
        opt.style.pointerEvents = 'none';
        if (i === d.c) opt.classList.add('correct');
      });
    }

    // Modo examen: NO mostrar la respuesta correcta.
    // Solo resaltar la opción elegida como correcta/incorrecta.
    quizFeedback.textContent = correct ? 'Correcto ✅' : 'Incorrecto ❌';
    quizFeedback.className = 'quiz-feedback ' + (correct ? 'correct' : 'incorrect') + ' show';

    const opts = quizOptions.querySelectorAll('.quiz-option');
    opts.forEach((opt, i) => {
      opt.classList.remove('correct','incorrect','selected');
      if (i === ca[cq]) {
        if (correct) opt.classList.add('correct');
        else opt.classList.add('incorrect');
      }
      if (i === ca[cq]) opt.classList.add('selected');
    });
  }

  function next(){
    if (ca[cq] === undefined) { alert('Selecciona una opción'); return; }
    showFeedback();
    if (cq < QUIZ_DATA.length - 1) {
      cq++;
      setTimeout(renderQuestion, 250);
    } else {
      finish();
    }
  }

  function prev(){
    if (cq > 0) {
      cq--;
      renderQuestion();
    }
  }

  async function finish(){
    const correctCount = ca.filter((a,i) => a === QUIZ_DATA[i].c).length;
    const total = QUIZ_DATA.length;
    const pct = Math.round((correctCount / total) * 100);

    const nameInput = document.getElementById('quizName');
    const nombre = nameInput ? String(nameInput.value || '').trim() : '';
    const finalNombre = nombre || 'Anónimo';

    // Guardar nombre para futuros intentos
    try {
      localStorage.setItem('quizLastUserName', finalNombre);
    } catch (_) {}

    // Guardamos el nombre dentro del db y en las filas para que sea visible en Sheets/Excel.
    // (Las filas se generan abajo y se reutiliza 'finalNombre')

    // Registrar respuestas (estilo Google Forms/Excel)
    // Incluye el nombre del usuario en cada fila
    const rows = QUIZ_DATA.map((q, i) => {
      const chosenIndex = ca[i];
      const isCorrect = chosenIndex === q.c;
      return {
        nombre: finalNombre,
        pregunta: q.q,
        respuestaSeleccionada: chosenIndex !== undefined ? q.o[chosenIndex] : '',
        calificacion: isCorrect ? 'Bien' : 'Mal',
        puntajeNumerico: isCorrect ? 1 : 0
      };
    });

    const db = {
      description: 'Base de datos estilo Excel/Google Forms (local) para el Quiz',
      createdAt: new Date().toISOString(),
      nombre: finalNombre,
      total: total,
      correctCount: correctCount,
      porcentaje: pct,
      rows: rows
    };

    try {
      localStorage.setItem('quizResultsDB', JSON.stringify(db));
    } catch (_) {}

    // También intentar persistir en un archivo/descarga (opcional)
    try {
      // En navegadores locales suele fallar escribir archivos por seguridad.
      // Aquí dejamos solo el registro en localStorage.
    } catch (_) {}

// Guardar intentos en localStorage (evita problemas de CORS y tracking)
try {
  // Obtener intentos previos
  const attemptsKey = 'quizAttemptsAll';
  const attemptsStr = localStorage.getItem(attemptsKey);
  const attempts = attemptsStr ? JSON.parse(attemptsStr) : [];
  
  // Añadir intento actual
  attempts.push(db);
  
  // Guardar de vuelta
  localStorage.setItem(attemptsKey, JSON.stringify(attempts));
  
  console.log('Intentos guardados en localStorage:', attempts.length);
} catch (err) {
  console.log('No se pudo guardar en localStorage:', err);
}

    quizArea.style.display = 'none';
    quizComplete.style.display = 'block';

    // Mostrar puntaje con nombre
    quizScore.textContent = `${finalNombre}: ${correctCount}/${total} (${pct}%)`;
    const msg = (pct >= 80) ? '¡Excelente!' : (pct >= 60 ? '¡Bien hecho!' : '¡Sigue aprendiendo!');
    quizComplete.querySelector('p').textContent = msg;

    // Actualizar preview del último resultado guardado
    try {
      const previewText = document.getElementById('quizDbPreviewText');
      if (previewText && db) {
        const fecha = db.createdAt ? new Date(db.createdAt).toLocaleString() : '';
        previewText.textContent = `${db.nombre} — ${db.correctCount}/${db.total} (${db.porcentaje}%) — ${fecha}`;
      }

      // Preparar CSV exportable para el profe (Resumen + Respuestas)
      const csv = buildQuizCsv(db);
      window.__LAST_QUIZ_CSV__ = csv;
    } catch (_) {}
  }

const quizResultsKey = 'transcriptionQuizAttemptState';

  let lockedQuestions = new Set();
  let quizFailed = false;

  function loadQuizLockState(){
    try {
      const raw = localStorage.getItem(quizResultsKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      lockedQuestions = new Set(parsed.lockedQuestions || []);
      quizFailed = !!parsed.quizFailed;
    } catch (_) {}
  }

  function saveQuizLockState(){
    try {
      localStorage.setItem(quizResultsKey, JSON.stringify({
        lockedQuestions: Array.from(lockedQuestions),
        quizFailed
      }));
    } catch (_) {}
  }

  function reset(){
    // Nuevo intento: reseteamos el examen, pero NO desbloqueamos si está marcado como fallado.
    // La regla pedida: si fallas una, ya no se puede corregir hasta el siguiente intento.
    // Eso implica: bloqueamos todas las preguntas una vez que detectamos un fallo.
    cq = 0;
    ca = [];
    quizFailed = false;
    lockedQuestions = new Set();
    try { localStorage.removeItem(quizResultsKey); } catch (_) {}

    quizArea.style.display = 'block';
    quizComplete.style.display = 'none';
    renderQuestion();
  }

  quizBtn.onclick = () => {
    if (nameInput) {
      const savedName = localStorage.getItem('quizLastUserName');
      if (savedName) nameInput.value = savedName;
    }
    quizModal.classList.add('show');
    loadQuizLockState();
    reset();
  };
  quizClose.onclick = () => quizModal.classList.remove('show');
  quizRestart.onclick = () => reset();
  quizPrev.onclick = prev;

  const quizDownloadCsvBtn = document.getElementById('quizDownloadCsv');
  if (quizDownloadCsvBtn) {
    quizDownloadCsvBtn.onclick = () => {
      try {
        const csv = buildAllQuizAttemptsCsv();
        if (!csv) {
          alert('No hay intentos guardados todavía.');
          return;
        }
        downloadTextFile(`quiz_intentos_${new Date().toISOString().slice(0,10)}.csv`, csv);
      } catch (e) {
        console.error(e);
        alert('No se pudo generar el CSV');
      }
    };
  }

   quizNext.onclick = () => {
     if (cq === QUIZ_DATA.length - 1 && ca[cq] !== undefined) finish();
     else next();
   };

   const quizViewResultsBtn = document.getElementById('quizViewResults');
   if (quizViewResultsBtn) {
     quizViewResultsBtn.onclick = () => {
       try {
         const raw = localStorage.getItem('quizResultsDB');
         if (!raw) {
           alert('No hay resultados guardados. Completa el quiz primero.');
           return;
         }
         const csv = buildQuizCsv(JSON.parse(raw));
         if (!csv) {
           alert('No se pudo generar el CSV');
           return;
         }
         downloadTextFile(`quiz_resultado_${new Date().toISOString().slice(0,10)}.csv`, csv);
       } catch (e) {
         console.error(e);
         alert('No se pudo generar el CSV');
       }
     };
   }

  quizModal.onclick = (e) => {
    if (e.target === quizModal) quizModal.classList.remove('show');
  };

  document.onkeydown = (e) => {
    if (!quizModal.classList.contains('show')) return;
    if (e.key === 'Escape') quizModal.classList.remove('show');
    if (e.key === 'ArrowRight' && quizNext && quizNext.style.display !== 'none') quizNext.click();
    if (e.key === 'ArrowLeft' && quizPrev && quizPrev.style.display !== 'none') quizPrev.click();
  };
})();

// ============ Init & UI ============

  function buildQuizCsv(db) {
  const escapeCsv = (v) => {
    const s = v === undefined || v === null ? '' : String(v);
    if (/["\n,]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };

  const header1 = ['nombre', 'createdAt', 'total', 'correctCount', 'porcentaje', 'descripción'];
  const row1 = [db.nombre, db.createdAt, db.total, db.correctCount, db.porcentaje, db.description];
  const rows = [];

  rows.push('## Resumen');
  rows.push(header1.map(escapeCsv).join(','));
  rows.push(row1.map(escapeCsv).join(','));

   const header2 = ['nombre', 'pregunta', 'respuestaSeleccionada', 'calificacion', 'puntajeNumerico'];
   rows.push('');
   rows.push('## Respuestas');
   rows.push(header2.map(escapeCsv).join(','));
   (db.rows || []).forEach((r) => {
     rows.push([r.nombre, r.pregunta, r.respuestaSeleccionada, r.calificacion, r.puntajeNumerico].map(escapeCsv).join(','));
   });

  return rows.join('\n');
}

function buildAllQuizAttemptsCsv() {
  try {
    const raw = localStorage.getItem('quizResultsDB');
    if (!raw) {
      // También contempla si se guardaron como lista en otra clave (compat)
      return null;
    }

    const db = JSON.parse(raw);
    if (!db || !db.rows) return null;

    const escapeCsv = (v) => {
      const s = v === undefined || v === null ? '' : String(v);
      if (/["\n,]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };

    const header1 = ['nombre', 'createdAt', 'total', 'correctCount', 'porcentaje', 'descripción'];
    const row1 = [db.nombre, db.createdAt, db.total, db.correctCount, db.porcentaje, db.description];

    const lines = [];
    lines.push('## Resumen');
    lines.push(header1.map(escapeCsv).join(','));
    lines.push(row1.map(escapeCsv).join(','));

   const header2 = ['nombre', 'pregunta', 'respuestaSeleccionada', 'calificacion', 'puntajeNumerico'];
   lines.push('');
   lines.push('## Respuestas');
   lines.push(header2.map(escapeCsv).join(','));
   db.rows.forEach((r) => {
     lines.push([r.nombre, r.pregunta, r.respuestaSeleccionada, r.calificacion, r.puntajeNumerico]
       .map(escapeCsv)
       .join(','));
   });

    return lines.join('\n');
  } catch (e) {
    console.error(e);
    return null;
  }
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function init() {
  resize();
  window.addEventListener('resize', resize);

  setupListeners();
  setupTouchSupport();

  generateDNA();
  draw();
  updateUI();

  if (window.labAssistant) window.labAssistant.startTutorialForStep(1);
}

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width - 48;
  canvas.height = Math.max(260, Math.min(380, rect.width * 0.45));
  width = canvas.width;
  height = canvas.height;
  cy = height / 2;
  draw();
}

function setupListeners() {
  const playBtn = document.getElementById('play');
  const stepBtn = document.getElementById('step');
  const resetBtn = document.getElementById('reset');

  if (playBtn) playBtn.addEventListener('click', toggle);
  if (stepBtn) stepBtn.addEventListener('click', next);
  if (resetBtn) resetBtn.addEventListener('click', reset);

  if (canvas) canvas.addEventListener('click', onCanvasClick);

  document.querySelectorAll('.step').forEach(el => {
    el.addEventListener('click', () => goTo(parseInt(el.dataset.step, 10)));
  });

  // sidebar cards
  document.querySelectorAll('.element-card').forEach(card => {
    card.addEventListener('click', () => showElementDetail(card.dataset.element));
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
  });

  canvas.addEventListener('dragover', handleDragOver);
  canvas.addEventListener('dragleave', handleDragLeave);
  canvas.addEventListener('drop', handleDrop);

  // lab assistant button (if present)
  const labAssistantBtn = document.getElementById('labAssistantBtn');
  if (labAssistantBtn && window.labAssistant) {
    labAssistantBtn.addEventListener('click', () => window.labAssistant.enterSandboxMode());
  }

  // hint system (optional)
  const useHintBtn = document.getElementById('useHintBtn');
  const closeHintBtn = document.getElementById('closeHintBtn');
  const hintSystem = document.getElementById('hintSystem');
  const hintText = document.getElementById('hintText');

  if (useHintBtn && closeHintBtn && hintSystem && hintText && window.labAssistant) {
    useHintBtn.addEventListener('click', () => window.labAssistant.showHint());
    closeHintBtn.addEventListener('click', () => hintSystem.classList.remove('show'));

    const originalShowHint = window.labAssistant.showHint.bind(window.labAssistant);
    window.labAssistant.showHint = () => {
      originalShowHint();
      const hints = {
        1: "Busca el elemento con el nombre 'Pol II' en la barra lateral izquierda. Tiene un icono naranja.",
        2: "La Caja TATA es roja y contiene las letras TATAAA. Busca dónde aparecen esas letras en el ADN.",
        3: "El INR es azul y marca el sitio +1. Busca el sitio de inicio marcado en el ADN.",
        4: "Los factores se nombran TFIIB, TFIIF, TFIIE y TFIIH. Cada uno tiene un color único.",
        5: "Todos los factores deben estar cerca de la polimerasa y el ADN. Observa sus colores y posiciones."
      };

      if (window.labAssistant.currentStep) {
        hintText.textContent = hints[window.labAssistant.currentStep] || hintText.textContent;
        hintSystem.classList.add('show');
      }
    };
  }
}

function updateUI() {
  document.querySelectorAll('.step').forEach((el, i) => {
    el.classList.remove('active', 'completed');
    if (i + 1 < state.step) el.classList.add('completed');
    if (i + 1 === state.step) el.classList.add('active');
  });

  const stepper = document.getElementById('stepper');
  if (stepper) stepper.style.display = state.step > 0 ? 'flex' : 'none';

  const info = stepInfo(state.step);
  if (cardTitle) cardTitle.textContent = info.title;
  if (cardBody) {
    cardBody.innerHTML = info.body;
    cardBody.classList.remove('fade-in');
    void cardBody.offsetWidth;
    cardBody.classList.add('fade-in');
  }

  if (detailTitle && detailText) updateDetail(state.step);

  if (window.labAssistant) {
    if (state.step > 0 && state.step !== window.labAssistant.currentStep) {
      window.labAssistant.startTutorialForStep(state.step);
    }
    window.labAssistant.checkProgress();
    window.labAssistant.provideContextualHelp();
  }
}

function updateDetail(step) {
  let title, text;
  switch (step) {
    case 1:
      title = "ARN Polimerasa II";
      text = "Enzima que sintetiza ARN mensajero. Necesita factores generales para iniciar en el sitio correcto.";
      break;
    case 2:
      title = "Caja TATA (TATAAA)";
      text = "Secuencia consenso ubicada 25-35 pb antes del inicio. TBP (TFIID) se une aquí y curva el ADN.";
      break;
    case 3:
      title = "Iniciador (INR: Py2CAPy4)";
      text = "Define el nucleótido +1 exacto. TFIID y TFIIB reconocen este sitio.";
      break;
    case 4:
      title = "Factores de Transcripción General";
      text = "TFIIB: puente; TFIIF: escolta; TFIIE: recluta TFIIH; TFIIH: abre ADN y activa Pol II.";
      break;
    case 5:
      title = "Complejo de Iniciación";
      text = "TFIIH fosforila la CTD de Pol II y se forma la burbuja de transcripción. Inicia la síntesis en +1.";
      break;
    default:
      title = "Iniciación de Transcripción";
      text = "Haz clic en los elementos del gráfico para explorar.";
  }

  detailTitle.textContent = title;
  detailText.textContent = text;
}

function stepInfo(step) {
  const data = {
    1: {
      title: "Iniciación",
      body: "<p>La <span class='term'>ARN Polimerasa II</span> es la enzima que produce ARN mensajero.</p><p>Antes de iniciar, se asocia con <strong>factores de transcripción</strong> que la guían al sitio correcto del ADN.</p>"
    },
    2: {
      title: "Caja TATA",
      body: "<p>La secuencia <span class='term'>TATAAA</span> está 25-35 pares de bases antes del inicio.</p><p>El factor <strong>TFIID</strong> (con la subunidad TBP) se une aquí primero, curvando el ADN y marcando el lugar.</p>"
    },
    3: {
      title: "Iniciador (INR)",
      body: "<p>El punto exacto donde comienza la síntesis: <span class='term'>Py2CAPy4</span>.</p><p>'Py' = dos pirimidinas (C/T) en -2 y -1; 'CAP' es la primera base transcrita (+1).</p>"
    },
    4: {
      title: "Factores de Transcripción",
      body: "<ul><li><strong>TFIIB:</strong> Puente entre TBP y Pol II</li><li><strong>TFIIF:</strong> Escolta y estabiliza Pol II</li><li><strong>TFIIE:</strong> Recluta TFIIH</li><li><strong>TFIIH:</strong> Abre el ADN y activa Pol II</li></ul>"
    },
    5: {
      title: "Complejo de Iniciación",
      body: "<p>TFIIH activa a Pol II y abre el ADN formando la <strong>burbuja de transcripción</strong>.</p><p>La síntesis de ARN comienza en el sitio +1.</p>"
    }
  };

  return data[step] || data[1];
}

// ============ Drag & Drop ============

// Element dragging source: either from sidebar (.element-card) or from inside-canvas (picked from state.droppedElements)
function handleDragStart(e) {
  // Sidebar drag
  const card = e.target.closest('.element-card');
  if (card) {
    const elementId = card.dataset.element;
    state.draggedElement = elementId;
    state.draggedElementSource = 'sidebar';

    try {
      e.dataTransfer.setData('text/plain', elementId);
    } catch (_) {}

    e.dataTransfer.effectAllowed = 'move';
    canvas.classList.add('drag-over');
    return;
  }

  // Canvas internal drag (we use a synthetic drag handle created on the fly)
  const dragHandle = e.target.closest('[data-canvas-drag]');
  if (!dragHandle) return;

  const elementId = dragHandle.dataset.canvasDrag;
  if (!elementId) return;

  state.draggedElement = elementId;
  state.draggedElementSource = 'canvas';
  try {
    e.dataTransfer.setData('text/plain', elementId);
  } catch (_) {}

  e.dataTransfer.effectAllowed = 'move';
  canvas.classList.add('drag-over');
}

function handleDragEnd() {
  state.isDragging = false;
  state.draggedElement = null;
  state.draggedElementSource = null;
  canvas.classList.remove('drag-over');
  draw();
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  canvas.classList.add('drag-over');
}

function handleDragLeave() {
  canvas.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  canvas.classList.remove('drag-over');

  const elementId = state.draggedElement || e.dataTransfer.getData('text/plain');
  if (!elementId) return;
  if (!state.dna) return;

  // Permitir soltar aunque todavía no se haya avanzado al step 1;
  // se valida únicamente que exista state.dna
  if (!state.dna) return;


  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  const elementKey = elementId.toLowerCase();
  const correctPos = getCorrectPosition(elementKey);
  const dist = Math.hypot(x - correctPos.x, y - correctPos.y);
  const tolerance = 55;

  // Sandbox: permite colocar aunque no esté en la posición correcta
  if (dist <= tolerance || (window.labAssistant && window.labAssistant.userLevel === 'sandbox')) {
    state.droppedElements[elementKey] = (dist <= tolerance) ? correctPos : { x, y };
    if (dist <= tolerance) {
      showPlacementToast('¡Bien colocado!', 'success');
      if (window.showSuccessFeedback) window.showSuccessFeedback();
    }
  } else {
    if (window.showHintFeedback) window.showHintFeedback();
    return;
  }

  state.isDragging = false;
  state.draggedElement = null;
  state.draggedElementSource = null;

  draw();
  updateUI();
  if (window.labAssistant) window.labAssistant.checkProgress();
}

// Create invisible drag handles for already-dropped items (so user can drag inside canvas)
function syncCanvasDragHandles() {
  if (!canvas) return;

  // Use a container overlaying the canvas
  let overlay = document.getElementById('canvasDragOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'canvasDragOverlay';
    overlay.style.position = 'absolute';
    overlay.style.left = '0px';
    overlay.style.top = '0px';
    overlay.style.width = canvas.width + 'px';
    overlay.style.height = canvas.height + 'px';
    overlay.style.zIndex = '10';
    overlay.style.pointerEvents = 'none';

    // Parent must be positioning context
    if (canvas.parentElement) canvas.parentElement.style.position = 'relative';
    canvas.parentElement && canvas.parentElement.appendChild(overlay);
  }


  // Resize overlay
  overlay.style.width = canvas.width + 'px';
  overlay.style.height = canvas.height + 'px';

  overlay.innerHTML = '';

  const entries = Object.entries(state.droppedElements || {});
  entries.forEach(([id, pos]) => {
    if (!pos) return;
    const handle = document.createElement('div');
    handle.dataset.canvasDrag = id;
    handle.draggable = true;

    // enable pointer events only for the handle area
    const size = 44;
    handle.style.position = 'absolute';
    handle.style.left = (pos.x - size / 2) + 'px';
    handle.style.top = (pos.y - size / 2) + 'px';
    handle.style.width = size + 'px';
    handle.style.height = size + 'px';
    handle.style.borderRadius = '50%';
    handle.style.background = 'rgba(0,0,0,0)';
    handle.style.pointerEvents = 'auto';

    handle.addEventListener('dragstart', handleDragStart);
    handle.addEventListener('dragend', handleDragEnd);

    overlay.appendChild(handle);
  });
}


// ============ Touch Support ============

function setupTouchSupport() {
  let touchStartX = 0;
  let touchStartY = 0;

  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  });

  canvas.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = Math.abs(t.clientX - touchStartX);
    const dy = Math.abs(t.clientY - touchStartY);
    if (dx < 10 && dy < 10) onCanvasClick(e);
  });
}

// ============ DNA Generation ============

function generateDNA() {
  const bases = ['A', 'T', 'G', 'C'];
  const comp = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const len = Math.floor(width / baseSpacing) + 10;

  const s1 = Array.from({ length: len }, () => bases[Math.floor(Math.random() * 4)]);
  const s2 = s1.map(b => comp[b]);

  // Insert TATA at ~22%
  const tPos = Math.floor(len * 0.22);
  const tata = ['T','A','T','A','A','A'];
  s1.splice(tPos, 0, ...tata);
  s2.splice(tPos, 0, tata.map(b => comp[b]).join('').split(''));

  const inrPos = Math.floor(s1.length * 0.5);

  state.dna = {
    strand1: s1,
    strand2: s2,
    tataIndex: tPos,
    inrIndex: inrPos
  };
}

// ============ Drawing ============

function draw() {
  ctx.clearRect(0, 0, width, height);
  drawBackground();
  drawGrid();
  if (!state.dna) return;

  drawDNAHelix();
  drawPromoterRegion();
  drawBoundElements();
  if (state.bubbleOpen) drawBubble();
  drawRNA();
  drawDroppedMarkers();

  // Keep canvas drag handles in sync with dropped elements
  syncCanvasDragHandles();
}


function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#f9fafb');
  grad.addColorStop(1, '#f3f4f6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(0,0,0,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

function drawDNAHelix() {
  const { strand1, strand2 } = state.dna;
  const progress = state.displayStep;
  const maxDraw = progress >= 2 ? width - 40 : 200;
  const limit = Math.min(strand1.length, Math.floor(maxDraw / baseSpacing));

  ctx.lineWidth = 2.5;

  // Strand 1
  ctx.strokeStyle = getCss('--dna') || '#8b5cf6';
  ctx.beginPath();
  const phase = state.phase || 0;
  for (let i = 0; i < limit; i++) {
    const p = getHelixPoint(i, 1);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // Strand 2
  ctx.strokeStyle = '#d8b4fe';
  ctx.beginPath();
  for (let i = 0; i < limit; i++) {
    const p = getHelixPoint(i, 2);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  // connectors + bases
  for (let i = 0; i < limit; i += 4) {
    const p1 = getHelixPoint(i, 1);
    const p2 = getHelixPoint(i, 2);

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    drawBaseMarker(p1.x, p1.y, strand1[i]);
    drawBaseMarker(p2.x, p2.y, strand2[i]);
  }
}

function drawBaseMarker(x, y, base) {
  const colorMap = { A: '#facc15', T: '#60a5fa', G: '#a78bfa', C: '#34d399' };
  ctx.fillStyle = colorMap[base] || '#94a3b8';
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawPromoterRegion() {
  if (state.displayStep < 2) return;

  const { tataIndex, inrIndex } = state.dna;
  const start = getHelixPoint(tataIndex, 1);
  const end = getHelixPoint(inrIndex, 1);

  ctx.save();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.18)';
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  const labelX = (start.x + end.x) / 2;
  const labelY = (start.y + end.y) / 2 - 24;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
  ctx.font = 'bold 11px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('Promotor', labelX, labelY);
  ctx.restore();
}

function sf(s) {
  return Math.max(0, Math.min(1, s));
}

function drawBoundElements() {
  const progress = state.displayStep;
  if (progress < 2) return;

  const { tataIndex, inrIndex } = state.dna;
  const tataPoint = getHelixPoint(tataIndex, 1);
  const inrPoint = getHelixPoint(inrIndex, 1);

  // TATA + TBP (TFIID)
  if (progress >= 2) {
    const alpha = sf((progress - 1) * 0.6);
    ctx.save();
    ctx.globalAlpha = alpha;

    // TATA highlight
    ctx.strokeStyle = DATA.elements.tata.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(tataPoint.x - 42, tataPoint.y - 38, 84, 48);

    // TBP bubble
    const tAlpha = sf((progress - 2) * 0.9 + 0.15);
    const tbpY = tataPoint.y - 80 - (1 - sf(progress - 2)) * 20;
    ctx.globalAlpha = tAlpha;
    drawProteinBubble(tataPoint.x, tbpY, 24, 'TBP', DATA.factors[0].color, 'tbp');

    ctx.restore();
  }

  // Pol II
  if (progress >= 3) {
    const pAlpha = sf((progress - 2) * 0.8 + 0.3);
    ctx.save();
    ctx.globalAlpha = pAlpha;

    const polX = inrPoint.x;
    const polY = inrPoint.y - 80;

    // Main Pol II body
    ctx.fillStyle = DATA.polymerases.pol2.color;
    ctx.beginPath();
    ctx.ellipse(polX, polY + 20, 48, 44, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Subunits (simple visual breakdown)
    // alfa (two copies)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(polX - 32, polY + 12, 10, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(polX + 32, polY + 12, 10, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // beta (left)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(polX - 18, polY + 26, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // beta' (right)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.ellipse(polX + 18, polY + 26, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // sigma (front)
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(polX, polY + 2, 20, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pol II', polX, polY + 44);
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('α', polX - 32, polY + 18);
    ctx.fillText('α', polX + 32, polY + 18);
    ctx.fillText('β', polX - 18, polY + 32);
    ctx.fillText("β'", polX + 18, polY + 32);
    ctx.fillText('σ', polX, polY + 8);

    // +1 marker
    ctx.fillStyle = DATA.elements.inr.color;
    ctx.beginPath();
    ctx.arc(inrPoint.x, inrPoint.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 9px system-ui';
    ctx.fillText('+1', inrPoint.x, inrPoint.y + 3);

    ctx.restore();
  }


  // Factors
  if (progress >= 4) {
    const factorEase = easeOutCubic(Math.min(1, progress - 4));
    const factors = [
      { name: 'TFIIB', x: tataPoint.x + 55, y: tataPoint.y - 35, color: DATA.factors[1].color, start: { x: tataPoint.x + 55, y: tataPoint.y - 100 }, key: 'tfiib' },
      { name: 'TFIIF', x: inrPoint.x - 95, y: inrPoint.y - 55, color: DATA.factors[2].color, start: { x: inrPoint.x - 95, y: inrPoint.y - 120 }, key: 'tfiif' },
      { name: 'TFIIE', x: inrPoint.x + 95, y: inrPoint.y - 55, color: DATA.factors[3].color, start: { x: inrPoint.x + 95, y: inrPoint.y - 20 }, key: 'tfiie' },
      { name: 'TFIIH', x: inrPoint.x + 95, y: inrPoint.y - 20, color: DATA.factors[4].color, start: { x: inrPoint.x + 95, y: inrPoint.y + 10 }, key: 'tfiih' }
    ];

    factors.forEach((f, i) => {
      const itemProgress = Math.max(0, Math.min(1, factorEase - i * 0.1));
      const alpha = sf(itemProgress * 1.2);
      const dy = f.start.y + (f.y - f.start.y) * itemProgress;
      ctx.save();
      ctx.globalAlpha = alpha;
      drawProteinBubble(f.x, dy, 16, f.name, f.color, 'circle');
      ctx.restore();
    });

    state.bubbleOpen = progress >= 4.4;
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function drawProteinBubble(x, y, r, label, color, type = 'circle') {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  switch (type) {
    case 'tbp':
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.2, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - r * 1.2, y);
      ctx.quadraticCurveTo(x, y - r * 0.8, x + r * 1.2, y);
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.fillStyle = 'white';
  ctx.font = 'bold 8px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y + 4);
}

function drawBubble() {
  const { tataIndex, inrIndex, strand1 } = state.dna;
  const startIdx = Math.max(0, tataIndex - 4);
  const endIdx = Math.min(strand1.length - 1, inrIndex + 6);

  const topPoints = [];
  const bottomPoints = [];
  for (let i = startIdx; i <= endIdx; i++) {
    topPoints.push(getHelixPoint(i, 1));
    bottomPoints.push(getHelixPoint(i, 2));
  }
  if (!topPoints.length) return;

  const centerX = (topPoints[0].x + topPoints[topPoints.length - 1].x) / 2;
  const centerY = (topPoints[0].y + bottomPoints[bottomPoints.length - 1].y) / 2;
  const pulse = 1 + Math.sin(state.phase * 1.8) * 0.04;

  const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 90 * pulse);
  grad.addColorStop(0, 'rgba(239, 68, 68, 0.16)');
  grad.addColorStop(0.6, 'rgba(239, 68, 68, 0.08)');
  grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

  ctx.save();
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(topPoints[0].x, topPoints[0].y);
  topPoints.forEach(p => ctx.lineTo(p.x, p.y));
  for (let i = bottomPoints.length - 1; i >= 0; i--) ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
  ctx.font = 'bold 12px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('Burbuja de transcripción', centerX, centerY - 28);
  ctx.restore();
}

function drawRNA() {
  const progress = state.displayStep;
  if (progress < 5) return;

  const { inrIndex } = state.dna;
  const startX = 30 + inrIndex * baseSpacing;
  const len = Math.min(140, (progress - 4) * 30 + 20);

  const points = [];
  for (let i = 0; i <= len; i++) {
    const x = startX + i * 5;
    const y = cy - 40 + Math.sin(i * 0.18 + state.phase * 1.1) * 4 + i * 0.04;
    points.push({ x, y });
  }

  const grad = ctx.createLinearGradient(startX, cy - 40, startX + len * 5, cy - 40);
  grad.addColorStop(0, 'rgba(16, 185, 129, 0.95)');
  grad.addColorStop(0.5, 'rgba(34, 197, 94, 0.95)');
  grad.addColorStop(1, 'rgba(6, 182, 212, 0.95)');

  ctx.save();
  ctx.strokeStyle = grad;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  points.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();
  ctx.restore();
}

function drawDroppedMarkers() {
  const entries = Object.entries(state.droppedElements || {});
  entries.forEach(([id, pos]) => {
    if (!pos) return;
    const color = getElementColor(id);
    drawProteinBubble(pos.x, pos.y, 18, String(id).toUpperCase(), color, 'circle');
  });
}



function getElementColor(id) {
  const key = String(id).toLowerCase();
  if (key === 'tata') return DATA.elements.tata.color;
  if (key === 'inr') return DATA.elements.inr.color;
  if (key === 'polii' || key === 'pol2') return DATA.polymerases.pol2.color;
  if (key === 'tfiid') return DATA.factors[0].color;
  if (key === 'tfiib') return DATA.factors[1].color;
  if (key === 'tfiif') return DATA.factors[2].color;
  if (key === 'tfiie') return DATA.factors[3].color;
  if (key === 'tfiih') return DATA.factors[4].color;
  return '#6b7280';
}

// ============ Step animation ============

function setStep(step) {
  state.step = clamp(step, 0, state.steps);
  updateUI();
  animateDisplayStep(state.step);
}

function animateDisplayStep(target) {
  state.animation = {
    active: true,
    from: state.displayStep,
    to: target,
    start: performance.now(),
    duration: 900
  };
  startRenderLoop();
  if (!state.frameId) state.frameId = requestAnimationFrame(stepAnimationLoop);
}

function stepAnimationLoop(timestamp) {
  const anim = state.animation;
  const elapsed = Math.min(timestamp - anim.start, anim.duration);
  const progress = easeOutCubic(elapsed / anim.duration);
  state.displayStep = anim.from + (anim.to - anim.from) * progress;

  if (elapsed < anim.duration) {
    state.frameId = requestAnimationFrame(stepAnimationLoop);
  } else {
    state.displayStep = anim.to;
    state.animation.active = false;
    state.frameId = null;
  }
}

function startRenderLoop() {
  if (state.renderId) return;
  state.renderId = requestAnimationFrame(renderLoop);
}

function stopRenderLoop() {
  if (state.renderId) {
    cancelAnimationFrame(state.renderId);
    state.renderId = null;
  }
}

function renderLoop(timestamp) {
  state.phase = timestamp * 0.0025;
  draw();
  if (state.playing || state.animation.active) {
    state.renderId = requestAnimationFrame(renderLoop);
  } else {
    state.renderId = null;
  }
}

function scheduleNextStep() {
  if (!state.playing || state.step >= state.steps) {
    state.playing = false;
    const playBtn = document.getElementById('play');
    if (playBtn) playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Iniciar`;
    return;
  }

  state.timeoutId = setTimeout(() => {
    if (!state.playing) return;
    setStep(state.step + 1);
    if (state.step < state.steps) scheduleNextStep();
    else {
      state.playing = false;
      const playBtn = document.getElementById('play');
      if (playBtn) playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Iniciar`;
    }
  }, 2200);
}

function toggle() {
  const playBtn = document.getElementById('play');

  if (state.playing) {
    state.playing = false;
    if (state.frameId) cancelAnimationFrame(state.frameId);
    if (state.timeoutId) clearTimeout(state.timeoutId);
    stopRenderLoop();
    state.frameId = null;
    state.timeoutId = null;
    if (playBtn) playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Iniciar`;
  } else {
    if (state.step >= state.steps) reset();
    state.playing = true;
    startRenderLoop();
    if (playBtn) playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> Pausar`;
    scheduleNextStep();
  }
}

function next() {
  if (state.step < state.steps) setStep(state.step + 1);
}

function reset() {
  state.playing = false;
  if (state.frameId) cancelAnimationFrame(state.frameId);
  if (state.timeoutId) clearTimeout(state.timeoutId);
  stopRenderLoop();

  state.frameId = null;
  state.timeoutId = null;

  state.step = 0;
  state.displayStep = 0;
  state.bubbleOpen = false;
  state.highlightedElement = null;
  state.highlightPulse = false;
  state.droppedElements = {};

  if (document.getElementById('play')) {
    document.getElementById('play').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Iniciar`;
  }

  generateDNA();
  draw();
  updateUI();
}

function goTo(step) {
  setStep(step);
}

// ============ Canvas interactions (click to inspect) ============

function onCanvasClick(e) {
  if (state.step < 2 || !state.dna) return;

  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  const items = getInteractiveItems();
  const hit = items.find(item => Math.hypot(x - item.x, y - item.y) < item.radius);
  if (!hit) return;

  showPopup(hit.title, hit.data);
}

function getInteractiveItems() {
  const { tataIndex, inrIndex } = state.dna;
  const tataPoint = getHelixPoint(tataIndex, 1);
  const inrPoint = getHelixPoint(inrIndex, 1);
  const promoterMid = { x: (tataPoint.x + inrPoint.x) / 2, y: (tataPoint.y + inrPoint.y) / 2 + 6 };

  const items = [
    { id: 'tata', title: 'Caja TATA', data: DATA.elements.tata, x: tataPoint.x, y: tataPoint.y - 45, radius: 40 },
    { id: 'promotor', title: 'Promotor', data: DATA.elements.promoter || DATA.elements.promoter, x: promoterMid.x, y: promoterMid.y - 12, radius: 34 },
    { id: 'inr', title: 'Iniciador INR', data: DATA.elements.inr, x: inrPoint.x, y: inrPoint.y + 10, radius: 34 }
  ];

  if (state.step >= 4) {
    const factorSpacing = 90;
    const factors = [
      { name: 'TFIIB', id: 'tfiib', x: tataPoint.x + 55, y: tataPoint.y - 25, data: DATA.factors[1] },
      { name: 'TFIIF', id: 'tfiif', x: inrPoint.x - factorSpacing, y: inrPoint.y - 60, data: DATA.factors[2] },
      { name: 'TFIIE', id: 'tfiie', x: inrPoint.x + factorSpacing, y: inrPoint.y - 60, data: DATA.factors[3] },
      { name: 'TFIIH', id: 'tfiih', x: inrPoint.x + factorSpacing, y: inrPoint.y - 25, data: DATA.factors[4] }
    ];

    factors.forEach(f => {
      const dropped = state.droppedElements[f.id];
      items.push({ id: f.id, title: f.name, data: f.data, x: dropped ? dropped.x : f.x, y: dropped ? dropped.y : f.y, radius: 24 });
    });
  }

  return items;
}

function showPopup(title, data) {
  const firstLine = data.sequence || data.subunits || data.key || '';
  const secondLine = data.short || '';

  if (cardTitle) cardTitle.textContent = title;
  if (cardBody) {
    cardBody.innerHTML = `
      ${firstLine ? `<p><span class="term">${firstLine}</span></p>` : ''}
      ${secondLine ? `<p>${secondLine}</p>` : ''}
      <p>${data.description || ''}</p>
      ${data.function ? `<p><strong>Función:</strong> ${data.function}</p>` : ''}
      ${data.position ? `<p><small>${data.position}</small></p>` : ''}
    `;
    cardBody.classList.add('fade-in');
    setTimeout(() => cardBody.classList.remove('fade-in'), 300);
  }
}

function showElementDetail(elementId) {
  const details = {
    tata: { title: DATA.elements.tata.name, sequence: DATA.elements.tata.sequence, description: DATA.elements.tata.description, function: DATA.elements.tata.function },
    inr: { title: DATA.elements.inr.name, sequence: DATA.elements.inr.sequence, description: DATA.elements.inr.description, function: DATA.elements.inr.function },
    tfIID: { title: DATA.factors[0].name, sequence: DATA.factors[0].subunits, description: DATA.factors[0].description, function: DATA.factors[0].function },
    tfIIB: { title: DATA.factors[1].name, sequence: DATA.factors[1].subunits, description: DATA.factors[1].description, function: DATA.factors[1].function },
    tfIIF: { title: DATA.factors[2].name, sequence: DATA.factors[2].subunits, description: DATA.factors[2].description, function: DATA.factors[2].function },
    tfIIE: { title: DATA.factors[3].name, sequence: DATA.factors[3].subunits, description: DATA.factors[3].description, function: DATA.factors[3].function },
    tfIIH: { title: DATA.factors[4].name, sequence: DATA.factors[4].subunits, description: DATA.factors[4].description, function: DATA.factors[4].function },
    polII: { title: DATA.polymerases.pol2.name, sequence: DATA.polymerases.pol2.subunits.join(', '), description: DATA.polymerases.pol2.description, function: DATA.polymerases.pol2.role }
  };

  const d = details[elementId];
  if (!d) return;

  showPopup(d.title, { sequence: d.sequence, description: d.description, function: d.function });
}

// ============ Feedback placeholders (used by DnD) ============

// Si existen ya en el HTML/otro script, estas no interfieren.
window.showSuccessFeedback = window.showSuccessFeedback || function() {};
window.showHintFeedback = window.showHintFeedback || function() {};

// Toast de feedback para placements
function showPlacementToast(message, type = 'success') {
  try {
    const existing = document.querySelectorAll('.feedback-toast');
    existing.forEach(el => el.remove());

    const toast = document.createElement('div');
    toast.className = `feedback-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Forzar reflow para animación
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  } catch (_) {}
}

// ============ Start ============

// ============ Theme Toggle ============

function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  if (!themeToggle || !themeIcon) return;

  let isDark = false;
  const saved = localStorage.getItem('transcriptionTheme');
  if (saved === 'dark') {
    isDark = true;
  } else if (saved === 'light') {
    isDark = false;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark = true;
  }

  if (isDark) {
    document.body.classList.add('dark');
    themeIcon.textContent = '☀️';
  } else {
    document.body.classList.remove('dark');
    themeIcon.textContent = '🌙';
  }

  themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
      document.body.classList.add('dark');
      themeIcon.textContent = '☀️';
      localStorage.setItem('transcriptionTheme', 'dark');
    } else {
      document.body.classList.remove('dark');
      themeIcon.textContent = '🌙';
      localStorage.setItem('transcriptionTheme', 'light');
    }
  });
}

// ============ Zoom (lupa) ============

function zoomInOnElement(hit) {
  // For now we reuse the existing popup content in the info card.
  // The "lupa" in this app behaves like: click element => show detail.
  // If you want a modal/overlay version, we can add it later.
  if (!hit) return;
  showPopup(hit.title, hit.data);
}

function zoomOut() {
  // Close/open state is handled by the popup/card; no extra state needed.
  // Keep as no-op for compatibility.
}

// Replace onCanvasClick handler to use zoomIn/zoomOut
const _onCanvasClick = onCanvasClick;
onCanvasClick = _onCanvasClick;
function onCanvasClick(e) {
  if (state.step < 2 || !state.dna) return;

  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  const items = getInteractiveItems();
  const hit = items.find(item => Math.hypot(x - item.x, y - item.y) < item.radius);
  if (hit) {
    zoomInOnElement(hit);
  } else {
    if (state.zoomedElement) zoomOut();
  }
}

// ============ Initialize everything ============

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  init();
});


