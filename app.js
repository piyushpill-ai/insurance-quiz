// ========== State ==========
const state = {
  stepIndex: 0,
  answers: {},
};

// ========== Constants ==========
const AGE_BRACKET_TO_PERSONA = {
  '18-20': 20,
  '20-25': 25,
  '25-30': 30,
  '30-40': 40,
  '40-50': 50,
  '50-60': 60,
  '>60': 65,
};

const TIP_AGE = "We collect quotes for male and female 20, 25, 30, 40, 50, 60 and 65 year olds. Based on the age bracket you select, a price score will be shown to you based on the age that closest matches your age bracket range. For example, if you select 20-25, you will be shown a price score that reflects the profile of a 25 year old driver.";
const TIP_CAR_TYPE = "We collect quotes for a 2020 Toyota Corolla sedan and Kia SUV. Based on your selection, you will be shown a Price Score that closest reflects your car type.";
const TIP_PRIORITY = "Based on your selection, our Finder Score will upweight the relevant selection between Price and Features, with Comprehensiveness weighting both equally. You will be shown a Price Score, based on an average quote from personas that reflect your selections, a Feature Score that shows what each product covers, and an overall Finder Score.";

// ========== Steps ==========
const steps = [
  {
    id: "coverType",
    title: "What level of car cover do you need?",
    subtitle: "Different products cover different risks.",
    render: () => optionGrid("coverType", [
      { value: "Comprehensive", icon: "🛡️", label: "Comprehensive", desc: "Covers your car + others' property" },
      { value: "Third Party Fire & Theft", icon: "🔥", label: "Third Party Fire & Theft", desc: "Others' property + fire/theft" },
      { value: "Third Party", icon: "🚗", label: "Third Party Property", desc: "Only damage to other vehicles" },
    ]),
    validate: () => state.answers.coverType ? null : "Please pick a cover type.",
  },

  {
    id: "demographics",
    title: "About you",
    subtitle: "Your gender and age bracket.",
    tip: TIP_AGE,
    render: () => `
      <div class="field">
        <label>Gender</label>
        ${optionGrid("gender", [
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
        ], "two-col")}
      </div>
      <div class="field">
        <label>Age bracket</label>
        ${optionGrid("ageBracket", [
          { value: "18-20", label: "18-20" },
          { value: "20-25", label: "20-25" },
          { value: "25-30", label: "25-30" },
          { value: "30-40", label: "30-40" },
          { value: "40-50", label: "40-50" },
          { value: "50-60", label: "50-60" },
          { value: ">60", label: "Over 60" },
        ], "three-col")}
      </div>
    `,
    validate: () => {
      if (!state.answers.gender) return "Please select gender.";
      if (!state.answers.ageBracket) return "Please select an age bracket.";
      return null;
    },
  },

  {
    id: "state",
    title: "What state do you live in?",
    subtitle: "Pricing varies between states.",
    render: () => optionGrid("state", [
      { value: "NSW", label: "NSW" },
      { value: "VIC", label: "VIC" },
      { value: "QLD", label: "QLD" },
      { value: "TAS", label: "TAS" },
      { value: "WA", label: "WA" },
      { value: "SA", label: "SA" },
    ], "three-col"),
    validate: () => state.answers.state ? null : "Please select a state.",
  },

  {
    id: "carType",
    title: "What car type do you drive?",
    subtitle: "We map this to a representative vehicle for pricing.",
    tip: TIP_CAR_TYPE,
    render: () => optionGrid("carType", [
      { value: "Small car", icon: "🚗", label: "Small car", desc: "Hatchback, sedan" },
      { value: "Large car", icon: "🚙", label: "Large car", desc: "SUV, 4WD" },
    ], "two-col"),
    validate: () => state.answers.carType ? null : "Please select a car type.",
  },

  {
    id: "priority",
    title: "What's most important to you?",
    subtitle: "We'll weight your Finder Score accordingly.",
    tip: TIP_PRIORITY,
    render: () => optionGrid("priority", [
      { value: "Price", icon: "💰", label: "Price", desc: "I want the cheapest" },
      { value: "Features", icon: "📋", label: "Features", desc: "I want the most cover" },
      { value: "Comprehensiveness", icon: "⚖️", label: "Comprehensiveness", desc: "Balance of both" },
    ], "three-col"),
    validate: () => state.answers.priority ? null : "Please select a priority.",
  },

  {
    id: "results",
    title: "Your matched car policies",
    subtitle: "Compare scores across our partners.",
    render: () => renderResults(),
    validate: () => null,
    isLast: true,
  },
];

// ========== Helpers ==========
function optionGrid(key, opts, cols = "") {
  return `<div class="options ${cols}" data-group="${key}">
    ${opts.map(o => `
      <button class="option ${state.answers[key] === o.value ? 'selected' : ''}" data-val="${o.value}">
        ${o.icon ? `<span class="option-icon">${o.icon}</span>` : ''}
        ${o.label}
        ${o.desc ? `<div class="option-desc">${o.desc}</div>` : ''}
      </button>
    `).join('')}
  </div>`;
}

function assignScores(list) {
  if (!list.length) return list;
  const prices = list.map(i => i.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const top = 9.9, bottom = 5.0;
  return list.map(i => {
    const score = max === min ? top : top - ((i.price - min) / (max - min)) * (top - bottom);
    return { ...i, score: +score.toFixed(1) };
  });
}

// ========== Insurers + scoring ==========
const carInsurers = [
  { name: "AAMI", basePrice: 950, minAge: 21, featureScore: 8.7 },
  { name: "NRMA", basePrice: 990, minAge: 21, featureScore: 9.1 },
  { name: "Allianz", basePrice: 1050, minAge: 25, featureScore: 8.9 },
  { name: "Budget Direct", basePrice: 780, minAge: 25, featureScore: 6.8 },
  { name: "Bingle", basePrice: 720, minAge: 21, featureScore: 5.9 },
  { name: "Youi", basePrice: 880, minAge: 18, featureScore: 8.4 },
  { name: "RACV", basePrice: 920, minAge: 21, featureScore: 8.6 },
  { name: "Suncorp", basePrice: 900, minAge: 21, featureScore: 8.2 },
];

function calcCarPrice(base, personaAge, gender, stateCode, carType, coverType) {
  let p = base;
  if (coverType === 'Third Party Fire & Theft') p *= 0.6;
  else if (coverType === 'Third Party') p *= 0.35;

  if (personaAge <= 20) p *= 1.55;
  else if (personaAge <= 25) p *= 1.25;
  else if (personaAge <= 30) p *= 1.05;
  else if (personaAge <= 40) p *= 1.0;
  else if (personaAge <= 50) p *= 0.95;
  else if (personaAge <= 60) p *= 0.92;
  else p *= 0.95;

  if (gender === 'Female') p *= 0.95;
  if (carType === 'Large car') p *= 1.18;

  const stateMul = { NSW: 1.10, VIC: 1.05, WA: 1.00, QLD: 0.97, SA: 0.95, TAS: 0.93 };
  p *= stateMul[stateCode] || 1.0;

  return p;
}

function computeFinderScore(priceScore, featureScore, priority) {
  let pw, fw;
  if (priority === 'Price') { pw = 0.7; fw = 0.3; }
  else if (priority === 'Features') { pw = 0.3; fw = 0.7; }
  else { pw = 0.5; fw = 0.5; }
  return +(priceScore * pw + featureScore * fw).toFixed(1);
}

function renderResults() {
  const a = state.answers;
  const personaAge = AGE_BRACKET_TO_PERSONA[a.ageBracket] || 30;

  const eligible = carInsurers.filter(i => personaAge >= i.minAge);

  const withPrice = eligible.map(i => ({
    ...i,
    price: calcCarPrice(i.basePrice, personaAge, a.gender, a.state, a.carType, a.coverType),
  })).sort((x, y) => x.price - y.price);

  const scored = assignScores(withPrice).map(i => ({
    ...i,
    priceScore: i.score,
    finderScore: computeFinderScore(i.score, i.featureScore, a.priority),
  }));

  scored.sort((x, y) => y.finderScore - x.finderScore);

  const summary = `
    <div class="results-summary">
      <strong>${a.coverType}</strong> · ${a.gender} ${a.ageBracket} · ${a.state} · ${a.carType}<br>
      Priority: <strong>${a.priority}</strong> · Persona: <strong>${personaAge}y/o ${a.gender}</strong>
    </div>
  `;

  if (!scored.length) {
    return summary + `<div class="conditional">
      Unfortunately none of our partners match your profile — please contact our team for a tailored quote.
    </div>`;
  }

  const rows = scored.map(p => `
    <div class="results-row">
      <div class="brand-cell">${p.name}</div>
      <div class="score-cell">${p.priceScore.toFixed(1)}</div>
      <div class="score-cell">${p.featureScore.toFixed(1)}</div>
      <div class="score-cell finder-cell">${p.finderScore.toFixed(1)}</div>
    </div>
  `).join('');

  const tipPrice = "We calculate a Price Score using quotes from pre-determined personas that are the closest match to your selections. The Price Score gives an approximate guide on how expensive or cheap a product would be. This is not a representation of the quote you will get.";
  const tipFeature = "We calculate a Feature Score for each product, weighting up popular features and any limits associated with them. These include but are not limited to Core coverage, Convenience and Extras, Payment flexibility, Repairs and emergency support.";
  const tipFinder = "Based on your selection between Price, Features and Comprehensiveness, this score is dynamically calculated to upweight what you have selected as more important.";

  return summary + `
    <div class="results-table">
      <div class="results-row header-row">
        <div>Brand</div>
        <div class="tooltip-host" data-tooltip="${tipPrice}" title="${tipPrice}">Price Score <span class="info-icon">ⓘ</span></div>
        <div class="tooltip-host" data-tooltip="${tipFeature}" title="${tipFeature}">Feature Score <span class="info-icon">ⓘ</span></div>
        <div class="tooltip-host" data-tooltip="${tipFinder}" title="${tipFinder}">Finder Score <span class="info-icon">ⓘ</span></div>
      </div>
      ${rows}
    </div>
  `;
}

// ========== Render engine ==========
function render() {
  const step = steps[state.stepIndex];
  const main = document.getElementById('main');

  main.innerHTML = `
    <h2>${step.title}</h2>
    <p class="subtitle">${step.subtitle}</p>
    ${step.render()}
    <div id="errorBox"></div>
  `;

  const sideTip = document.getElementById('sideTip');
  if (step.tip) {
    sideTip.classList.remove('hidden');
    sideTip.innerHTML = `
      <span class="tip-icon">💡</span>
      <div class="tip-title">Did you know?</div>
      <div>${step.tip}</div>
    `;
  } else {
    sideTip.classList.add('hidden');
    sideTip.innerHTML = '';
  }

  main.querySelectorAll('.options').forEach(group => {
    const key = group.dataset.group;
    group.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        state.answers[key] = btn.dataset.val;
        group.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });

  document.getElementById('progressFill').style.width = (state.stepIndex / (steps.length - 1) * 100) + '%';
  document.getElementById('progressText').textContent = `Step ${state.stepIndex + 1} of ${steps.length}`;

  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');

  backBtn.disabled = state.stepIndex === 0 && !step.isLast;
  backBtn.textContent = step.isLast ? '↺ Start Over' : 'Back';

  nextBtn.style.display = step.isLast ? 'none' : 'inline-block';
  nextBtn.textContent = state.stepIndex === steps.length - 2 ? 'Show Results' : 'Next';
}

// ========== Event wiring ==========
document.getElementById('nextBtn').addEventListener('click', () => {
  const step = steps[state.stepIndex];
  const err = step.validate ? step.validate() : null;
  if (err) {
    document.getElementById('errorBox').innerHTML = `<div class="error-text">${err}</div>`;
    return;
  }
  state.stepIndex++;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('backBtn').addEventListener('click', () => {
  const step = steps[state.stepIndex];
  if (step.isLast) {
    state.stepIndex = 0;
    state.answers = {};
    render();
    return;
  }
  if (state.stepIndex === 0) return;
  state.stepIndex--;
  render();
});

render();
