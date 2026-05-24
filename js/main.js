// THEME TOGGLE
(function initThemeToggle(){
  const root = document.documentElement;
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  if(!toggles.length) return;

  const savedTheme = localStorage.getItem('spb-theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');

  function setTheme(theme){
    root.setAttribute('data-theme', theme);
    localStorage.setItem('spb-theme', theme);

    toggles.forEach(toggle=>{
      const isLight = theme === 'light';
      const label = isLight ? 'Switch to dark mode' : 'Switch to light mode';
      const text = toggle.querySelector('.theme-toggle-text');

      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('aria-pressed', String(isLight));
      if(text) text.textContent = isLight ? 'Light' : 'Dark';
    });
  }

  setTheme(initialTheme);

  toggles.forEach(toggle=>{
    toggle.addEventListener('click', ()=>{
      const nextTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      setTheme(nextTheme);
    });
  });
})();

// CURSOR - only on non-touch devices
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if(!isTouchDevice){
  
  let mx=0,my=0,tx=0,ty=0;
  
  setInterval(()=>{tx+=(mx-tx)*0.12;ty+=(my-ty)*0.12;cursorTrail.style.left=tx-18+'px';cursorTrail.style.top=ty-18+'px';},16);
  document.querySelectorAll('a,button,.service-card,.partner-card,.team-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>{cursor.style.transform='scale(2)';cursorTrail.style.transform='scale(0.5)';});
    el.addEventListener('mouseleave',()=>{cursor.style.transform='scale(1)';cursorTrail.style.transform='scale(1)';});
  });
}

// LOADER
setTimeout(()=>{document.getElementById('loader').classList.add('hidden');},2200);

// NAVBAR SCROLL
window.addEventListener('scroll',()=>{
  document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>80);
});

// ══════════════════════════════════════
// CINEMATIC HERO CANVAS + TEXT ANIMATION
// ══════════════════════════════════════
(function initHeroAnim(){
  // Canvas particle system
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('hero');

  function resizeCanvas(){
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const COLS = [[245,169,127],[255,255,255],[180,140,255]];
  const pts = [];
  for(let i=0;i<100;i++){
    const c = COLS[Math.floor(Math.random()*COLS.length)];
    pts.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*1.4+0.3,
      vx:(Math.random()-0.5)*0.25,
      vy:(Math.random()-0.5)*0.25,
      a: Math.random(),
      va:(Math.random()-0.5)*0.007,
      col:c
    });
  }

  let mx = canvas.width/2, my = canvas.height/2;
  hero.addEventListener('mousemove', e=>{
    const r = hero.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });

  function drawConnections(){
    for(let i=0;i<pts.length;i++){
      for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<100){
          ctx.beginPath();
          ctx.strokeStyle=`rgba(245,169,127,${0.1*(1-d/100)})`;
          ctx.lineWidth=0.5;
          ctx.moveTo(pts[i].x,pts[i].y);
          ctx.lineTo(pts[j].x,pts[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawConnections();
    pts.forEach(p=>{
      const dx=mx-p.x, dy=my-p.y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<130){p.vx+=dx/d*0.01;p.vy+=dy/d*0.01;}
      p.vx*=0.98;p.vy*=0.98;
      p.x+=p.vx;p.y+=p.vy;
      p.a+=p.va;
      if(p.a>1||p.a<0)p.va*=-1;
      if(p.x<0||p.x>canvas.width)p.vx*=-1;
      if(p.y<0||p.y>canvas.height)p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${p.col[0]},${p.col[1]},${p.col[2]},${p.a*0.75})`;
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  loop();

  // ── LETTER-BY-LETTER ANIMATION ──
  function splitChars(){
    const titleEl = document.getElementById('heroTitleText');
    // "SPB & Co." — split into individual characters
    const raw = titleEl.innerHTML; // "SPB &amp; Co."
    // Build character spans
    const decoded = 'SPB & Co.';
    let html = '';
    let delay = 0;
    for(let i=0; i<decoded.length; i++){
      const ch = decoded[i];
      const isAmp = ch === '&';
      const isSpace = ch === ' ';
      if(isSpace){
        html += '<span class="char" style="width:0.3em;display:inline-block;">&nbsp;</span>';
      } else {
        const cls = isAmp ? 'char char-amp' : 'char';
        html += `<span class="${cls}" style="animation-delay:${delay.toFixed(3)}s">${isAmp ? '&amp;' : ch}</span>`;
        delay += 0.07;
      }
    }
    titleEl.innerHTML = html;
    return delay;
  }

  function runAnimation(){
    const eyebrow = document.getElementById('heroEyebrow');
    const role = document.getElementById('heroRole');
    const subtitle = document.getElementById('heroSubtitle');
    const btns = document.getElementById('heroBtns');
    const shimmer = document.getElementById('heroShimmer');
    const scroll = document.getElementById('heroScroll');
    const titleEl = document.getElementById('heroTitle');

    // Reset
    eyebrow.style.opacity='0';
    eyebrow.style.transform='translateY(20px)';
    role.classList.remove('visible');
    subtitle.classList.remove('visible');
    btns.classList.remove('visible');
    shimmer.classList.remove('grow');
    scroll.style.opacity='0';

    // 1. Eyebrow fades in with letter-spacing expand
    setTimeout(()=>{
      eyebrow.style.transition='opacity 0.9s ease, transform 0.9s ease, letter-spacing 0.9s ease';
      eyebrow.style.opacity='1';
      eyebrow.style.transform='translateY(0)';
    }, 200);

    // 2. Split and animate letters
    const lastDelay = splitChars();
    titleEl.classList.add('hero-title-reveal');

    // 3. Shimmer bar
    setTimeout(()=>{
      shimmer.classList.add('grow');
    }, (lastDelay + 0.4) * 1000 + 200);

    // 4. Role / subtitle / btns
    setTimeout(()=>{ role.classList.add('visible'); }, (lastDelay + 0.5) * 1000 + 400);
    setTimeout(()=>{ subtitle.classList.add('visible'); subtitle.style.animationFillMode='forwards'; }, (lastDelay + 0.7) * 1000 + 600);
    setTimeout(()=>{ btns.classList.add('visible'); btns.style.animationFillMode='forwards'; }, (lastDelay + 0.9) * 1000 + 700);
    setTimeout(()=>{ scroll.style.transition='opacity 1s ease'; scroll.style.opacity='1'; }, (lastDelay + 1.1) * 1000 + 900);
  }

  // Run on load
  runAnimation();
})();

// PARTICLES
const pContainer=document.getElementById('particles');
for(let i=0;i<25;i++){
  const p=document.createElement('div');
  p.className='particle';
  p.style.left=Math.random()*100+'%';
  p.style.animationDuration=(8+Math.random()*12)+'s';
  p.style.animationDelay=(Math.random()*10)+'s';
  p.style.opacity=Math.random()*0.7+0.3;
  pContainer.appendChild(p);
}

// MOBILE NAV
function openMobileNav(){document.getElementById('mobileNav').classList.add('open');}
function closeMobileNav(){document.getElementById('mobileNav').classList.remove('open');}

// SCROLL REVEAL
const revealEls=document.querySelectorAll('.reveal');
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});
},{threshold:0.1});
revealEls.forEach(el=>observer.observe(el));

// COUNTERS - re-animate every time section enters viewport
const counters=document.querySelectorAll('.counter-num');
const counterObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const el = e.target;
      const target=+el.dataset.target;
      const duration=2000;
      const step=target/duration*16;
      let current=0;
      // Clear any previous interval stored
      if(el._counterTimer) clearInterval(el._counterTimer);
      el._counterTimer=setInterval(()=>{
        current=Math.min(current+step,target);
        el.textContent=Math.floor(current);
        el.classList.add('counting');
        setTimeout(()=>el.classList.remove('counting'),80);
        if(current>=target){clearInterval(el._counterTimer);el._counterTimer=null;}
      },16);
    }
  });
},{threshold:0.5});
counters.forEach(c=>counterObserver.observe(c));

// MVW TABS
const mvwData={
  mission:'To deliver world-class cost accounting, audit, and advisory services that empower businesses to operate with financial clarity, regulatory compliance, and strategic advantage across all sectors.',
  vision:'To be the most trusted and preferred Cost Accounting firm in India, recognized for our integrity, expertise, and transformative impact on client businesses and the broader economy.',
  values:'We are guided by Integrity in every engagement, Excellence in every deliverable, Client-centricity in every interaction, and Innovation in every solution we bring to the table.'
};
function showMVW(key,btn){
  document.querySelectorAll('.mvw-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('mvwContent').textContent=mvwData[key];
}

// FAQ
function toggleFaq(btn){
  const item=btn.closest('.faq-item');
  const wasOpen=item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
  if(!wasOpen)item.classList.add('open');
}

// TESTIMONIALS
const testimonials=[
  {name:'Rajat Gupta',company:'MD, Gupta Polymers Ltd.',text:'SPB & Co. handled our Cost Audit with exceptional professionalism. Their insights into our costing structure helped us reduce production costs significantly.',stars:5,bg:'#f5a97f',init:'RG'},
  {name:'Sunita Agarwal',company:'CFO, Agarwal Pharma Pvt. Ltd.',text:'Outstanding GST compliance support. Their team is always proactive, and we have never faced a single default in three years of working together.',stars:5,bg:'#6b21a8',init:'SA'},
  {name:'Pradeep Singh',company:'Director, Singh Infratech',text:'Their CMA data preparation for our project loan was meticulous and got us the CC limit we needed within the expected timeline.',stars:5,bg:'#1e3a6e',init:'PS'},
  {name:'Meera Nair',company:'CEO, Nair Textiles',text:'Prompt, accurate and highly professional. SPB & Co. manages all our TDS and income tax matters and we have zero compliance concerns.',stars:5,bg:'#2a5c2a',init:'MN'},
  {name:'Ankit Bajaj',company:'Owner, Bajaj Auto Parts',text:'The internal audit by SPB & Co. identified several inefficiencies in our inventory management. Savings of ₹15 lakhs in the first year itself!',stars:5,bg:'#5c2a2a',init:'AB'},
  {name:'Deepak Khanna',company:'CFO, Khanna FMCG',text:'Their CAS-4 certification and product costing analysis has been instrumental in our pricing strategy and customs compliance.',stars:5,bg:'#2a4a5c',init:'DK'},
  {name:'Pooja Mishra',company:'Manager, Real Estate Firm',text:'We engaged SPB & Co. for GST Audit and they resolved several contentious issues with the authorities. Highly reliable team.',stars:5,bg:'#5c4a2a',init:'PM'},
  {name:'Vikas Choudhary',company:'Director, Choudhary Logistics',text:'From stock audits to management audit, SPB & Co. has been our go-to compliance partner for 6 years. Absolutely trustworthy.',stars:5,bg:'#1a2a4c',init:'VC'},
  {name:'Nisha Verma',company:'Director Finance, Verma Steel Ltd.',text:'SPB & Co. performed our first statutory Cost Audit flawlessly. The team was thorough, professional, and delivered well ahead of schedule. Highly recommend!',stars:5,bg:'#3a1a5c',init:'NV'},
  {name:'Suresh Kapoor',company:'CEO, Kapoor Chemicals Pvt. Ltd.',text:'Their expertise in product costing and CAS compliance gave us clarity we never had before. We restructured our pricing model based on their analysis and saw margin improvement.',stars:5,bg:'#1a4a3c',init:'SK'},
  {name:'Aarti Sharma',company:'CFO, Sharma Agro Industries',text:'Outstanding support during our GST assessment. SPB & Co. handled all department queries with confidence. Their documentation was airtight and we got full relief.',stars:5,bg:'#4a2a1a',init:'AS'},
  {name:'Mohit Tandon',company:'MD, Tandon Electricals',text:'We rely on SPB & Co. for our entire compliance calendar — GST, TDS, Cost Audit. Zero delays, zero surprises. They have truly become an extension of our finance team.',stars:5,bg:'#1a3a5c',init:'MT'},
  {name:'Ramesh Bhatia',company:'Director, Bhatia Cement Works',text:'SPB & Co. guided us through our first Cost Audit under the new rules. Their team was thorough and we cleared the audit without a single objection. Exceptional work.',stars:5,bg:'#2a4a1a',init:'RB'},
  {name:'Kavita Joshi',company:'CFO, Joshi Exports Pvt. Ltd.',text:'Our FEMA and GST compliance was a mess before SPB & Co. stepped in. In 6 months they cleaned up our records and now we sleep easy during audits.',stars:5,bg:'#4a1a3c',init:'KJ'},
  {name:'Sachin Malhotra',company:'MD, Malhotra Paper Mills',text:'Product costing analysis by SPB & Co. changed how we price our goods. We found we were underpricing 4 key SKUs. Margin went up 8% within one quarter.',stars:5,bg:'#1a3c3c',init:'SM'},
  {name:'Poonam Ahluwalia',company:'Finance Head, Ahluwalia Constructions',text:'From CMA data for our bank loan to IFC compliance — SPB & Co. is our one-stop compliance partner. The team is knowledgeable, responsive and very professional.',stars:5,bg:'#3c2a0a',init:'PA'},
  {name:'Tarun Rawat',company:'Proprietor, Rawat Agro Processors',text:'Got our term loan sanctioned in record time thanks to the detailed project report prepared by SPB & Co. The bank was impressed with the depth of analysis.',stars:5,bg:'#0a2a3c',init:'TR'},
  {name:'Sneha Gupta',company:'Director, Gupta Plastics Ltd.',text:'The internal audit they conducted flagged serious gaps in our procurement process. After implementing their recommendations, we saved nearly ₹8 lakhs in the first year.',stars:5,bg:'#3c1a0a',init:'SG'},
  {name:'Harish Banswal',company:'CEO, Banswal Steel Fabricators',text:'SPB & Co. has been managing our TDS and Income Tax compliance for 4 years. Not once have we faced a notice or delay. Total peace of mind.',stars:5,bg:'#1a2a3c',init:'HB'},
];

function buildTestimonials(){
  const marquee=document.getElementById('marquee');
  const doubled=[...testimonials,...testimonials];
  doubled.forEach(t=>{
    const card=document.createElement('div');
    card.className='testimonial-card';
    card.innerHTML=`
      <div class="testi-header">
        <div class="testi-avatar" style="background:${t.bg};color:white;">${t.init}</div>
        <div><div class="testi-name">${t.name}</div><div class="testi-company">${t.company}</div></div>
      </div>
      <div class="testi-stars">${'★'.repeat(t.stars)}</div>
      <div class="testi-text">"${t.text}"</div>
      <div class="google-badge">🔵 Google Review · Verified</div>
    `;
    marquee.appendChild(card);
  });
}
buildTestimonials();

// SEND TO WHATSAPP
function sendToWhatsApp() {
  const name = document.getElementById('fname').value.trim();
  const phone = document.getElementById('fphone').value.trim();
  const email = document.getElementById('femail').value.trim();
  const service = document.getElementById('fservice').value;
  const dateValue = document.getElementById('fdate').value;
  const message = document.getElementById('fmessage').value.trim();

  if (!name || !phone || !service) {
    alert('Please enter your name, phone number, and the type of consultancy you need.');
    return;
  }

  const date = dateValue ? new Date(dateValue).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Not specified';

  let text = '*New Consultation Request – SPB & Co.*\n\n';
  text += `*Name:* ${name}\n`;
  text += `*Phone:* ${phone}\n`;
  if (email) text += `*Email:* ${email}\n`;
  text += `*Type of Consultancy:* ${service}\n`;
  text += `*Preferred Date:* ${date}\n`;
  text += `*Message:* ${message || 'No additional message provided.'}`;

  const wa_number = '919716719137'; // SPB & Co. WhatsApp number
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${wa_number}?text=${encodedText}`;

  const btn = document.getElementById('sendBtn');
  btn.textContent = 'Opening WhatsApp...';
  btn.style.background = '#25d366';
  btn.disabled = true;

  const opened = window.open(url, '_blank');
  if (!opened) {
    window.location.href = url;
  }

  setTimeout(() => {
    document.getElementById('contactFormContainer').style.display = 'none';
    document.getElementById('formSuccess').classList.add('show');
    btn.textContent = 'Send Message →';
    btn.style.background = '';
    btn.disabled = false;
  }, 600);
}

function resetForm() {
  document.getElementById('fname').value = '';
  document.getElementById('fphone').value = '';
  document.getElementById('femail').value = '';
  document.getElementById('fservice').value = '';
  document.getElementById('fdate').value = '';
  document.getElementById('fmessage').value = '';
  document.getElementById('formSuccess').classList.remove('show');
  document.getElementById('contactFormContainer').style.display = 'block';
}

// STICKY CTA BAR — show after 5 seconds or 40% scroll
let ctaBarDismissed = false;
function showCtaBar() {
  return;
}
document.querySelectorAll('#sticky-cta-bar a').forEach(a => {
  a.addEventListener('click', () => {
    ctaBarDismissed = true;
    document.getElementById('sticky-cta-bar').classList.remove('visible');
  });
});

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();
    const target=document.querySelector(a.getAttribute('href'));
    if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
  });
});

// SHOWCASE TABS
function showTab(id, btn) {
  document.querySelectorAll('.showcase-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.showcase-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
}

// WHATSAPP POPUP
let waPopupShown = false;
let waPopupOpen = false;
function toggleWaPopup() {
  waPopupOpen ? closeWaPopup() : openWaPopup();
}
function openWaPopup() {
  document.getElementById('waPopupBubble').classList.add('show');
  document.querySelector('.wa-badge').style.display = 'none';
  waPopupOpen = true;
}
function closeWaPopup() {
  document.getElementById('waPopupBubble').classList.remove('show');
  waPopupOpen = false;
}
function openWaChat() {
  window.open('https://wa.me/919716719137?text=Namaste%20SPB%20%26%20Co.%2C%20mujhe%20aapki%20services%20ke%20baare%20mein%20jaankari%20chahiye.', '_blank');
  closeWaPopup();
}
// Auto WhatsApp popup disabled. The chat bubble opens only when clicked.
// Hide desktop float on mobile (bottom bar handles it)
if (window.innerWidth <= 768) {
  document.getElementById('waPopupOverlay').style.display = 'none';
}


// BLOG ARTICLES DATA
const blogArticles = {
  0: {
    emoji:'📋', bg:'linear-gradient(135deg,#0d1f3c,#1a1035)', tag:'Cost Audit', date:'May 2026', author:'SPB & Co.',
    title:'Cost Audit FY 2025-26: <em>New Thresholds, Deadlines & What\'s Changed</em> for Your Business',
    content:`
      <p>The Ministry of Corporate Affairs has revised the applicability framework for Cost Audit under the Companies (Cost Records and Audit) Rules. If you haven't checked your eligibility for FY 2025-26 yet, this is urgent.</p>
      <h4>Updated Applicability Thresholds</h4>
      <ul>
        <li><strong>Regulated sectors</strong> (cement, steel, pharma, telecom, power): Overall turnover ≥ ₹50 crore AND product-specific turnover ≥ ₹25 crore</li>
        <li><strong>Non-regulated sectors</strong>: Overall turnover ≥ ₹100 crore AND relevant product turnover ≥ ₹35 crore</li>
        <li>New sectors have been added to the regulated list — check if your industry classification has changed</li>
      </ul>
      <h4>Key Changes for FY 2025-26</h4>
      <p>The MCA has tightened the documentation requirements for Form CRA-1 (cost records) and introduced new disclosure fields in Form CRA-3 (audit report) relating to sustainability costs and ESG metrics. Cost Auditors must now sign off on these additional disclosures.</p>
      <div class="blog-article-highlight"><p>📅 <strong>Deadline Alert:</strong> CRA-2 (appointment intimation) must be filed within 30 days of the Annual General Meeting or 31st December, whichever is earlier. CRA-3 must be submitted to the board within 180 days of year end — i.e., by 27th September 2026 for FY ending 31st March 2026.</p></div>
      <h4>Penalties for Non-Compliance</h4>
      <p>Under Section 148(8) of the Companies Act, non-compliance attracts fines of ₹25,000 to ₹5 lakhs on the company and ₹10,000 to ₹1 lakh on officers in default. The ROC has been actively pursuing defaulters in 2025-26.</p>
      <p>SPB & Co. offers a free eligibility assessment for FY 2025-26. Our team handles cost record maintenance, CRA-2 filing, and CRA-3 audit report preparation entirely, ensuring zero defaults for our clients.</p>
    `
  },
  1: {
    emoji:'🧾', bg:'linear-gradient(135deg,#1a2a0d,#2a4a1a)', tag:'GST', date:'April 2026', author:'GST Team',
    title:'GST IMS is Live — <em>How It Changes Your ITC Claim Process</em> Completely',
    content:`
      <p>GSTN's Invoice Management System (IMS) became mandatory for large taxpayers from October 2024 and has been rolled out to all taxpayers through 2025. If you're still using the old GSTR-2A/2B workflow without adapting, you are at serious risk of ITC rejection.</p>
      <h4>What is IMS and Why Does It Matter?</h4>
      <p>IMS allows buyers to accept, reject, or keep pending supplier invoices before ITC is auto-populated into GSTR-3B. Invoices not acted upon within the prescribed timeline are treated as "deemed accepted" — but rejected invoices mean the ITC is permanently lost for that period.</p>
      <h4>Critical Changes to Your ITC Workflow</h4>
      <ul>
        <li>You must log in to GSTN's IMS portal regularly and action invoices before the 14th of each month</li>
        <li>Rejecting an invoice communicates the rejection to your supplier — coordinate before acting</li>
        <li>Only IMS-accepted invoices flow into GSTR-2B and are eligible for ITC in GSTR-3B</li>
        <li>Pending invoices carry forward but attract scrutiny if pending for more than 2 quarters</li>
      </ul>
      <div class="blog-article-highlight"><p>⚠️ <strong>Alert:</strong> Many businesses are losing ITC on legitimate invoices because they're not actively managing IMS. A single month's lapse can mean ₹5-50 lakhs of ITC lost permanently, with no rectification window after the annual return is filed.</p></div>
      <h4>What SPB & Co. Recommends</h4>
      <p>We have integrated IMS management into our monthly GST compliance cycle for all clients. Our team reviews, reconciles, and actions IMS dashboards before every GSTR-3B filing date, ensuring maximum legitimate ITC is claimed. Contact us to set up IMS-aware GST compliance for your business.</p>
    `
  },
  2: {
    emoji:'🏦', bg:'linear-gradient(135deg,#1a0d2a,#3a1a5c)', tag:'CMA Data', date:'March 2026', author:'Finance Team',
    title:'RBI\'s New Credit Assessment Guidelines 2025 — <em>How They Impact Your Loan Sanction</em>',
    content:`
      <p>RBI's revised credit appraisal circular issued in late 2025 has significantly changed how banks evaluate loan applications. Businesses preparing CMA data or project reports for FY 2025-26 must align with these new norms — or risk rejection despite sound financials.</p>
      <h4>Key Changes in Credit Assessment Norms</h4>
      <ul>
        <li><strong>DSCR Threshold Raised:</strong> Minimum DSCR for term loans is now 1.35 (up from 1.25) for manufacturing sector borrowers above ₹5 crore</li>
        <li><strong>Current Ratio Norm:</strong> CC limit applicants must now maintain a projected current ratio of 1.40 for the assessment year vs. the earlier 1.33 as per Tandon Committee norms</li>
        <li><strong>Collateral Sensitivity:</strong> Banks are now required to document alternative repayment scenarios — your CMA must include sensitivity analysis for ±15% revenue variance</li>
      </ul>
      <div class="blog-article-highlight"><p>💡 <strong>Critical Insight:</strong> Banks are now cross-referencing CMA data projections against GST returns and ITR data via the CIBIL Commercial platform. If your CMA projections don't align with historical GST-declared turnover, expect a query or reduction in sanction amount.</p></div>
      <h4>What Your CMA Data Must Now Include</h4>
      <ul>
        <li>Sensitivity analysis (mandatory for loans above ₹2 crore)</li>
        <li>GST turnover reconciliation statement</li>
        <li>Working capital cycle analysis aligned with actual industry debtor/creditor days</li>
        <li>ESG risk commentary for manufacturing sector loans above ₹10 crore</li>
      </ul>
      <p>SPB & Co. has updated all our CMA data templates to comply with the new RBI guidelines. Our 95%+ loan sanction rate continues under the revised framework. Get in touch for a pre-application CMA review.</p>
    `
  },
  3: {
    emoji:'💰', bg:'linear-gradient(135deg,#1a150d,#3a2a1a)', tag:'Income Tax', date:'February 2026', author:'Tax Team',
    title:'Budget 2026 Tax Highlights: <em>New Slabs, Revised Limits & What Changes for Companies</em>',
    content:`
      <p>Union Budget 2026, presented in February 2026, introduced several significant changes to personal income tax, corporate tax, and TDS provisions. Here is a concise, actionable summary for businesses and individuals.</p>
      <h4>New Income Tax Slabs (New Regime — Default)</h4>
      <ul>
        <li>Up to ₹4 lakh: Nil</li>
        <li>₹4–8 lakh: 5%</li>
        <li>₹8–12 lakh: 10%</li>
        <li>₹12–16 lakh: 15%</li>
        <li>₹16–20 lakh: 20%</li>
        <li>Above ₹20 lakh: 30%</li>
      </ul>
      <p>The new regime is now the default for all taxpayers. The old regime remains available but requires an explicit opt-in via Form 10-IEA at the time of filing.</p>
      <h4>Corporate Tax — Key Updates</h4>
      <ul>
        <li>Domestic companies with turnover up to ₹400 crore now eligible for 22% rate (up from ₹250 crore limit)</li>
        <li>Surcharge on companies with income above ₹10 crore revised downward to 10% from 12%</li>
        <li>MAT rate kept unchanged at 15%</li>
      </ul>
      <div class="blog-article-highlight"><p>⚠️ <strong>Action Required:</strong> Advance tax instalments for FY 2026-27 must be recalculated under the new slab rates. Businesses using old-regime projections for advance tax risk paying short — attracting interest under Sections 234B and 234C.</p></div>
      <h4>TDS Changes Effective April 2026</h4>
      <ul>
        <li>Section 194Q (purchase of goods): threshold raised to ₹75 lakh from ₹50 lakh</li>
        <li>Section 194R (perquisites/benefits): clarification on cash vs. non-cash benefits issued</li>
        <li>New Section 194T introduced for payments to partners of LLPs — TDS at 10% above ₹20,000</li>
      </ul>
      <p>SPB & Co.'s tax team has already updated all client TDS workings and advance tax schedules for FY 2026-27. Contact us for a post-budget tax impact assessment for your business.</p>
    `
  },
  4: {
    emoji:'🛡️', bg:'linear-gradient(135deg,#0d1a1a,#1a3a3a)', tag:'Internal Audit', date:'January 2026', author:'Audit Team',
    title:'IFC Compliance 2026: <em>Why Every Company Needs a Robust Internal Audit Now</em>',
    content:`
      <p>Internal Financial Controls (IFC) compliance has moved from a box-ticking exercise to a genuine boardroom priority in 2025-26. SEBI's enhanced disclosure norms and MCA's increased ROC scrutiny are creating real consequences for companies without proper IFC frameworks.</p>
      <h4>What's Changed in IFC Scrutiny</h4>
      <p>Statutory auditors are now required under SA 315 (Revised) to document their understanding of internal controls more rigorously. If your company lacks documented process controls, risk registers, and control testing evidence, your statutory auditor may issue a qualified opinion on IFC — which is a significant red flag for banks, investors, and regulators.</p>
      <h4>Who is Most at Risk</h4>
      <ul>
        <li>Companies with turnover above ₹50 crore but without a formal internal audit function</li>
        <li>Manufacturing firms with complex procurement, inventory, and production cycles</li>
        <li>Companies that have undergone rapid growth and outgrown their original control environment</li>
        <li>Businesses where the same person approves and processes transactions (segregation of duties gaps)</li>
      </ul>
      <div class="blog-article-highlight"><p>💡 <strong>Key Risk:</strong> A qualified IFC opinion in your statutory audit report can trigger bank covenant violations, delay loan renewals, and attract MCA scrutiny — all within the same financial year. Prevention costs a fraction of the cure.</p></div>
      <h4>SPB & Co.'s IFC-Aligned Internal Audit Approach</h4>
      <p>Our risk-based internal audit methodology is fully aligned with IFC requirements under the Companies Act. We map process controls, identify gaps, test control effectiveness, and deliver board-ready reports with remediation roadmaps. Clients who have implemented our IFC framework have received clean statutory audit opinions consistently.</p>
      <p>Get in touch for a free IFC readiness assessment — we'll identify your top 5 control gaps within one week.</p>
    `
  }
};

function openBlogArticle(index) {
  const art = blogArticles[index];
  if (!art) return;
  document.getElementById('blogModalThumb').style.background = art.bg;
  document.getElementById('blogModalThumb').innerHTML = '<span style="font-size:4rem;z-index:1;position:relative;">' + art.emoji + '</span><span class="blog-modal-tag">' + art.tag + '</span>';
  document.getElementById('blogModalMeta').innerHTML = '<span>📅 ' + art.date + '</span><span>✍️ ' + art.author + '</span>';
  document.getElementById('blogModalTitle').innerHTML = art.title;
  document.getElementById('blogModalContent').innerHTML = art.content;
  document.getElementById('blogModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeBlogModal(e) {
  if (e.target === document.getElementById('blogModal')) closeBlogModalBtn();
}
function closeBlogModalBtn() {
  document.getElementById('blogModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════
// DEADLINE COUNTDOWN POPUP
// All deadlines are for FY 2025-26 / 2026-27 as applicable
// ══════════════════════════════════════
const deadlines = [
  {
    service: '📋 Cost Audit',
    title: 'Cost Audit Filing <em>Deadline</em>',
    deadline: new Date('2026-09-30T23:59:59'),
    dateLabel: '30 September 2026',
    desc: 'Form CRA-3 (Cost Audit Report) for FY 2025-26 must be filed with MCA within 180 days from the close of the financial year. Missing this deadline attracts penalties under the Companies Act 2013.'
  },
  {
    service: '🧾 GST Annual Return',
    title: 'GSTR-9 Annual Return <em>Deadline</em>',
    deadline: new Date('2026-12-31T23:59:59'),
    dateLabel: '31 December 2026',
    desc: 'GSTR-9 (Annual Return) for FY 2025-26 is due by 31st December 2026. Late filing attracts ₹200/day late fee (₹100 CGST + ₹100 SGST). File early to avoid last-minute rush.'
  },
  {
    service: '💰 Income Tax – Companies',
    title: 'ITR Filing Deadline <em>(Audit Cases)</em>',
    deadline: new Date('2026-10-31T23:59:59'),
    dateLabel: '31 October 2026',
    desc: 'Companies and taxpayers whose accounts are subject to audit must file ITR for FY 2025-26 by 31st October 2026. Missing this attracts interest u/s 234A and late fee u/s 234F (up to ₹10,000).'
  },
  {
    service: '📊 TDS Q1 Return',
    title: 'TDS Return Q1 FY 2026-27 <em>Deadline</em>',
    deadline: new Date('2026-07-31T23:59:59'),
    dateLabel: '31 July 2026',
    desc: 'Form 24Q / 26Q for Q1 (April–June 2026) must be filed by 31st July 2026. Late filing fee u/s 234E is ₹200 per day until the return is filed. TDS certificates must also be issued on time.'
  },
  {
    service: '📊 TDS Q2 Return',
    title: 'TDS Return Q2 FY 2026-27 <em>Deadline</em>',
    deadline: new Date('2026-10-31T23:59:59'),
    dateLabel: '31 October 2026',
    desc: 'Form 24Q / 26Q for Q2 (July–September 2026) must be filed by 31st October 2026. Delay attracts ₹200/day penalty under Section 234E of the Income Tax Act.'
  },
  {
    service: '🛡️ Internal Audit',
    title: 'Internal Auditor Appointment <em>FY 2026-27</em>',
    deadline: new Date('2026-09-30T23:59:59'),
    dateLabel: '30 September 2026',
    desc: 'Companies mandatorily required to appoint an Internal Auditor under Section 138 of the Companies Act must ensure appointment for FY 2026-27 is done and Board resolution passed before the AGM deadline.'
  },
  {
    service: '🔍 GST ITC Reconciliation',
    title: 'GSTR-2B ITC Reconciliation <em>Deadline</em>',
    deadline: new Date('2026-11-30T23:59:59'),
    dateLabel: '30 November 2026',
    desc: 'Annual ITC reconciliation between GSTR-2B and books of accounts for FY 2025-26 must be completed before filing GSTR-9. Unreconciled ITC must be reversed to avoid GST department notices.'
  },
  {
    service: '🏦 Loan / CMA Reports',
    title: 'Bank CMA Submission <em>Before Year-End</em>',
    deadline: new Date('2027-03-31T23:59:59'),
    dateLabel: '31 March 2027',
    desc: 'CMA data and project reports for bank renewals, CC limit enhancement, or term loans should be submitted well before 31st March to ensure sanctions are processed before the financial year-end.'
  },
  {
    service: '💳 Advance Tax',
    title: 'Advance Tax 3rd Instalment <em>FY 2026-27</em>',
    deadline: new Date('2026-12-15T23:59:59'),
    dateLabel: '15 December 2026',
    desc: '3rd instalment of Advance Tax for FY 2026-27 (cumulative 75% of total liability) is due by 15th December 2026. Shortfall attracts interest u/s 234B and 234C at 1% per month.'
  }
];

let dlCurrentIndex = 0;
let dlCountdownTimer = null;
let dlAutoSlideTimer = null;
const DL_AUTO_SLIDE_MS = 5000;

/* ── Progress bar ── */
function dlProgressStart() {
  const fill = document.getElementById('dlProgressFill');
  if (!fill) return;
  fill.classList.remove('dl-running');
  fill.style.transition = 'none';
  fill.style.width = '0%';
  void fill.offsetWidth; // reflow
  fill.classList.add('dl-running');
  fill.style.transition = 'width ' + DL_AUTO_SLIDE_MS + 'ms linear';
  fill.style.width = '100%';
}
function dlProgressStop() {
  const fill = document.getElementById('dlProgressFill');
  if (!fill) return;
  fill.classList.remove('dl-running');
  fill.style.transition = 'none';
  fill.style.width = '0%';
}

/* ── Auto slide ── */
function startDlAutoSlide() {
  stopDlAutoSlide();
  if (deadlines.length < 2) return;
  dlProgressStart();
  dlAutoSlideTimer = setInterval(() => {
    dlCurrentIndex = (dlCurrentIndex + 1) % deadlines.length;
    renderDeadlinePopup(true);
  }, DL_AUTO_SLIDE_MS);
}
function stopDlAutoSlide() {
  if (dlAutoSlideTimer) { clearInterval(dlAutoSlideTimer); dlAutoSlideTimer = null; }
  dlProgressStop();
}

/* ── Open / close with overlay animation ── */
function openDeadlinePopup(index) {
  dlCurrentIndex = (index !== undefined) ? index : getMostUrgentDeadlineIndex();
  const overlay = document.getElementById('deadlinePopupOverlay');
  overlay.classList.add('open');
  void overlay.offsetWidth;
  overlay.classList.add('dl-visible');
  document.body.style.overflow = 'hidden';
  renderDeadlinePopup(false);
  startDlAutoSlide();
}

function getMostUrgentDeadlineIndex() {
  const now = new Date();
  let closest = 0, minDiff = Infinity;
  deadlines.forEach((d, i) => {
    const diff = d.deadline - now;
    if (diff > 0 && diff < minDiff) { minDiff = diff; closest = i; }
  });
  return closest;
}

/* ── Render with optional slide-in animation ── */
function renderDeadlinePopup(animate) {
  const idx = dlCurrentIndex;
  const d = deadlines[idx];
  const content = document.getElementById('dlSlideContent');
  const title   = document.getElementById('dlTitle');

  function applyContent() {
    title.innerHTML = d.title;
    document.getElementById('dlBadge').textContent    = d.service;
    document.getElementById('dlDateLabel').textContent = d.dateLabel;
    document.getElementById('dlDesc').textContent      = d.desc;

    // Nav dots
    const dots = document.getElementById('dlDots');
    dots.innerHTML = '';
    deadlines.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.className = 'dl-dot' + (i === idx ? ' active' : '');
      btn.title = deadlines[i].service;
      btn.onclick = () => {
        dlCurrentIndex = i;
        renderDeadlinePopup(true);
        startDlAutoSlide();
      };
      dots.appendChild(btn);
    });

    // Countdown
    if (dlCountdownTimer) { clearInterval(dlCountdownTimer); dlCountdownTimer = null; }
    updateCountdown(d.deadline);
    dlCountdownTimer = setInterval(() => updateCountdown(d.deadline), 1000);
  }

  if (animate && content) {
    // Exit current content
    content.classList.add('dl-exit');
    title.classList.add('dl-fade');
    setTimeout(() => {
      applyContent();
      content.classList.remove('dl-exit');
      content.classList.add('dl-enter');
      title.classList.remove('dl-fade');
      void content.offsetWidth;
      content.classList.remove('dl-enter');
    }, 320);
  } else {
    applyContent();
  }
}

/* ── Countdown with flip effect ── */
function updateCountdown(deadline) {
  const diff = deadline - new Date();
  const ids  = ['dlDays','dlHours','dlMins','dlSecs'];
  if (diff <= 0) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      el.textContent = '00';
      el.classList.add('urgent');
    });
    return;
  }
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  const secs  = Math.floor((diff % 60000)    / 1000);
  const vals  = [days, hours, mins, secs];
  const urgent = days <= 7;

  ids.forEach((id, i) => {
    const el  = document.getElementById(id);
    const val = String(vals[i]).padStart(2, '0');
    if (el.textContent !== val) {
      el.classList.add('dl-flip');
      setTimeout(() => {
        el.textContent = val;
        el.classList.remove('dl-flip');
        el.classList.toggle('urgent', urgent);
      }, 180);
    }
  });
}

function closeDlPopup() {
  const overlay = document.getElementById('deadlinePopupOverlay');
  overlay.classList.remove('dl-visible');
  setTimeout(() => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }, 420);
  if (dlCountdownTimer) { clearInterval(dlCountdownTimer); dlCountdownTimer = null; }
  stopDlAutoSlide();
}

function closeDlPopupOutside(e) {
  if (e.target === document.getElementById('deadlinePopupOverlay')) closeDlPopup();
}



// Auto deadline popup disabled. Deadline details open only through intentional actions.

// ══════════════════════════════════════
// SERVICE DETAIL DATA
// ══════════════════════════════════════
const serviceDetails = {
  'Cost Audit': {
    icon: '📋',
    title: 'Statutory <em>Cost Audit</em>',
    content: `<p>Cost Audit is the systematic examination of cost records and accounts maintained under the Companies (Cost Records and Audit) Rules, 2014, as mandated by Section 148 of the Companies Act, 2013. At SPB & Co., our Cost Audit practice is led by ICMAI-registered Cost Accountants with over 15 years of hands-on experience across 50+ industries, making us one of the most trusted cost audit firms in North India.</p>
    <p>Every engagement begins with a thorough eligibility assessment to determine whether your company falls under the mandatory cost audit threshold — based on your industry classification, annual turnover, and net worth. We assess applicability under the prescribed industries including pharmaceuticals, steel, cement, mining, petroleum, electricity, and dozens of other notified sectors.</p>
    <h4>What Our Cost Audit Covers</h4>
    <ul>
      <li>Verification of cost accounting records maintained as per CAS (Cost Accounting Standards) issued by ICMAI</li>
      <li>Review of product-wise cost statements including raw materials, labour, overheads, and administrative costs</li>
      <li>Examination of production efficiency ratios, capacity utilization, wastage norms, and idle time analysis</li>
      <li>Reconciliation of cost records with financial accounts to identify discrepancies</li>
      <li>Assessment of inter-unit transfers, captive consumption, and related-party transactions at cost</li>
      <li>Verification of opening and closing stock valuations using CAS-4 principles where applicable</li>
    </ul>
    <h4>Filing & Compliance</h4>
    <p>We prepare and file the Cost Audit Report in Form CRA-3 on the MCA21 portal within the prescribed timelines. The typical deadline for filing the Cost Audit Report is within 180 days from the close of the financial year (i.e., by 30th September for FY ending 31st March). We also assist in filing Form CRA-2 for appointment of Cost Auditor and Form CRA-4 for submitting the auditor's report to the Board.</p>
    <div class="svc-highlight"><p>⚠️ Non-compliance with mandatory Cost Audit attracts penalties of up to ₹1 lakh on the company and ₹25,000 on the officer in default under the Companies Act, 2013. Don't wait — our team can assess your eligibility within 24 hours.</p></div>
    <h4>Industries We Serve for Cost Audit</h4>
    <p>Manufacturing (FMCG, engineering, textiles, plastics), Pharmaceuticals, Chemicals & Fertilizers, Mining & Minerals, Petroleum & Gas, Electricity Generation & Distribution, Steel & Metals, Cement & Construction Materials, Sugar & Distilleries, Automotive & Components, and more. Our auditors bring sector-specific knowledge that goes beyond generic checklists — we understand your production process, your cost drivers, and your regulatory environment.</p>
    <h4>Why Choose SPB & Co. for Cost Audit?</h4>
    <ul>
      <li>300+ cost audits completed across FY 2010–2026 with 100% on-time filing record</li>
      <li>Dedicated audit teams with industry specialization — not generalists doing everything</li>
      <li>Proactive compliance monitoring: we alert you 60 days before every filing deadline</li>
      <li>Post-audit support: we help you implement audit recommendations to reduce costs</li>
      <li>Representation before MCA and ICMAI if any clarifications or responses are required</li>
    </ul>
    <div class="svc-modal-cta"><a href="#contact" class="btn-primary" onclick="closeSvcModal()">📅 Book Cost Audit Consultation →</a><a href="https://wa.me/919716719137" target="_blank" class="btn-outline" onclick="closeSvcModal()">💬 WhatsApp Us</a></div>`
  },
  'GST Filing': {
    icon: '🧾',
    title: 'GST Filing & <em>Compliance</em>',
    content: `<p>Goods & Services Tax (GST) compliance is one of the most critical yet time-sensitive obligations for any registered business in India. With multiple return types, evolving ITC rules, e-invoicing mandates, and frequent GSTN updates, staying compliant requires not just knowledge — but a dedicated system. SPB & Co. offers a fully managed GST filing service that takes the compliance burden completely off your plate.</p>
    <p>Our GST team has handled filings for 200+ clients across FY 2017–2026 with zero default track record. We serve businesses ranging from ₹40 lakh turnover startups to ₹500 crore+ manufacturing enterprises, tailoring our service to your specific transaction volume, input credit complexity, and industry.</p>
    <h4>Our GST Filing Services Include</h4>
    <ul>
      <li>GSTR-1: Outward supplies return filed monthly/quarterly, with invoice-level data verification</li>
      <li>GSTR-3B: Summary return with accurate ITC reconciliation against GSTR-2B</li>
      <li>GSTR-9: Annual return preparation and filing with financial reconciliation</li>
      <li>GSTR-9C: Reconciliation statement for applicable taxpayers</li>
      <li>ITC-04: Job work returns for manufacturing companies using job workers</li>
      <li>GSTR-7 & GSTR-8: TDS and TCS returns under GST for applicable entities</li>
      <li>E-way bill compliance management for inter-state and intra-state goods movement</li>
      <li>E-invoicing setup and compliance for businesses above the applicable turnover threshold</li>
    </ul>
    <h4>ITC Reconciliation — Our Core Strength</h4>
    <p>Input Tax Credit (ITC) reconciliation is the most critical and most overlooked aspect of GST compliance. Mismatches between your purchase register and GSTR-2B can result in ITC rejections, demand notices, and interest liability. Our team performs monthly 3-way reconciliation (Purchase Register vs GSTR-2B vs GSTR-3B) and follows up with your vendors when invoices are missing or incorrect.</p>
    <div class="svc-highlight"><p>💡 SPB & Co. clients have recovered an average of ₹4.2 lakh in pending ITC per year through our systematic reconciliation process. Don't leave money on the table.</p></div>
    <h4>GST Registration & Advisory</h4>
    <p>We assist in new GST registration across all states, GSTIN activation, composition scheme eligibility analysis, and reverse charge mechanism (RCM) applicability assessment. For businesses operating across multiple states, we manage multi-state GST registrations and ensure GSTIN-wise compliance for each location.</p>
    <h4>GST Notice Response & Litigation Support</h4>
    <p>In the event of GST department notices, scrutiny assessments, or demands, we provide end-to-end representation before the GST authority including preparation of written submissions, documentary evidence compilation, and hearing attendance. We have successfully responded to 50+ GST notices with favorable outcomes for clients.</p>
    <div class="svc-modal-cta"><a href="#contact" class="btn-primary" onclick="closeSvcModal()">📅 Get GST Help →</a><a href="https://wa.me/919716719137" target="_blank" class="btn-outline" onclick="closeSvcModal()">💬 WhatsApp Us</a></div>`
  },
  'GST Audit': {
    icon: '🔍',
    title: 'GST <em>Audit</em>',
    content: `<p>GST Audit is the examination of GST returns, records, and books of accounts of a registered person to verify the accuracy of turnover declared, taxes paid, refunds claimed, and input tax credit availed. With the GSTN's growing capability to cross-verify data across supply chain participants, GST audit is increasingly important even for businesses not technically mandated to file GSTR-9C.</p>
    <p>At SPB & Co., our GST audit methodology is built around risk-identification and reconciliation accuracy. We don't just compare numbers — we understand the underlying transactions, identify potential areas of dispute, and help you proactively correct them before the GST department does.</p>
    <h4>What Our GST Audit Covers</h4>
    <ul>
      <li>Verification of turnover declared in GST returns against books of accounts and financial statements</li>
      <li>Review of ITC availed versus ITC eligible, including blocked credits under Section 17(5)</li>
      <li>Reconciliation of GSTR-1 vs GSTR-3B for outward supplies accuracy</li>
      <li>Verification of RCM (Reverse Charge Mechanism) applicability and compliance</li>
      <li>Assessment of e-invoicing compliance for applicable transactions</li>
      <li>Review of inter-state vs intra-state classification of supplies and IGST/CGST/SGST accuracy</li>
      <li>Verification of place of supply rules for service transactions</li>
      <li>Assessment of exempt supplies, nil-rated supplies, and their impact on ITC reversal</li>
    </ul>
    <h4>GST Annual Return Audit (GSTR-9C)</h4>
    <p>GSTR-9C is the reconciliation statement to be filed along with GSTR-9 (Annual Return) for taxpayers with turnover exceeding the prescribed threshold. Our team prepares the GSTR-9C with detailed reconciliation schedules, identifies and documents reasons for differences, and ensures that any voluntary disclosures required are handled correctly to minimize penalty exposure.</p>
    <div class="svc-highlight"><p>⚠️ Common GST audit findings: excess ITC availed on exempt supplies, ITC not reversed for credit notes, incorrect place of supply for mixed contracts, and mismatch between export LUT declarations and actual zero-rated supplies. We identify and rectify these proactively.</p></div>
    <h4>Refund Audits</h4>
    <p>For exporters and businesses with inverted duty structures, we conduct refund audits to ensure maximum eligible refund recovery. We verify the refund application documentation, Statement of Invoices (RFD-01), BRC/FIRC for export proceeds, and represent before the GST refund authority for timely processing.</p>
    <div class="svc-modal-cta"><a href="#contact" class="btn-primary" onclick="closeSvcModal()">📅 Book GST Audit →</a><a href="https://wa.me/919716719137" target="_blank" class="btn-outline" onclick="closeSvcModal()">💬 WhatsApp Us</a></div>`
  },
  'Internal Audit': {
    icon: '🛡️',
    title: 'Risk-Based <em>Internal Audit</em>',
    content: `<p>Internal Audit is no longer just a compliance checkbox — it is a strategic management tool that helps organizations identify risks, plug revenue leakages, strengthen controls, and operate with greater efficiency. At SPB & Co., our Internal Audit practice is built on a risk-based framework that prioritizes high-impact areas, delivers actionable findings, and provides management with the assurance needed to make confident decisions.</p>
    <p>We have conducted 150+ internal audit engagements across manufacturing, trading, real estate, logistics, FMCG, and services sectors. Our teams don't just identify problems — we work with your management to implement solutions, track closure of audit observations, and build a culture of process improvement.</p>
    <h4>Our Internal Audit Framework</h4>
    <ul>
      <li><strong>Risk Assessment:</strong> Identify and prioritize audit universe based on inherent risk, control risk, and management concerns</li>
      <li><strong>Audit Planning:</strong> Prepare risk-based annual audit plan with quarterly scheduling and resource allocation</li>
      <li><strong>Process Review:</strong> Detailed testing of internal controls, SOPs, delegation of authority, and approval hierarchies</li>
      <li><strong>Field Audit:</strong> Physical verification, transaction testing, system walkthrough, and surprise checks</li>
      <li><strong>Reporting:</strong> Draft findings with root cause analysis, financial impact quantification, and recommendation</li>
      <li><strong>Follow-Up:</strong> Track implementation of recommendations in subsequent cycles</li>
    </ul>
    <h4>Key Areas We Audit</h4>
    <ul>
      <li>Procurement & Vendor Management: Purchase process, vendor evaluation, price comparison, and GRN accuracy</li>
      <li>Revenue & Collections: Billing accuracy, credit control, collection efficiency, and debtor ageing</li>
      <li>Inventory Management: Stock accounting, slow-moving inventory, write-off policies, and physical verification</li>
      <li>Payroll & HR Processes: Attendance systems, payroll computation, statutory deductions, and exit procedures</li>
      <li>Fixed Assets: Capitalization policies, depreciation accuracy, maintenance records, and asset tagging</li>
      <li>Treasury & Cash Management: Bank reconciliation, petty cash controls, and fund flow management</li>
      <li>IT & ERP Systems: Access controls, data integrity, backup policies, and system-level audit trails</li>
    </ul>
    <div class="svc-highlight"><p>💡 Our internal audit clients have reported average savings of ₹15 lakh per year through identified process improvements, fraud prevention, and procurement optimizations — a return of 4-8x on the audit fee.</p></div>
    <h4>IFC (Internal Financial Controls) Compliance</h4>
    <p>Under the Companies Act, 2013 and SEBI LODR, listed and specified unlisted companies must maintain adequate Internal Financial Controls over financial reporting (IFC-FR). We assist in IFC design, documentation (Risk & Control Matrix, Process Narratives), testing, and gap remediation to support your statutory auditors' IFC reporting.</p>
    <div class="svc-modal-cta"><a href="#contact" class="btn-primary" onclick="closeSvcModal()">📅 Start Internal Audit →</a><a href="https://wa.me/919716719137" target="_blank" class="btn-outline" onclick="closeSvcModal()">💬 WhatsApp Us</a></div>`
  },
  'Product Costing': {
    icon: '⚙️',
    title: 'Product <em>Costing</em>',
    content: `<p>Accurate product costing is the foundation of profitable pricing, margin management, and competitive strategy. Yet many manufacturing and trading businesses operate with costing systems built on assumptions rather than actual data — leading to mispriced products, margin erosion, and missed opportunities. SPB & Co.'s Product Costing service transforms your cost data into strategic business intelligence.</p>
    <p>Our costing specialists bring deep expertise in manufacturing cost accounting, having designed and implemented costing systems for companies ranging from small component manufacturers to large multi-product industrial enterprises. We understand the nuances of job costing, process costing, batch costing, and activity-based costing — and recommend the right methodology for your business.</p>
    <h4>What We Deliver</h4>
    <ul>
      <li>Detailed Product Cost Cards covering direct materials, direct labour, variable overheads, and fixed overhead absorption</li>
      <li>Standard Costing System design with variance analysis framework (Material Price, Usage, Labour Rate, Efficiency, Overhead Spending, Volume variances)</li>
      <li>Activity-Based Costing (ABC) implementation for companies with complex product mixes where traditional absorption distorts margins</li>
      <li>Bill of Materials (BOM) review and rationalization for manufacturing efficiency</li>
      <li>Overhead allocation and apportionment methodology — machine hour rate, labor hour rate, or ABC drivers</li>
      <li>Contribution analysis and break-even computation for each product/SKU</li>
      <li>Selling price recommendation models incorporating target margin, market positioning, and competitor benchmarks</li>
    </ul>
    <h4>Cost Reduction & Optimization</h4>
    <p>Beyond costing design, we conduct cost reduction studies that identify specific opportunities to reduce material waste, improve labour productivity, optimize energy consumption, and rationalize product portfolio. We benchmark your costs against industry norms and identify the largest improvement levers with quantified savings potential.</p>
    <div class="svc-highlight"><p>💡 One of our FMCG clients discovered through our product costing analysis that 3 of their 12 SKUs were being sold below full cost. Repricing and discontinuing one loss-making variant improved overall company margin by 2.4% within one quarter.</p></div>
    <h4>Transfer Pricing & Inter-Unit Costing</h4>
    <p>For companies with multiple manufacturing plants or business units, we design inter-unit transfer pricing policies that align with CAS-4 (for captive consumption), Income Tax transfer pricing rules, and management reporting requirements. We ensure that your cost transfers are defensible before tax authorities while accurately reflecting internal economics.</p>
    <div class="svc-modal-cta"><a href="#contact" class="btn-primary" onclick="closeSvcModal()">📅 Get Product Costing →</a><a href="https://wa.me/919716719137" target="_blank" class="btn-outline" onclick="closeSvcModal()">💬 WhatsApp Us</a></div>`
  },
  'TDS Compliance': {
    icon: '📊',
    title: 'TDS <em>Compliance</em>',
    content: `<p>Tax Deducted at Source (TDS) is one of the most pervasive compliance obligations under the Income Tax Act, 1961 — applicable to salary payments, professional fees, rent, contractor payments, interest, dividends, and a wide array of other transactions. A single miss in TDS deduction, deposit, or return filing can attract interest, penalties, and prosecution risk. SPB & Co. offers a fully managed TDS service that ensures 100% compliance with zero default risk.</p>
    <p>We currently manage TDS compliance for 200+ clients spanning all major payment categories — from single-location SMEs to multi-state enterprises with thousands of TDS transactions per month. Our systematic approach covers every step from applicability assessment to certificate generation.</p>
    <h4>Our TDS Service Scope</h4>
    <ul>
      <li><strong>Applicability Assessment:</strong> Transaction-by-transaction review to determine correct TDS section, rate, and threshold applicability</li>
      <li><strong>Lower Deduction Certificates:</strong> Assistance in obtaining 197 certificates for vendors to avoid excess TDS deduction disputes</li>
      <li><strong>Monthly TDS Computation:</strong> Accurate computation of TDS on all payments before disbursement</li>
      <li><strong>Challan Deposit:</strong> Timely deposit of TDS to government via NSDL/TIN-NSDL portal (by 7th of each month for non-March payments; by 30th April for March)</li>
      <li><strong>Quarterly Returns:</strong> Filing of Form 24Q (salary TDS), 26Q (non-salary TDS), 27Q (non-residents), and 27EQ (TCS) within due dates</li>
      <li><strong>TDS Certificates:</strong> Generation and distribution of Form 16, 16A, and 27D to payees within statutory timelines</li>
      <li><strong>TRACES Management:</strong> CPC/TRACES reconciliation, demand resolution, and outstanding statement management</li>
    </ul>
    <h4>Salary TDS & Form 16</h4>
    <p>For employers, we manage the complete salary TDS cycle — from collecting investment declarations at the start of year, computing month-wise TDS liability (accounting for Section 80C, 80D, HRA exemption, LTA, and other allowances), depositing TDS monthly, filing Form 24Q quarterly, and generating Form 16 Part A and Part B for each employee at year-end.</p>
    <div class="svc-highlight"><p>⚠️ Late TDS deposit attracts interest at 1.5% per month. Late filing of TDS returns attracts ₹200 per day in fees under Section 234E. Wrong PAN linkage or non-deduction attracts 30% disallowance of the expense. These are avoidable — let us manage it.</p></div>
    <h4>TDS on Property Transactions</h4>
    <p>We assist buyers and sellers in TDS compliance on property transactions (Section 194IA — 1% on property purchases above ₹50 lakh), including Form 26QB filing, lower deduction certificates where applicable, and Form 16B generation for sellers.</p>
    <div class="svc-modal-cta"><a href="#contact" class="btn-primary" onclick="closeSvcModal()">📅 Manage TDS →</a><a href="https://wa.me/919716719137" target="_blank" class="btn-outline" onclick="closeSvcModal()">💬 WhatsApp Us</a></div>`
  },
  'Income Tax Compliance': {
    icon: '💰',
    title: 'Income Tax <em>Compliance</em>',
    content: `<p>Income Tax compliance is a year-round responsibility — not just a once-a-year filing event. For businesses and individuals alike, proactive tax planning, accurate advance tax computation, timely TDS management, and strategic use of deductions can make a significant difference to the tax outgo. SPB & Co. provides comprehensive income tax services that combine compliance accuracy with proactive planning.</p>
    <p>We file 400+ income tax returns annually for corporate and individual clients, with a 100% on-time filing record. Our tax team stays current with every Budget amendment, Finance Act notification, and CBDT circular — so your compliance is always based on the latest provisions.</p>
    <h4>Corporate Tax Services</h4>
    <ul>
      <li>Tax planning and structuring to optimize effective tax rate while maintaining full compliance</li>
      <li>Advance tax computation and deposit scheduling (15th June, September, December, March)</li>
      <li>Income Tax Return filing for all company types: domestic companies, LLPs, firms, and trusts</li>
      <li>Tax Audit under Section 44AB (Form 3CA-3CD or 3CB-3CD) as per applicable threshold</li>
      <li>Deferred Tax accounting as per AS-22 / Ind AS 12 for financial statements</li>
      <li>MAT/AMT computation and credit tracking for future set-off</li>
      <li>Section 43B disallowances, 35D capitalization, and other specialized adjustment calculations</li>
    </ul>
    <h4>Individual & HUF Tax Services</h4>
    <ul>
      <li>Income Tax Return filing for salaried, business, professional, and capital gains income categories</li>
      <li>Old vs New Regime comparison and optimization for each client</li>
      <li>Capital Gains computation: short-term vs long-term, indexed cost, property transactions, share/mutual fund gains</li>
      <li>Foreign Income / DTAA benefits for NRIs and individuals with overseas income</li>
      <li>Section 80C, 80D, 80G, 80E, 80EE, and other deduction optimization</li>
    </ul>
    <div class="svc-highlight"><p>💡 Our tax planning analysis for a mid-size manufacturing company identified ₹18 lakh in legitimate tax savings through accelerated depreciation elections, R&D expenditure treatment, and employee benefit restructuring — all within the four corners of the Income Tax Act.</p></div>
    <h4>Assessment & Litigation</h4>
    <p>In case of scrutiny assessments, income tax notices (143(1), 143(2), 147, 148, 271), or appeals, we provide end-to-end representation before Assessing Officers, CIT(A), and ITAT. We prepare written submissions, compile documentary evidence, and attend hearings with experienced tax professionals. Our success rate in assessment cases exceeds 85% — measured by either full acceptance or reduction of additions made.</p>
    <div class="svc-modal-cta"><a href="#contact" class="btn-primary" onclick="closeSvcModal()">📅 Plan Your Taxes →</a><a href="https://wa.me/919716719137" target="_blank" class="btn-outline" onclick="closeSvcModal()">💬 WhatsApp Us</a></div>`
  },
  'Budgeting & Forecasting': {
    icon: '📈',
    title: 'Budgeting & <em>Forecasting</em>',
    content: `<p>In today's volatile business environment, organizations that operate without a formal budgeting and forecasting system are essentially flying blind. A well-constructed budget is not just a financial plan — it is a management tool that aligns departments around common goals, enables proactive resource allocation, and provides a benchmark against which actual performance can be measured. SPB & Co.'s Budgeting & Forecasting service brings financial discipline and strategic clarity to businesses of all sizes.</p>
    <p>We have designed and implemented budgeting frameworks for companies ranging from ₹5 crore revenue startups to ₹300 crore manufacturing enterprises, in sectors including FMCG, engineering, real estate, logistics, and services. Our approach is collaborative — we work with your finance team and department heads to build budgets that are ambitious yet realistic, and that your organization will actually use.</p>
    <h4>Our Budgeting Services</h4>
    <ul>
      <li><strong>Annual Master Budget:</strong> Integrated set of Sales Budget, Production Budget, Materials Budget, Labour Budget, Overhead Budget, Cash Budget, and Projected P&L, Balance Sheet and Cash Flow Statement</li>
      <li><strong>Zero-Based Budgeting (ZBB):</strong> Bottom-up approach that justifies every rupee of expenditure from scratch, particularly useful for cost rationalization exercises</li>
      <li><strong>Rolling Forecasts:</strong> Quarterly updated 12-month rolling forecasts that reflect latest business conditions — more responsive than static annual budgets</li>
      <li><strong>Department-Level Budgets:</strong> Detailed cost centre budgets with individual department ownership and accountability metrics</li>
      <li><strong>CapEx Budget:</strong> Capital expenditure planning with ROI analysis, payback period, and financing requirement assessment</li>
    </ul>
    <h4>Variance Analysis & MIS Reporting</h4>
    <p>Budgeting is only valuable if it drives action. We design monthly Management Information System (MIS) reports that compare actuals against budget, identify significant variances, investigate root causes, and recommend corrective actions. Our variance reports distinguish between controllable and non-controllable variances, helping management focus on what they can actually change.</p>
    <div class="svc-highlight"><p>💡 Companies that implement formal budgeting and monthly variance analysis report 18-25% better cost control outcomes compared to companies that rely only on historical trend analysis, according to CII studies of Indian SME performance.</p></div>
    <h4>Financial Projections for Fundraising & Banks</h4>
    <p>When seeking external financing or equity investment, you need professionally prepared financial projections that are credible, well-structured, and aligned with lender/investor expectations. We prepare 3 to 5 year projected financial statements (P&L, Balance Sheet, Cash Flow) with detailed assumption schedules, sensitivity analysis, and ratio analysis — presenting your business story in the language that banks and investors understand.</p>
    <div class="svc-modal-cta"><a href="#contact" class="btn-primary" onclick="closeSvcModal()">📅 Build Your Budget →</a><a href="https://wa.me/919716719137" target="_blank" class="btn-outline" onclick="closeSvcModal()">💬 WhatsApp Us</a></div>`
  },
  'Stock Audit': {
    icon: '📦',
    title: 'Stock <em>Audit</em>',
    content: `<p>Stock Audit — also known as Inventory Audit or Physical Verification of Inventories — is the systematic examination of physical stock holdings against book records to ensure accuracy, prevent pilferage, identify slow-moving or obsolete inventory, and validate the security of collateral pledged against bank borrowings. Banks routinely require periodic stock audits as a condition of working capital facilities, making this a critical compliance for businesses with CC (Cash Credit) limits.</p>
    <p>SPB & Co. conducts stock audits for banks, companies, and institutions across North India. Our auditors are experienced in handling large and complex inventory environments including multi-location warehouses, raw material and finished goods stores, and WIP verification in manufacturing environments.</p>
    <h4>Types of Stock Audits We Conduct</h4>
    <ul>
      <li><strong>Bank-Mandated Stock Audit:</strong> Required by lending banks as part of annual/periodic review of CC/OD limits. We report to the bank's prescribed format covering stock value, stock quality, drawing power computation, and insurance adequacy.</li>
      <li><strong>Statutory Stock Audit:</strong> Annual physical verification for companies as required by internal policy or statutory audit requirements</li>
      <li><strong>Pre-Acquisition Due Diligence:</strong> Stock verification as part of M&A or business acquisition due diligence</li>
      <li><strong>Forensic Stock Audit:</strong> When suspected fraud, pilferage, or significant discrepancies exist — we conduct forensic-level verification with chain-of-custody documentation</li>
    </ul>
    <h4>Our Stock Audit Process</h4>
    <ul>
      <li>Pre-audit planning: Review stock ledger, last physical count, and prior audit reports</li>
      <li>Physical counting using stratified sampling and 100% counting for high-value items</li>
      <li>Reconciliation of physical count with bin cards, stock register, and ERP system</li>
      <li>Identification of slow-moving (>180 days), non-moving (>365 days), and obsolete/damaged stock</li>
      <li>Valuation verification using FIFO/Weighted Average as per company policy</li>
      <li>Assessment of insurance coverage adequacy against current stock values</li>
      <li>Drawing power computation for bank reporting</li>
    </ul>
    <div class="svc-highlight"><p>💡 A stock audit we conducted for a manufacturing client identified ₹32 lakh in unrecorded surplus stock that was subsequently claimed as insurance under a past fire event — recovering funds the company didn't know it was owed.</p></div>
    <div class="svc-modal-cta"><a href="#contact" class="btn-primary" onclick="closeSvcModal()">📅 Book Stock Audit →</a><a href="https://wa.me/919716719137" target="_blank" class="btn-outline" onclick="closeSvcModal()">💬 WhatsApp Us</a></div>`
  },
  'Management Audit': {
    icon: '🔎',
    title: 'Management <em>Audit</em>',
    content: `<p>Management Audit evaluates the effectiveness, efficiency, and economy of management functions within an organization. Unlike financial audit which focuses on numbers, management audit focuses on people, processes, decisions, and organizational structures — assessing whether management is achieving its objectives in the most effective way possible. At SPB & Co., our management audits provide boards and senior management with an independent, objective assessment of operational and strategic performance.</p>
    <p>Management Audit is particularly valuable for family-owned businesses transitioning to professional management, for companies experiencing declining profitability without clear cause, and for organizations preparing for expansion, fundraising, or succession planning.</p>
    <h4>What Management Audit Covers</h4>
    <ul>
      <li><strong>Organizational Structure Review:</strong> Assessment of hierarchy, reporting lines, span of control, and accountability — identifying redundancies and authority gaps</li>
      <li><strong>Decision-Making Processes:</strong> Review of how key business decisions are made, documented, and implemented — from capital expenditures to pricing to vendor selection</li>
      <li><strong>Goal-Setting & Performance Management:</strong> Assessment of KPI frameworks, target-setting processes, and performance review mechanisms</li>
      <li><strong>Management Information Systems (MIS):</strong> Review of reporting quality, data accuracy, reporting frequency, and whether management has the right information to make decisions</li>
      <li><strong>Procurement & Supply Chain Management:</strong> Evaluation of vendor selection, price negotiation effectiveness, and supply chain resilience</li>
      <li><strong>Human Resource Management:</strong> Assessment of hiring processes, training effectiveness, retention metrics, and HR policy compliance</li>
      <li><strong>Risk Management Framework:</strong> Evaluation of how risks are identified, assessed, monitored, and mitigated across the organization</li>
    </ul>
    <h4>Our Deliverable: The Management Audit Report</h4>
    <p>Our Management Audit Report goes beyond a list of findings. It includes an executive summary for board consumption, detailed findings with root cause analysis, financial impact quantification where applicable, best-practice benchmarks from comparable organizations, and a prioritized action plan with responsible parties and timelines. We also conduct a board presentation to walk key stakeholders through findings and recommendations.</p>
    <div class="svc-highlight"><p>💡 A management audit we conducted for a ₹120 crore logistics company identified that 38% of management time was being spent on activities that could be delegated or automated — freeing leadership to focus on strategy and client relationships, contributing to 22% revenue growth in the following year.</p></div>
    <div class="svc-modal-cta"><a href="#contact" class="btn-primary" onclick="closeSvcModal()">📅 Request Management Audit →</a><a href="https://wa.me/919716719137" target="_blank" class="btn-outline" onclick="closeSvcModal()">💬 WhatsApp Us</a></div>`
  },
  'CC Limit Projection': {
    icon: '💳',
    title: 'CC Limit & <em>Working Capital</em>',
    content: `<p>Cash Credit (CC) limit is the most critical working capital facility for most businesses — enabling you to fund your operating cycle without constantly liquidating assets. Getting the right CC limit sanctioned, and then renewing it annually with enhanced limits as your business grows, requires professionally prepared documentation that speaks the bank's language. SPB & Co. specializes in CC limit projections, CMA data preparation, and comprehensive working capital financing support.</p>
    <p>We have facilitated over ₹500 Crore in total credit sanctions for clients, with a 95%+ sanction rate across all proposals. Our reports are prepared as per RBI guidelines and individual bank formats, ensuring smooth processing without back-and-forth for additional information.</p>
    <h4>What We Prepare for CC Limit Sanction</h4>
    <ul>
      <li><strong>CMA Data (Credit Monitoring Arrangement):</strong> The cornerstone of bank credit appraisal — includes 2 years actual financials, current year estimates, and 2 years projections in the prescribed banking format</li>
      <li><strong>Working Capital Assessment:</strong> Computation of Maximum Permissible Bank Finance (MPBF) using Tandon Committee norms or the turnover method as applicable</li>
      <li><strong>Drawing Power Statement:</strong> Monthly drawing power computation based on current stock and debtors (net of creditors) to support ongoing CC operations</li>
      <li><strong>Fund Flow Statement:</strong> Statement of sources and application of funds showing how business assets are financed and cash moves through the operating cycle</li>
      <li><strong>Cash Flow Statement:</strong> Projected monthly cash flow showing adequate surplus for debt servicing and business operations</li>
      <li><strong>Ratio Analysis:</strong> Current ratio, Quick ratio, DSCR, TOL/TNW, FACR, and other key ratios with benchmarking against banking norms</li>
    </ul>
    <h4>CC Limit Enhancement Proposals</h4>
    <p>As your business grows, your CC limit must grow with it. We prepare enhancement proposals that demonstrate business growth with supporting data, justify enhanced limit requirement through updated MPBF computation, and address potential bank concerns proactively. Our enhancement proposals have a strong track record of approval at first submission.</p>
    <div class="svc-highlight"><p>💡 Most CC limit rejections happen not because the business is weak — but because the presentation is poor, ratios are not explained, or the projections are not credible. A professionally prepared CMA data package by SPB & Co. changes the conversation with your bank.</p></div>
    <h4>End-to-End Bank Coordination</h4>
    <p>Beyond documentation, we actively coordinate with your relationship manager, respond to credit department queries, explain key ratios and projections, and follow up to ensure timely sanction. We have established relationships with SBI, PNB, Bank of Baroda, Union Bank, Axis Bank, HDFC Bank, and other major lenders' SME credit teams across the Delhi NCR region.</p>
    <div class="svc-modal-cta"><a href="#contact" class="btn-primary" onclick="closeSvcModal()">📅 Get CC Limit Prepared →</a><a href="https://wa.me/919716719137" target="_blank" class="btn-outline" onclick="closeSvcModal()">💬 WhatsApp Us</a></div>`
  },
};

function openSvcModal(serviceName) {
  const d = serviceDetails[serviceName];
  if (!d) return;
  document.getElementById('svcModalIcon').textContent = d.icon;
  document.getElementById('svcModalTitle').innerHTML = d.title;
  document.getElementById('svcModalBody').innerHTML = d.content;
  document.getElementById('svcModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSvcModal() {
  document.getElementById('svcModal').classList.remove('open');
  document.body.style.overflow = '';
}

// Bind service cards
document.querySelectorAll('.service-card').forEach(card => {
  const h3 = card.querySelector('h3');
  if (!h3) return;
  const name = h3.textContent.trim();
  if (serviceDetails[name]) {
    card.style.cursor = 'pointer';
    card.onclick = (e) => {
      if (!e.target.closest('.deadline-btn')) openSvcModal(name);
    };
  }
});

// ══════════════════════════════════════
// DEADLINE TICKER AUTO-SLIDE
// ══════════════════════════════════════
(function initTicker() {
  const tickerItems = deadlines.filter(d => d.deadline > new Date()).map(d => {
    const diff = d.deadline - new Date();
    const days = Math.floor(diff / 86400000);
    return { label: d.service.replace(/^[^a-zA-Z]+/, '').trim(), text: d.title.replace(/<[^>]+>/g, ''), days };
  });
  
  const container = document.getElementById('tickerSlides');
  if (!container || tickerItems.length === 0) return;
  
  tickerItems.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'ticker-slide' + (i === 0 ? ' active' : '');
    const urgentClass = item.days <= 7 ? 'color:#ef4444' : '';
    div.innerHTML = `<span class="ticker-service">${item.label}</span><span class="ticker-text">${item.text}</span><span class="ticker-deadline" style="${urgentClass}">⏰ ${item.days}d left</span>`;
    container.appendChild(div);
  });

  let current = 0;
  setInterval(() => {
    const slides = container.querySelectorAll('.ticker-slide');
    if (slides.length < 2) return;
    slides[current].classList.remove('active');
    slides[current].classList.add('exit');
    setTimeout(() => slides[current].classList.remove('exit'), 600);
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 3500);
})();

// ══════════════════════════════════════
// PRIVACY POLICY
// ══════════════════════════════════════
function openPrivacyModal() {
  document.getElementById('privacyModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePrivacyModal() {
  document.getElementById('privacyModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════
// ELIGIBILITY POPUP LOGIC (merged)
// ══════════════════════════════════════
(function initEligPopup() {
  var STORAGE_KEY = 'spb_elig_seen';
  var DAYS = 7;
  var ans = { type: null, turn: null, own: null };
  
  function $ (id) { return document.getElementById(id); }
  
  function saveToStorage() {
    try { localStorage.setItem(STORAGE_KEY, Date.now()); } catch(e) {}
  }
  function shouldShow() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return true;
      return (Date.now() - parseInt(saved)) > DAYS * 24 * 60 * 60 * 1000;
    } catch(e) { return true; }
  }
  
  function showEligStep(n) {
    ['es0','es1','es2','esres'].forEach(id => $('e' + id.slice(1)) && $(id).classList.remove('active'));
    $(n).classList.add('active');
    var dots = document.querySelectorAll('.elig-pd');
    var num = {es0:1,es1:2,es2:3,esres:3}[n];
    dots.forEach((d,i) => d.classList.toggle('on', i < num));
  }
  
  function openEligPopup() {
    $('eligibilityPopupOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    var tf = $('eligTfill');
    tf.style.animation = 'none';
    void tf.offsetWidth;
    tf.classList.add('go');
  }
  
  function closeEligPopup() {
    saveToStorage();
    $('eligibilityPopupOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }
  window.closeEligPopup = closeEligPopup;
  
  function showEligResult() {
    var mandatory = false, recommended = false;
    if (ans.own === 'psu') mandatory = true;
    else if (ans.type === 'trading') {
      if (ans.turn === 'vhigh' || ans.own === 'listed') mandatory = true;
      else recommended = true;
    } else {
      if (ans.turn === 'low') recommended = true;
      else mandatory = true;
    }
    var cls, icon, title, desc;
    if (mandatory) {
      cls = 'elig-r-red'; icon = '⚠️';
      title = 'Cost Audit is Mandatory for You!';
      desc = 'Under Companies Act 2013 Rules 2014, your company must get Cost Audit done by a registered Cost Accountant. Non-compliance can attract penalties up to ₹1 lakh. Consult us immediately.';
    } else if (recommended) {
      cls = 'elig-r-yel'; icon = '💡';
      title = 'Not Mandatory — But Recommended';
      desc = 'Cost Audit is not mandatory at your current scale, but voluntary cost audit can significantly improve bank financing prospects and cost optimization.';
    } else {
      cls = 'elig-r-grn'; icon = '✅';
      title = 'Cost Audit Not Required Currently';
      desc = 'Based on current thresholds, mandatory cost audit does not apply. We can still help with GST Audit, Internal Audit, or other compliance needs.';
    }
    $('eligRbox').innerHTML = '<div class="elig-rbox ' + cls + '"><div class="elig-rtitle">' + icon + ' ' + title + '</div><div class="elig-rdesc">' + desc + '</div></div>';
    saveToStorage();
    showEligStep('esres');
  }
  
  function setupEligSteps() {
    ['mfg','mining','pharma','trading'].forEach((k,i) => {
      $('eo0_' + i).onclick = function() {
        ans.type = k;
        document.querySelectorAll('#es0 .elig-ob').forEach(b => b.classList.remove('sel'));
        this.classList.add('sel');
        $('en0').disabled = false;
      };
    });
    $('en0').onclick = () => { if(ans.type) showEligStep('es1'); };
    
    ['low','mid','high','vhigh'].forEach((k,i) => {
      $('eo1_' + i).onclick = function() {
        ans.turn = k;
        document.querySelectorAll('#es1 .elig-ob').forEach(b => b.classList.remove('sel'));
        this.classList.add('sel');
        $('en1').disabled = false;
      };
    });
    $('en1').onclick = () => { if(ans.turn) showEligStep('es2'); };
    $('eb1').onclick = () => showEligStep('es0');
    
    ['listed','pvt','psu'].forEach((k,i) => {
      $('eo2_' + i).onclick = function() {
        ans.own = k;
        document.querySelectorAll('#es2 .elig-ob').forEach(b => b.classList.remove('sel'));
        this.classList.add('sel');
        $('en2').disabled = false;
      };
    });
    $('en2').onclick = () => { if(ans.own) showEligResult(); };
    $('eb2').onclick = () => showEligStep('es1');
    
    $('eligRstb').onclick = () => {
      ans = {type:null,turn:null,own:null};
      document.querySelectorAll('.elig-ob').forEach(b => b.classList.remove('sel'));
      ['en0','en1','en2'].forEach(id => $(id).disabled = true);
      showEligStep('es0');
    };
  }
  
  setupEligSteps();
  
  // Auto eligibility popup disabled. It should not appear without a user action.
})();
