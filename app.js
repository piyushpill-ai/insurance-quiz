// ========== State ==========
const state = {
  screen: 'home', // 'home' | 'quiz'
  product: null,  // 'home' | 'car'
  stepIndex: 0,
  answers: {},
};

// ========== HOME insurance steps ==========
const homeSteps = [
  {
    id: "intent",
    title: "What would you like to protect?",
    subtitle: "This helps us show you the right products.",
    render: () => optionGrid("insuranceType", [
      { value: "B", icon: "🏠", label: "Building only", desc: "The structure of your home" },
      { value: "C", icon: "📦", label: "Contents only", desc: "Your belongings inside" },
      { value: "H", icon: "🏡", label: "Home (Building + Contents)", desc: "Complete cover" },
    ]),
    validate: () => state.answers.insuranceType ? null : "Please pick an option to continue.",
  },

  {
    id: "about",
    title: "A bit about you",
    subtitle: "We use this to match you with eligible insurers.",
    render: () => `
      <div class="grid-2">
        <div class="field">
          <label>Age</label>
          <input type="number" id="age" min="18" max="100" value="${state.answers.age || ''}" placeholder="e.g. 35" />
        </div>
        <div class="field">
          <label>Gender</label>
          <select id="gender">
            <option value="">Select...</option>
            <option ${state.answers.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option ${state.answers.gender === 'Female' ? 'selected' : ''}>Female</option>
            <option ${state.answers.gender === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Property address</label>
        <input type="text" id="address" value="${state.answers.address || ''}" placeholder="Start typing your address..." />
      </div>
    `,
    readInputs: () => {
      state.answers.age = +document.getElementById('age').value || null;
      state.answers.gender = document.getElementById('gender').value;
      state.answers.address = document.getElementById('address').value.trim();
    },
    validate: () => {
      if (!state.answers.age || state.answers.age < 18) return "Please enter a valid age.";
      if (!state.answers.gender) return "Please select gender.";
      if (!state.answers.address) return "Please enter your address.";
      return null;
    },
  },

  {
    id: "property",
    title: "Your property",
    subtitle: "Tell us about where you live.",
    render: () => `
      <div class="field">
        <label>Do you own or rent?</label>
        ${optionGrid("ownership", [
          { value: "Owner Occupier", label: "Own & live in" },
          { value: "Renting", label: "Renting" },
          { value: "Landlord", label: "Own & rent out" },
        ], "three-col")}
      </div>
      <div class="field">
        <label>Property type</label>
        ${optionGrid("buildingType", [
          { value: "Separate House", label: "Separate House" },
          { value: "Unit/Flat", label: "Unit / Flat" },
          { value: "Terrace", label: "Terrace / Townhouse" },
        ], "three-col")}
      </div>
      <div class="field">
        <label>Property use</label>
        ${optionGrid("propertyUse", [
          { value: "Private", label: "Private residence" },
          { value: "Home Business", label: "Home business" },
        ], "two-col")}
      </div>
    `,
    validate: () => {
      if (!state.answers.ownership) return "Select ownership status.";
      if (!state.answers.buildingType) return "Select a property type.";
      if (!state.answers.propertyUse) return "Select property use.";
      return null;
    },
  },

  {
    id: "propertyDetails",
    title: "Property details",
    subtitle: "A few more specifics.",
    skipIf: (a) => a.insuranceType === 'C' && a.ownership === 'Renting',
    render: () => `
      <div class="grid-2">
        <div class="field">
          <label>Year built</label>
          <input type="number" id="yearBuilt" min="1800" max="2026" value="${state.answers.yearBuilt || ''}" placeholder="e.g. 1995" />
        </div>
        <div class="field">
          <label>Number of bedrooms</label>
          <select id="bedrooms">
            <option value="">Select...</option>
            <option value="1" ${state.answers.bedrooms === '1' ? 'selected' : ''}>1</option>
            <option value="2" ${state.answers.bedrooms === '2' ? 'selected' : ''}>2</option>
            <option value="3" ${state.answers.bedrooms === '3' ? 'selected' : ''}>3 (Average)</option>
            <option value="4+" ${state.answers.bedrooms === '4+' ? 'selected' : ''}>4+ (Large)</option>
          </select>
        </div>
      </div>
      ${state.answers.buildingType === 'Unit/Flat' ? `
        <div class="field">
          <label>What floor is it on?</label>
          <input type="number" id="levelNumber" min="0" max="100" value="${state.answers.levelNumber || ''}" placeholder="0 for ground floor" />
        </div>
      ` : `
        <div class="field">
          <label>Number of storeys</label>
          ${optionGrid("storeys", [
            { value: "1", label: "1 storey" },
            { value: "2", label: "2 storeys" },
            { value: "3+", label: "3+ storeys" },
          ], "three-col")}
        </div>
      `}
      <div class="field">
        <label>Terrain / slope</label>
        ${optionGrid("slope", [
          { value: "Flat", label: "Flat" },
          { value: "Gentle", label: "Gentle" },
          { value: "Moderate", label: "Moderate" },
        ], "three-col")}
      </div>
    `,
    readInputs: () => {
      state.answers.yearBuilt = +document.getElementById('yearBuilt').value || null;
      state.answers.bedrooms = document.getElementById('bedrooms').value;
      const lvl = document.getElementById('levelNumber');
      if (lvl) state.answers.levelNumber = +lvl.value || 0;
    },
    validate: () => {
      if (!state.answers.yearBuilt) return "Enter year built.";
      if (!state.answers.bedrooms) return "Select number of bedrooms.";
      if (state.answers.buildingType !== 'Unit/Flat' && !state.answers.storeys) return "Select number of storeys.";
      if (!state.answers.slope) return "Select terrain.";
      return null;
    },
  },

  {
    id: "construction",
    title: "Construction details",
    subtitle: "Needed to assess building risk.",
    skipIf: (a) => a.insuranceType === 'C',
    render: () => `
      <div class="field">
        <label>Wall construction</label>
        ${optionGrid("construction", [
          { value: "Brick Veneer", label: "Brick Veneer" },
          { value: "Double Brick", label: "Double Brick" },
          { value: "Timber", label: "Timber" },
          { value: "Fibro", label: "Fibro" },
          { value: "Concrete", label: "Concrete" },
        ], "three-col")}
      </div>
      <div class="field">
        <label>Roof material</label>
        ${optionGrid("roofType", [
          { value: "Iron", label: "Iron" },
          { value: "Cement Tile", label: "Cement Tile" },
          { value: "Colourbond", label: "Colourbond" },
          { value: "Concrete", label: "Concrete" },
        ], "two-col")}
      </div>
      <div class="field">
        <label>Has the roof been replaced in the last 20 years?</label>
        <div class="yn-toggle" data-group="roofReplaced">
          <button class="option ${state.answers.roofReplaced === 'Yes' ? 'selected' : ''}" data-val="Yes">Yes</button>
          <button class="option ${state.answers.roofReplaced === 'No' ? 'selected' : ''}" data-val="No">No</button>
        </div>
      </div>
      ${state.answers.roofReplaced === 'Yes' ? `
        <div class="field">
          <label>Was it upgraded to a higher-grade material?</label>
          <div class="yn-toggle" data-group="roofUpgraded">
            <button class="option ${state.answers.roofUpgraded === 'Yes' ? 'selected' : ''}" data-val="Yes">Yes</button>
            <button class="option ${state.answers.roofUpgraded === 'No' ? 'selected' : ''}" data-val="No">No</button>
          </div>
        </div>
      ` : ''}
      <div class="grid-2">
        <div class="field">
          <label>Open-plan floor?</label>
          <div class="yn-toggle" data-group="openFloor">
            <button class="option ${state.answers.openFloor === 'Yes' ? 'selected' : ''}" data-val="Yes">Yes</button>
            <button class="option ${state.answers.openFloor === 'No' ? 'selected' : ''}" data-val="No">No</button>
          </div>
        </div>
        <div class="field">
          <label>Pool on the property?</label>
          <div class="yn-toggle" data-group="pool">
            <button class="option ${state.answers.pool === 'Yes' ? 'selected' : ''}" data-val="Yes">Yes</button>
            <button class="option ${state.answers.pool === 'No' ? 'selected' : ''}" data-val="No">No</button>
          </div>
        </div>
      </div>
    `,
    validate: () => {
      if (!state.answers.construction) return "Select wall construction.";
      if (!state.answers.roofType) return "Select roof material.";
      if (!state.answers.roofReplaced) return "Answer the roof replacement question.";
      if (state.answers.roofReplaced === 'Yes' && !state.answers.roofUpgraded) return "Answer the roof upgrade question.";
      if (!state.answers.openFloor) return "Answer the open-plan question.";
      if (!state.answers.pool) return "Answer the pool question.";
      return null;
    },
  },

  {
    id: "security",
    title: "Home security",
    subtitle: "Better security often means lower premiums.",
    render: () => `
      <div class="field">
        <label>Home alarm</label>
        ${optionGrid("alarm", [
          { value: "None", label: "No alarm" },
          { value: "Local", label: "Local alarm" },
          { value: "Monitored", label: "Monitored 24/7" },
        ], "three-col")}
      </div>
      <div class="grid-2">
        <div class="field">
          <label>Key-operated window locks?</label>
          <div class="yn-toggle" data-group="windowLocks">
            <button class="option ${state.answers.windowLocks === 'Yes' ? 'selected' : ''}" data-val="Yes">Yes</button>
            <button class="option ${state.answers.windowLocks === 'No' ? 'selected' : ''}" data-val="No">No</button>
          </div>
        </div>
        <div class="field">
          <label>Deadlocks on external doors?</label>
          <div class="yn-toggle" data-group="deadLocks">
            <button class="option ${state.answers.deadLocks === 'Yes' ? 'selected' : ''}" data-val="Yes">Yes</button>
            <button class="option ${state.answers.deadLocks === 'No' ? 'selected' : ''}" data-val="No">No</button>
          </div>
        </div>
        <div class="field">
          <label>Roller door on garage?</label>
          <div class="yn-toggle" data-group="rollerDoor">
            <button class="option ${state.answers.rollerDoor === 'Yes' ? 'selected' : ''}" data-val="Yes">Yes</button>
            <button class="option ${state.answers.rollerDoor === 'No' ? 'selected' : ''}" data-val="No">No</button>
          </div>
        </div>
        <div class="field">
          <label>Window protection (bars/shutters)?</label>
          <div class="yn-toggle" data-group="windowProtection">
            <button class="option ${state.answers.windowProtection === 'Yes' ? 'selected' : ''}" data-val="Yes">Yes</button>
            <button class="option ${state.answers.windowProtection === 'No' ? 'selected' : ''}" data-val="No">No</button>
          </div>
        </div>
      </div>
    `,
    validate: () => {
      const required = ['alarm', 'windowLocks', 'deadLocks', 'rollerDoor', 'windowProtection'];
      for (const k of required) if (!state.answers[k]) return "Please answer every security question.";
      return null;
    },
    onNext: () => {
      const count = ['windowLocks', 'deadLocks', 'rollerDoor', 'windowProtection']
        .filter(k => state.answers[k] === 'Yes').length;
      if (state.answers.alarm === 'Monitored' && count >= 2) state.answers.securityLevel = 'Home';
      else if (state.answers.alarm !== 'None' || count >= 2) state.answers.securityLevel = 'Basic';
      else state.answers.securityLevel = 'None';
    },
  },

  {
    id: "cover",
    title: "Cover amounts",
    subtitle: "How much would it cost to rebuild / replace everything?",
    render: () => {
      const bedSum = { '1': 400000, '2': 550000, '3': 700000, '4+': 900000 }[state.answers.bedrooms] || 600000;
      const contentsSum = { '1': 30000, '2': 50000, '3': 75000, '4+': 110000 }[state.answers.bedrooms] || 60000;
      if (state.answers.buildingSum == null && state.answers.insuranceType !== 'C') state.answers.buildingSum = bedSum;
      if (state.answers.contentsSum == null && state.answers.insuranceType !== 'B') state.answers.contentsSum = contentsSum;
      return `
        ${state.answers.insuranceType !== 'C' ? `
          <div class="slider-group">
            <label>Building sum insured: <span class="value">$${formatNum(state.answers.buildingSum)}</span></label>
            <input type="range" id="buildingSum" min="100000" max="2000000" step="10000" value="${state.answers.buildingSum}" />
          </div>
        ` : ''}
        ${state.answers.insuranceType !== 'B' ? `
          <div class="slider-group">
            <label>Contents sum insured: <span class="value">$${formatNum(state.answers.contentsSum)}</span></label>
            <input type="range" id="contentsSum" min="10000" max="300000" step="5000" value="${state.answers.contentsSum}" />
          </div>
        ` : ''}
        <div class="conditional">
          💡 Suggested amounts are based on your bedrooms. Adjust as needed.
        </div>
      `;
    },
    afterRender: () => {
      const b = document.getElementById('buildingSum');
      const c = document.getElementById('contentsSum');
      if (b) b.addEventListener('input', e => {
        state.answers.buildingSum = +e.target.value;
        e.target.previousElementSibling.querySelector('.value').textContent = '$' + formatNum(+e.target.value);
      });
      if (c) c.addEventListener('input', e => {
        state.answers.contentsSum = +e.target.value;
        e.target.previousElementSibling.querySelector('.value').textContent = '$' + formatNum(+e.target.value);
      });
    },
    validate: () => null,
  },

  {
    id: "claims",
    title: "Claims history",
    subtitle: "Your past insurance and any claims.",
    render: () => `
      <div class="field">
        <label>Previous insurer</label>
        <select id="previousInsurer">
          <option value="">Select...</option>
          ${['Not Insured', 'AAMI', 'ALLIANZ', 'APIA', 'CGU', 'COMMINSURE', 'NRMA', 'RAA', 'RAC', 'RACT', 'RACV', 'SUNCORP', 'YOUI', 'OTHER']
            .map(n => `<option ${state.answers.previousInsurer === n ? 'selected' : ''}>${n}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Years continuously insured</label>
        <input type="number" id="yearsInsured" min="0" max="50" value="${state.answers.yearsInsured ?? ''}" placeholder="e.g. 5" />
      </div>
      <div class="field">
        <label>Any claims in the last 5 years?</label>
        <div class="yn-toggle" data-group="hasClaim">
          <button class="option ${state.answers.hasClaim === 'Yes' ? 'selected' : ''}" data-val="Yes">Yes</button>
          <button class="option ${state.answers.hasClaim === 'No' ? 'selected' : ''}" data-val="No">No</button>
        </div>
      </div>
      ${state.answers.hasClaim === 'Yes' ? `
        <div class="field">
          <label>Claim type</label>
          ${optionGrid("claimType", [
            { value: "Storm", label: "Storm" },
            { value: "Fire", label: "Fire" },
            { value: "Water Damage", label: "Water" },
            { value: "Theft", label: "Theft" },
            { value: "Other", label: "Other" },
          ], "three-col")}
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Claim amount ($)</label>
            <input type="number" id="claimAmount" min="0" value="${state.answers.claimAmount || ''}" placeholder="e.g. 12000" />
          </div>
          <div class="field">
            <label>Months since claim</label>
            <input type="number" id="monthsSinceClaim" min="0" max="60" value="${state.answers.monthsSinceClaim || ''}" placeholder="e.g. 14" />
          </div>
        </div>
      ` : ''}
    `,
    readInputs: () => {
      state.answers.previousInsurer = document.getElementById('previousInsurer').value;
      state.answers.yearsInsured = +document.getElementById('yearsInsured').value || 0;
      const amt = document.getElementById('claimAmount');
      const mo = document.getElementById('monthsSinceClaim');
      if (amt) state.answers.claimAmount = +amt.value || 0;
      if (mo) state.answers.monthsSinceClaim = +mo.value || 0;
    },
    validate: () => {
      if (!state.answers.previousInsurer) return "Select a previous insurer.";
      if (state.answers.yearsInsured == null || state.answers.yearsInsured === '') return "Enter years insured.";
      if (!state.answers.hasClaim) return "Answer the claims question.";
      if (state.answers.hasClaim === 'Yes') {
        if (!state.answers.claimType) return "Select claim type.";
        if (!state.answers.claimAmount) return "Enter claim amount.";
        if (!state.answers.monthsSinceClaim) return "Enter months since claim.";
      }
      return null;
    },
  },

  {
    id: "results",
    title: "Your matched policies",
    subtitle: "Based on your answers, here are the products you're eligible for.",
    render: () => renderHomeResults(),
    validate: () => null,
    isLast: true,
  },
];

// ========== CAR insurance steps ==========
const AGE_BRACKET_TO_PERSONA = {
  '18-20': 20,
  '20-25': 25,
  '25-30': 30,
  '30-40': 40,
  '40-50': 50,
  '50-60': 60,
  '>60': 65,
};

const TIP_PRICE_SCORE = "You will be shown a price score based on a sample of quotes we collect. While this is not a 1:1 representation of the price you get, our Price Scores aim to give you a rough estimation of how expensive a product might be for you.";
const TIP_AGE = "We collect quotes for male and female 20, 25, 30, 40, 50, 60 and 65 year olds. Based on the age bracket you select, a price score will be shown to you based on the age that closest matches your age bracket range. For example, if you select 20-25, you will be shown a price score that reflects the profile of a 25 year old driver.";
const TIP_CAR_TYPE = "We collect quotes for a 2020 Toyota Corolla sedan and Kia SUV. Based on your selection, you will be shown a Price Score that closest reflects your car type.";
const TIP_PRIORITY = "Based on your selection, our Finder Score will upweight the relevant selection between Price and Features, with Comprehensiveness weighting both equally. You will be shown a Price Score, based on an average quote from personas that reflect your selections, a Feature Score that shows what each product covers, and an overall Finder Score.";

const carSteps = [
  {
    id: "coverType",
    title: "What level of car cover do you need?",
    subtitle: "Different products cover different risks.",
    tip: TIP_PRICE_SCORE,
    render: () => optionGrid("coverType", [
      { value: "Comprehensive", icon: "\ud83d\udee1\ufe0f", label: "Comprehensive", desc: "Covers your car + others' property" },
      { value: "Third Party Fire & Theft", icon: "\ud83d\udd25", label: "Third Party Fire & Theft", desc: "Others' property + fire/theft" },
      { value: "Third Party", icon: "\ud83d\ude97", label: "Third Party Property", desc: "Only damage to other vehicles" },
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
      { value: "Small car", icon: "\ud83d\ude97", label: "Small car", desc: "Hatchback, sedan" },
      { value: "Large car", icon: "\ud83d\ude99", label: "Large car", desc: "SUV, 4WD" },
    ], "two-col"),
    validate: () => state.answers.carType ? null : "Please select a car type.",
  },

  {
    id: "priority",
    title: "What's most important to you?",
    subtitle: "We'll weight your Finder Score accordingly.",
    tip: TIP_PRIORITY,
    render: () => optionGrid("priority", [
      { value: "Price", icon: "\ud83d\udcb0", label: "Price", desc: "I want the cheapest" },
      { value: "Features", icon: "\ud83d\udccb", label: "Features", desc: "I want the most cover" },
      { value: "Comprehensiveness", icon: "\u2696\ufe0f", label: "Comprehensiveness", desc: "Balance of both" },
    ], "three-col"),
    validate: () => state.answers.priority ? null : "Please select a priority.",
  },

  {
    id: "results",
    title: "Your matched car policies",
    subtitle: "Compare scores across our partners.",
    render: () => renderCarResults(),
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

function formatNum(n) {
  return (n || 0).toLocaleString();
}

// Map a sorted list of insurers (cheapest first) to a score between 9.9 and 5.0
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

// ========== HOME LITE steps ==========
const homeLiteSteps = [
  {
    id: "intent",
    title: "What would you like to protect?",
    subtitle: "Quick quote — we'll ask just the essentials.",
    render: () => optionGrid("insuranceType", [
      { value: "B", icon: "🏠", label: "Building only", desc: "The structure of your home" },
      { value: "C", icon: "📦", label: "Contents only", desc: "Your belongings inside" },
      { value: "H", icon: "🏡", label: "Home (Building + Contents)", desc: "Complete cover" },
    ]),
    validate: () => state.answers.insuranceType ? null : "Please pick an option to continue.",
  },
  {
    id: "about",
    title: "A bit about you",
    subtitle: "",
    render: () => `
      <div class="grid-2">
        <div class="field">
          <label>Age</label>
          <input type="number" id="age" min="18" max="100" value="${state.answers.age || ''}" placeholder="e.g. 35" />
        </div>
        <div class="field">
          <label>Gender</label>
          <select id="gender">
            <option value="">Select...</option>
            <option ${state.answers.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option ${state.answers.gender === 'Female' ? 'selected' : ''}>Female</option>
            <option ${state.answers.gender === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Property address</label>
        <input type="text" id="address" value="${state.answers.address || ''}" placeholder="Start typing your address..." />
      </div>
    `,
    readInputs: () => {
      state.answers.age = +document.getElementById('age').value || null;
      state.answers.gender = document.getElementById('gender').value;
      state.answers.address = document.getElementById('address').value.trim();
    },
    validate: () => {
      if (!state.answers.age || state.answers.age < 18) return "Please enter a valid age.";
      if (!state.answers.gender) return "Please select gender.";
      if (!state.answers.address) return "Please enter your address.";
      return null;
    },
  },
  {
    id: "ownershipClaims",
    title: "A couple more quick questions",
    subtitle: "These two have the biggest impact on your price.",
    render: () => `
      <div class="field">
        <label>Do you own or rent the property?</label>
        ${optionGrid("ownership", [
          { value: "Owner Occupier", label: "Own & live in" },
          { value: "Renting", label: "Renting" },
          { value: "Landlord", label: "Own & rent out" },
        ], "three-col")}
      </div>
      <div class="field">
        <label>Any home insurance claims in the last 5 years?</label>
        <div class="yn-toggle" data-group="hasClaim">
          <button class="option ${state.answers.hasClaim === 'Yes' ? 'selected' : ''}" data-val="Yes">Yes</button>
          <button class="option ${state.answers.hasClaim === 'No' ? 'selected' : ''}" data-val="No">No</button>
        </div>
      </div>
    `,
    validate: () => {
      if (!state.answers.ownership) return "Select ownership status.";
      if (!state.answers.hasClaim) return "Answer the claims question.";
      return null;
    },
  },
  {
    id: "results",
    title: "Your estimated policies",
    subtitle: "Approximate premiums based on limited info. Finalise a quote with the full quiz.",
    render: () => renderHomeResults({ lite: true }),
    validate: () => null,
    isLast: true,
  },
];

// ========== CAR LITE steps ==========
const carLiteSteps = [
  {
    id: "coverType",
    title: "What level of car cover do you need?",
    subtitle: "Quick quote — we'll ask just the essentials.",
    render: () => optionGrid("coverType", [
      { value: "Comprehensive", icon: "🛡️", label: "Comprehensive", desc: "Covers your car + others' property" },
      { value: "Third Party Fire & Theft", icon: "🔥", label: "Third Party Fire & Theft", desc: "Others' property + fire/theft" },
      { value: "Third Party", icon: "🚗", label: "Third Party Property", desc: "Only damage to other vehicles" },
    ]),
    validate: () => state.answers.coverType ? null : "Please pick a cover type.",
  },
  {
    id: "about",
    title: "A bit about you",
    subtitle: "",
    render: () => `
      <div class="grid-2">
        <div class="field">
          <label>Age</label>
          <input type="number" id="age" min="16" max="100" value="${state.answers.age || ''}" placeholder="e.g. 35" />
        </div>
        <div class="field">
          <label>Gender</label>
          <select id="gender">
            <option value="">Select...</option>
            <option ${state.answers.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option ${state.answers.gender === 'Female' ? 'selected' : ''}>Female</option>
            <option ${state.answers.gender === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Address where car is kept</label>
        <input type="text" id="address" value="${state.answers.address || ''}" placeholder="Start typing your address..." />
      </div>
    `,
    readInputs: () => {
      state.answers.age = +document.getElementById('age').value || null;
      state.answers.gender = document.getElementById('gender').value;
      state.answers.address = document.getElementById('address').value.trim();
    },
    validate: () => {
      if (!state.answers.age || state.answers.age < 16) return "Please enter a valid age.";
      if (!state.answers.gender) return "Please select gender.";
      if (!state.answers.address) return "Please enter your address.";
      return null;
    },
  },
  {
    id: "usageClaims",
    title: "A couple more quick questions",
    subtitle: "These two have the biggest impact on your price.",
    render: () => `
      <div class="field">
        <label>What do you use the car for?</label>
        ${optionGrid("carUsage", [
          { value: "Private", label: "Private use only" },
          { value: "Business", label: "Business / commuting" },
          { value: "Courier", label: "Courier / rideshare" },
        ], "three-col")}
      </div>
      <div class="field">
        <label>Any claims or incidents in the last 3 years?</label>
        ${optionGrid("claimType", [
          { value: "No Claims", label: "No claims" },
          { value: "At fault", label: "At-fault" },
          { value: "Not at fault", label: "Not at fault" },
        ], "three-col")}
      </div>
    `,
    validate: () => {
      if (!state.answers.carUsage) return "Select car usage.";
      if (!state.answers.claimType) return "Answer the claims question.";
      return null;
    },
    onNext: () => {
      // Assume a recent at-fault claim in Lite mode so eligibility rules still apply
      if (state.answers.claimType === 'At fault' && !state.answers.monthsSinceClaim) {
        state.answers.monthsSinceClaim = 12;
      }
    },
  },
  {
    id: "results",
    title: "Your estimated car policies",
    subtitle: "Approximate premiums based on limited info. Finalise a quote with the full quiz.",
    render: () => renderCarLiteResults(),
    validate: () => null,
    isLast: true,
  },
];

function currentSteps() {
  switch (state.product) {
    case 'car': return carSteps;
    case 'home-lite': return homeLiteSteps;
    case 'car-lite': return carLiteSteps;
    default: return homeSteps;
  }
}

function activeSteps() {
  return currentSteps().filter(s => !s.skipIf || !s.skipIf(state.answers));
}

// ========== Results: HOME ==========
const homeInsurers = [
  { name: "AAMI", basePrice: 1200, excludes: { fibro: false, homeBusiness: true, unrepairedRoof: true } },
  { name: "Allianz", basePrice: 1350, excludes: { fibro: true, homeBusiness: false, unrepairedRoof: false } },
  { name: "NRMA", basePrice: 1280, excludes: { fibro: false, homeBusiness: false, unrepairedRoof: true } },
  { name: "Suncorp", basePrice: 1180, excludes: { fibro: false, homeBusiness: true, unrepairedRoof: false } },
  { name: "Budget Direct", basePrice: 980, excludes: { fibro: true, homeBusiness: true, unrepairedRoof: true } },
  { name: "Youi", basePrice: 1320, excludes: { fibro: false, homeBusiness: false, unrepairedRoof: false } },
  { name: "RACV", basePrice: 1250, excludes: { fibro: false, homeBusiness: true, unrepairedRoof: false } },
  { name: "CGU", basePrice: 1400, excludes: { fibro: true, homeBusiness: false, unrepairedRoof: false } },
];

function renderHomeResults(opts = {}) {
  const a = state.answers;
  const lite = !!opts.lite;
  const isFibro = a.construction === 'Fibro';
  const isHomeBiz = a.propertyUse === 'Home Business';
  const oldUnrepairedRoof = a.yearBuilt && (2026 - a.yearBuilt) > 30 && a.roofReplaced === 'No';
  const bigRecentClaim = a.hasClaim === 'Yes' && (a.claimAmount || 0) > 50000 && (a.monthsSinceClaim || 0) < 24;

  const eligible = homeInsurers.filter(i => {
    if (isFibro && i.excludes.fibro) return false;
    if (isHomeBiz && i.excludes.homeBusiness) return false;
    if (oldUnrepairedRoof && i.excludes.unrepairedRoof) return false;
    if (bigRecentClaim && i.name === 'Budget Direct') return false;
    return true;
  });

  const priced = assignScores(eligible.map(i => ({
    ...i,
    price: calcHomePremium(i.basePrice, a),
  })).sort((x, y) => x.price - y.price));

  const typeLabel = { B: 'Building only', C: 'Contents only', H: 'Home (Building + Contents)' }[a.insuranceType];

  let summary = lite ? `
    <div class="results-summary">
      <strong>${typeLabel}</strong> · ${a.age}y/o ${a.gender}<br>
      ${a.address}
    </div>
  ` : `
    <div class="results-summary">
      <strong>${typeLabel}</strong> · ${a.buildingType} · ${a.ownership}<br>
      Security: <strong>${a.securityLevel || 'N/A'}</strong>
      ${a.insuranceType !== 'C' ? ` · Building sum: <strong>$${formatNum(a.buildingSum)}</strong>` : ''}
      ${a.insuranceType !== 'B' ? ` · Contents sum: <strong>$${formatNum(a.contentsSum)}</strong>` : ''}
    </div>
  `;

  if (!priced.length) {
    return summary + `<div class="conditional">
      Unfortunately none of our partners match your profile — please contact our team for a tailored quote.
    </div>`;
  }

  const cards = priced.map((p, idx) => `
    <div class="insurer-card">
      <div class="insurer-left">
        <div class="insurer-name">${p.name}</div>
        <div class="insurer-meta">${typeLabel}</div>
        <span class="match-badge ${idx === 0 ? '' : 'good'}">${idx === 0 ? 'Best match' : 'Eligible'}</span>
      </div>
      <div class="insurer-price">
        <div class="score-amount">${p.score.toFixed(1)}</div>
        <div class="score-label">Finder Score</div>
      </div>
    </div>
  `).join('');

  const notes = [];
  if (lite) notes.push("Estimate only — complete the full quiz for an accurate Finder Score.");
  if (isFibro) notes.push("Some insurers exclude fibro construction — filtered accordingly.");
  if (isHomeBiz) notes.push("Home business filters applied.");
  if (oldUnrepairedRoof) notes.push("Older unrepaired roof — limited eligibility.");
  if (bigRecentClaim) notes.push("Recent large claim may affect pricing.");

  return summary + cards + (notes.length ? `<div class="conditional">⚠️ ${notes.join(' ')}</div>` : '');
}

function calcHomePremium(base, a) {
  let p = base;
  if (a.insuranceType === 'H') p *= 1.4;
  if (a.insuranceType === 'C') p *= 0.5;
  // Fall back to bedroom-based default sums when not provided (Lite flow)
  const buildingSum = a.buildingSum || 650000;
  const contentsSum = a.contentsSum || 60000;
  if (a.insuranceType !== 'C') p += buildingSum * 0.0008;
  if (a.insuranceType !== 'B') p += contentsSum * 0.004;
  if (a.securityLevel === 'Home') p *= 0.88;
  else if (a.securityLevel === 'None') p *= 1.12;
  if (a.pool === 'Yes') p *= 1.08;
  if (a.construction === 'Fibro') p *= 1.15;
  if (a.slope === 'Moderate') p *= 1.05;
  if (a.hasClaim === 'Yes') p *= 1.15;
  if ((a.yearsInsured || 0) > 5) p *= 0.95;
  if (a.age && a.age > 50) p *= 0.95;
  return Math.round(p);
}

// ========== Results: CAR ==========
const carInsurers = [
  { name: "AAMI", basePrice: 950, minAge: 21, featureScore: 8.7, excludesCourier: false, excludesAtFault: false },
  { name: "NRMA", basePrice: 990, minAge: 21, featureScore: 9.1, excludesCourier: true, excludesAtFault: false },
  { name: "Allianz", basePrice: 1050, minAge: 25, featureScore: 8.9, excludesCourier: false, excludesAtFault: false },
  { name: "Budget Direct", basePrice: 780, minAge: 25, featureScore: 6.8, excludesCourier: true, excludesAtFault: true },
  { name: "Bingle", basePrice: 720, minAge: 21, featureScore: 5.9, excludesCourier: true, excludesAtFault: true },
  { name: "Youi", basePrice: 880, minAge: 18, featureScore: 8.4, excludesCourier: false, excludesAtFault: false },
  { name: "RACV", basePrice: 920, minAge: 21, featureScore: 8.6, excludesCourier: false, excludesAtFault: false },
  { name: "Suncorp", basePrice: 900, minAge: 21, featureScore: 8.2, excludesCourier: true, excludesAtFault: false },
];

// New full Car Insurance results: Price Score, Feature Score, Finder Score
function renderCarResults() {
  const a = state.answers;
  const personaAge = AGE_BRACKET_TO_PERSONA[a.ageBracket] || 30;

  const eligible = carInsurers.filter(i => personaAge >= i.minAge);

  const withPrice = eligible.map(i => ({
    ...i,
    price: calcCarPriceFull(i.basePrice, personaAge, a.gender, a.state, a.carType, a.coverType),
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

  const table = `
    <div class="results-table">
      <div class="results-row header-row">
        <div>Brand</div>
        <div>Price Score</div>
        <div>Feature Score</div>
        <div>Finder Score</div>
      </div>
      ${rows}
    </div>
  `;

  return summary + table;
}

function calcCarPriceFull(base, personaAge, gender, stateCode, carType, coverType) {
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

// Legacy results renderer for the Lite flow (which still asks age/usage/claims)
function renderCarLiteResults() {
  const a = state.answers;
  const isCourier = a.carUsage === 'Courier';
  const recentAtFault = a.claimType === 'At fault' && (a.monthsSinceClaim || 0) < 24;

  const eligible = carInsurers.filter(i => {
    if (a.age < i.minAge) return false;
    if (isCourier && i.excludesCourier) return false;
    if (recentAtFault && i.excludesAtFault) return false;
    return true;
  });

  const priced = assignScores(eligible.map(i => ({
    ...i,
    price: calcCarPremium(i.basePrice, a),
  })).sort((x, y) => x.price - y.price));

  const coverLabel = a.coverType;

  const summary = `
    <div class="results-summary">
      <strong>${coverLabel}</strong> · ${a.age}y/o ${a.gender}<br>
      ${a.address}
    </div>
  `;

  if (!priced.length) {
    return summary + `<div class="conditional">
      Unfortunately none of our partners match your profile — please contact our team for a tailored quote.
    </div>`;
  }

  const cards = priced.map((p, idx) => `
    <div class="insurer-card">
      <div class="insurer-left">
        <div class="insurer-name">${p.name}</div>
        <div class="insurer-meta">${coverLabel}</div>
        <span class="match-badge ${idx === 0 ? '' : 'good'}">${idx === 0 ? 'Best match' : 'Eligible'}</span>
      </div>
      <div class="insurer-price">
        <div class="score-amount">${p.score.toFixed(1)}</div>
        <div class="score-label">Finder Score</div>
      </div>
    </div>
  `).join('');

  const notes = ["Estimate only — complete the full quiz for an accurate Finder Score."];
  if (a.age < 25) notes.push("Under-25 drivers attract a loading.");
  if (isCourier) notes.push("Courier/rideshare filters applied — some insurers excluded.");
  if (recentAtFault) notes.push("Recent at-fault claim affects eligibility and pricing.");

  return summary + cards + `<div class="conditional">⚠️ ${notes.join(' ')}</div>`;
}

function calcCarPremium(base, a) {
  let p = base;
  if (a.coverType === 'Third Party Fire & Theft') p *= 0.6;
  if (a.coverType === 'Third Party') p *= 0.35;
  // Fall back to a typical sum insured when not provided (Lite flow)
  const sumInsured = a.sumInsured || 18000;
  if (a.coverType !== 'Third Party') p += sumInsured * 0.015;
  if (a.age < 25) p *= 1.45;
  else if (a.age < 30) p *= 1.15;
  else if (a.age > 55) p *= 0.9;
  if (a.yearsLicensed != null && a.yearsLicensed < 3) p *= 1.25;
  else if (a.yearsLicensed != null && a.yearsLicensed > 10) p *= 0.92;
  if (a.hasSecondDriver === 'Yes' && a.secondDriverAge < 25) p *= 1.2;
  if (a.carUsage === 'Courier') p *= 1.35;
  else if (a.carUsage === 'Business') p *= 1.1;
  if (a.nightGarage === 'Garage') p *= 0.9;
  else if (a.nightGarage === 'Driveway') p *= 1.08;
  if (a.annualKm >= 20000) p *= 1.15;
  else if (a.annualKm <= 5000) p *= 0.9;
  if (a.claimType === 'At fault') p *= 1.35;
  else if (a.claimType === 'Not at fault') p *= 1.05;
  if ((a.yearsInsured || 0) > 5) p *= 0.92;
  if (a.lifeStage === 'Retired') p *= 0.88;
  return Math.round(p);
}

// ========== Home screen ==========
function renderHome() {
  const main = document.getElementById('main');
  main.innerHTML = `
    <h2>Which quote are you after?</h2>
    <p class="subtitle">Pick a product below. Lite versions ask fewer questions for a quick estimate.</p>
    <div class="product-grid">
      <button class="product-card" data-product="home">
        <div class="product-icon">🏡</div>
        <div class="product-name">Home Insurance</div>
        <div class="product-desc">Full quiz · ~8 steps</div>
      </button>
      <button class="product-card" data-product="car">
        <div class="product-icon">🚗</div>
        <div class="product-name">Car Insurance</div>
        <div class="product-desc">Full quiz · ~9 steps</div>
      </button>
      <button class="product-card lite" data-product="home-lite">
        <div class="product-icon">🏡</div>
        <div class="product-name">Home Insurance <span class="lite-badge">Lite</span></div>
        <div class="product-desc">Quick estimate · 4 steps</div>
      </button>
      <button class="product-card lite" data-product="car-lite">
        <div class="product-icon">🚗</div>
        <div class="product-name">Car Insurance <span class="lite-badge">Lite</span></div>
        <div class="product-desc">Quick estimate · 4 steps</div>
      </button>
    </div>
  `;

  main.querySelectorAll('.product-card').forEach(btn => {
    btn.addEventListener('click', () => {
      state.product = btn.dataset.product;
      state.screen = 'quiz';
      state.stepIndex = 0;
      state.answers = {};
      render();
    });
  });

  // Hide progress + footer + side tip on home
  document.querySelector('.progress-wrap').style.visibility = 'hidden';
  document.querySelector('.footer').style.display = 'none';
  document.getElementById('sideTip').classList.add('hidden');
}

// ========== Render engine ==========
function render() {
  if (state.screen === 'home') {
    renderHome();
    return;
  }

  document.querySelector('.progress-wrap').style.visibility = 'visible';
  document.querySelector('.footer').style.display = 'flex';

  const active = activeSteps();
  const step = active[state.stepIndex];
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

  main.querySelectorAll('.options, .yn-toggle').forEach(group => {
    const key = group.dataset.group;
    group.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => {
        state.answers[key] = btn.dataset.val;
        group.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        if (['roofReplaced', 'hasClaim', 'hasSecondDriver', 'carOwnership', 'claimType'].includes(key)) render();
      });
    });
  });

  if (step.afterRender) step.afterRender();

  document.getElementById('progressFill').style.width = ((state.stepIndex) / (active.length - 1) * 100) + '%';
  document.getElementById('progressText').textContent = `Step ${state.stepIndex + 1} of ${active.length}`;

  document.getElementById('backBtn').disabled = false; // always enabled in quiz so we can return home
  document.getElementById('backBtn').textContent = state.stepIndex === 0 ? '← Home' : 'Back';
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.style.display = step.isLast ? 'none' : 'inline-block';
  nextBtn.textContent = state.stepIndex === active.length - 2 ? 'Show Results' : 'Next';

  // On the results screen, swap Back for a "Start Over" button via existing back
  if (step.isLast) {
    document.getElementById('backBtn').textContent = '← Start Over';
  }
}

// ========== Event wiring ==========
document.getElementById('nextBtn').addEventListener('click', () => {
  if (state.screen !== 'quiz') return;
  const active = activeSteps();
  const step = active[state.stepIndex];

  if (step.readInputs) step.readInputs();
  const err = step.validate ? step.validate() : null;
  if (err) {
    document.getElementById('errorBox').innerHTML = `<div class="error-text">${err}</div>`;
    return;
  }
  if (step.onNext) step.onNext();
  state.stepIndex++;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('backBtn').addEventListener('click', () => {
  if (state.screen !== 'quiz') return;
  const active = activeSteps();
  const step = active[state.stepIndex];

  if (step.isLast || state.stepIndex === 0) {
    // Return to home screen
    state.screen = 'home';
    state.product = null;
    state.stepIndex = 0;
    state.answers = {};
    render();
    return;
  }
  state.stepIndex--;
  render();
});

render();
