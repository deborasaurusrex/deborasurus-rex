/*
 * ════════════════════════════════════════════════════════
 *  about-data.js  —  ALL PERSONAL INFO LIVES HERE
 * ════════════════════════════════════════════════════════
 *
 *  HOW TO EDIT PERSONAL INFO
 *  ──────────────────────────
 *  Find the section below (basic, family, education, etc.)
 *  and change the value string. Save the file and it
 *  updates automatically on next page load.
 *
 *  HOW TO ADD A NEW CATEGORY
 *  ──────────────────────────
 *  1. Add a new object to ABOUT_CATEGORIES below.
 *  2. Add a new button in the cat-grid inside index.html.
 *  3. Match the key in both places.
 * ════════════════════════════════════════════════════════
 */

/* ── Basic label/value rows used by most categories ── */
const ABOUT_CATEGORIES = {

  basic: {
    icon: '👤',
    title: 'Basic Information',
    type: 'rows',
    rows: [
      { label: 'Full name',   value: 'Deborah Kate P. Santiago' },
      { label: 'Goes by',     value: 'Kate, Deb, Deborah, Debibi, Debs, Katie' },
      { label: 'Age',         value: '18' },
      { label: 'Birthday',    value: 'February 19, 2008 🎂' },
      { label: 'Born in',     value: 'Barangka, Marikina City' },
      { label: 'Lives in',    value: 'Antipolo City' },
      { label: 'Nationality', value: 'Filipino 🇵🇭' },
      { label: 'Languages',   value: 'Tagalog, English' },
    ]
  },

  family: {
    icon: '👨‍👩‍👧',
    title: 'Family & Background',
    type: 'rows',
    rows: [
      { label: 'Siblings',   value: 'Only child 👑' },
      { label: 'Closest to', value: 'Everyone — close with the whole family' },
      { label: 'Childhood',  value: 'A mystery (she genuinely doesn\'t remember it)' },
    ]
  },

  education: {
    icon: '🎓',
    title: 'Education',
    type: 'rows',
    rows: [
      { label: 'Elementary',    value: 'Marikina Elementary School' },
      { label: 'High School',   value: 'Sta. Elena High School' },
      { label: 'University',    value: 'University of the Philippines (soon!) 🎉' },
      { label: 'Course',        value: 'BS Civil Engineering' },
      { label: 'Fave subject',  value: 'Recess — and also Trigonometry & Pre-Calculus 📐' },
      { label: 'Least fave',    value: 'Physics and Chemistry 😵' },
    ]
  },

  hobbies: {
    icon: '🎸',
    title: 'Hobbies & Interests',
    type: 'rows',
    rows: [
      { label: 'Hobbies',     value: 'Reading, playing the drums' },
      { label: 'Free time',   value: 'Songwriting, writing poems' },
      { label: 'Sport',       value: 'Taekwondo 🥋' },
      { label: 'Instruments', value: 'Drums 🥁, Guitar, Bass, a bit of Piano' },
      { label: 'Creates',     value: 'Writes, draws sometimes, sings — very lowkey about it' },
      { label: 'Reading',     value: 'Absolutely yes 📚' },
    ]
  },

  food: {
    icon: '🍗',
    title: 'Food & Drinks',
    type: 'rows',
    rows: [
      { label: 'Fave food',       value: '🐾 Chicken feet · 🍕 Pizza · 🍟 Fries', tags: true },
      { label: 'Fave drink',      value: '☕ Coffee · 🍵 Matcha', tags: true },
      { label: 'Dessert',         value: '🍦 Ice cream · 🍩 Donuts', tags: true },
      { label: 'Food she hates',  value: 'Raisins. No context needed.' },
    ]
  },

  entertainment: {
    icon: '🎬',
    title: 'Entertainment',
    type: 'rows',
    rows: [
      { label: 'Fave movie',   value: 'Red Notice 🎬' },
      { label: 'Fave show',    value: 'Avatar: The Last Airbender, High Potential 📺' },
      { label: 'Fave book',    value: 'Dork Diaries series 📖' },
      { label: 'Fave song',    value: '"Still God" by Genavieve Linkowski 🎵' },
      { label: 'Fave artist',  value: 'Genavieve Linkowski' },
      { label: 'Music genre',  value: 'Soft pop 🎶' },
      { label: 'Games',        value: 'Honor of Kings, Roblox, horror games with plot & multiple endings — anything that spikes adrenaline 🎮' },
    ]
  },

  misc: {
    icon: '🌈',
    title: 'Miscellaneous',
    type: 'rows',
    rows: [
      { label: 'Fave color',    value: 'Blue 💙' },
      { label: 'Fave animal',   value: 'Dinosaurs 🦕 (obviously)' },
      { label: 'Fave holiday',  value: 'Valentine\'s Day 💝' },
      { label: 'Fave place',    value: 'Somewhere with the least amount of people possible' },
      { label: 'Most-used app', value: 'Wattpad 📱' },
      { label: 'Fave heroes',   value: '⚡ Thor · 🕷️ Spider-Man', tags: true },
      { label: 'Dream car',     value: '🚗 Koenigsegg Agera RS Final Edition Thor' },
    ]
  },

  likesdislikes: {
    icon: '💚',
    title: 'Likes & Dislikes',
    type: 'twocol',
    likes: [
      'That she loves reading',
      'Reading & songwriting',
      'Music in all forms',
      'Quiet, low-people places',
    ],
    dislikes: [
      'Disrespect',
      'Her height (don\'t bring it up)',
      'A lot of things, really',
      'Raisins (this counts)',
    ]
  },

  social: {
    icon: '📱',
    title: 'Social Media',
    type: 'rows',
    note: 'Kate is very lowkey online. Don\'t expect a lot of posts.',
    rows: [
      { label: 'Most-used', value: 'Wattpad 📚 — that\'s basically her whole personality online' },
      { label: 'Gamer?',    value: 'Somewhat — plays when the game is worth it' },
      { label: 'Content?',  value: 'Doesn\'t create content. Purely a consumer. Very intentional.' },
    ]
  },

  rapidfire: {
    icon: '⚡',
    title: 'Rapid-Fire Questions',
    type: 'rapidfire',
    items: [
      { q: 'Coffee or tea?',               a: '☕ Coffee' },
      { q: 'Morning or night?',             a: '🌙 Night' },
      { q: 'Beach or mountains?',           a: '🏖️ Beach' },
      { q: 'Cats or dogs?',                 a: '🐶 Dogs' },
      { q: 'Sweet or savory?',              a: '🧂 Savory' },
      { q: 'Books or movies?',              a: '📚 Books' },
      { q: 'City or countryside?',          a: '🌾 Countryside' },
      { q: 'Introvert or extrovert?',       a: '🔀 Ambivert' },
      { q: 'Plan ahead or go with the flow?', a: '🌊 Go with the flow' },
      { q: 'Summer or rainy season?',       a: '🌧️ Rainy' },
    ]
  }

};

/* ─────────────────────────────────────────────────────────
   renderCatPanel(key)  —  builds HTML for a category panel
   Called by showCat() in app.js. Do not edit this.
──────────────────────────────────────────────────────────── */
function renderCatPanel(key) {
  const cat = ABOUT_CATEGORIES[key];
  if (!cat) return;
  const panel = document.getElementById('cat-' + key);
  if (!panel || panel.dataset.rendered) return;
  panel.dataset.rendered = '1';

  let inner = `<div class="cat-panel-title"><span>${cat.icon}</span> ${cat.title}</div>`;

  if (cat.type === 'rows') {
    if (cat.note) inner += `<p style="font-size:13px;color:var(--text2);margin-bottom:14px;line-height:1.6;">${cat.note}</p>`;
    inner += '<div class="info-rows">';
    for (const r of cat.rows) {
      const valHtml = r.tags
        ? `<span class="tag-list">${r.value.split(' · ').map(t => `<span class="tag">${t}</span>`).join('')}</span>`
        : r.value;
      inner += `<div class="info-row"><span class="info-label">${r.label}</span><span class="info-value">${valHtml}</span></div>`;
    }
    inner += '</div>';
  }

  if (cat.type === 'twocol') {
    inner += `<div class="two-col" style="margin-top:0;">
      <div>
        <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px;">Likes ✓</div>
        <ul class="loves-list">${cat.likes.map(l => `<li>${l}</li>`).join('')}</ul>
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;color:var(--accent3);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px;">Dislikes ✗</div>
        <ul class="hates-list">${cat.dislikes.map(d => `<li>${d}</li>`).join('')}</ul>
      </div>
    </div>`;
  }

  if (cat.type === 'rapidfire') {
    inner += `<div class="rapid-fire-grid">${cat.items.map(i =>
      `<div class="rf-item"><div class="rf-q">${i.q}</div><div class="rf-a">${i.a}</div></div>`
    ).join('')}</div>`;
  }

  panel.innerHTML = inner;
}
