(function(){
  const contactBtn = "<a class='cfa-inline-btn' onclick=\"cfaGo('contact')\">Get in touch</a>";

  // Published insights — add a new line here whenever you post an article.
  const INSIGHTS = [
    { title:'HMRC Raises Mileage Rate to 55p', page:'blog-mileage', date:'June 2026' }
  ];
  function insightsHTML(){
    if(!INSIGHTS.length) return "We haven't published any articles just yet — check back soon!";
    let h = "Here's what we've posted recently:";
    INSIGHTS.forEach(it=>{
      h += "<br>• <a onclick=\"cfaGo('"+it.page+"')\">"+it.title+"</a> <span style='color:var(--text-light);font-size:.76rem'>("+it.date+")</span>";
    });
    h += "<br><a onclick=\"cfaGo('insights')\">See all insights →</a>";
    return h;
  }

  // Knowledge base — keyword sets mapped to answers (answers may include HTML actions)
  const KB = [
    { k:['service','offer','do you','help with','what can'],
      a:"We work across three areas:<br>• <b>Accounting & Compliance</b> — bookkeeping, payroll, VAT, year-end accounts<br>• <b>Advisory & Growth</b> — management accounts, business advisory, corporate finance<br>• <b>Tax Advice & Planning</b> — personal, business and director tax<br><a onclick=\"cfaGo('services')\">See all services →</a>" },
    { k:['account','bookkeep','year end','year-end','compliance'],
      a:"Our Accounting & Compliance service covers cloud bookkeeping (Xero/QuickBooks), payroll & PAYE, VAT/Making Tax Digital, and statutory year-end accounts.<br><a onclick=\"cfaGo('accounting')\">View Accounting & Compliance →</a>" },
    { k:['tax','hmrc','self assessment','self-assessment'],
      a:"We handle personal, business and director tax — planning, returns, and HMRC enquiries.<br><a onclick=\"cfaGo('tax')\">View Tax Advice & Planning →</a>" },
    { k:['advisory','growth','management account','forecast','corporate finance','valuation'],
      a:"Our Advisory & Growth service includes management accounts, KPI dashboards, business advisory and corporate finance.<br><a onclick=\"cfaGo('advisory')\">View Advisory Services →</a>" },
    { k:['mileage','55p','amap','45p'],
      a:"HMRC raised the business mileage rate to 55p per mile (from 45p) — the first rise in 15 years. We've written a full guide with examples for employers and sole traders.<br><a onclick=\"cfaGo('blog-mileage')\">Read the 55p mileage guide →</a>" },
    { k:['price','cost','fee','quote','how much','pricing','charge','monthly'],
      a:"We don't use cookie-cutter pricing — your monthly quote is built around your bank accounts, staff numbers and the software support you need. You get a clear fixed monthly cost with no surprise bills for a quick question.<br><a class='cfa-inline-btn' onclick=\"cfaGo('contact')\">Get a quote</a>" },
    { k:['book','consult','appointment','meeting','call me','get started','sign up'],
      a:"Happy to set that up. You can book a free consultation through our contact page.<br><a class='cfa-inline-btn' onclick=\"cfaGo('contact')\">Book a free consultation</a>" },
    { k:['where','located','location','address','based','office','manchester','salford'],
      a:"We're based at Salford Innovation Forum, 51 Frederick Rd, Salford, M6 6FP — serving Manchester and beyond." },
    { k:['contact','phone','call','email','reach','speak'],
      a:"You can reach us on:<br>📞 <a href='tel:+447440290584'>+44 7440 290584</a><br>✉️ <a href='mailto:cfa@cfaaccountants.com'>cfa@cfaaccountants.com</a><br><a onclick=\"cfaGo('contact')\">Contact page →</a>" },
    { k:['blog','insight','article','news','update','what is new','whats new','what\'s new','latest','recent','posted','published'],
      a: insightsHTML() },
    { k:['faq','question','common','frequently'],
      a:"We've answered the questions we get asked most — on company cars, VAT, Corporation Tax, payroll, switching accountants and more.<br><a class='cfa-inline-btn' onclick=\"cfaGo('faqs')\">Browse all FAQs</a>" },
    { k:['vat','threshold','register','90000','90,000','£90'],
      a:"The VAT registration threshold is £90,000 for the 2026 tax year. You must register if your taxable sales cross £90,000 in any rolling 12-month period (checked monthly), or if you expect to in the next 30 days. We can monitor this for you.<br><a onclick=\"cfaGo('faqs')\">More in our FAQs →</a>" },
    { k:['corporation tax','company tax','19%','25%','marginal','profit rate'],
      a:"Corporation Tax depends on profit: 19% under £50,000, 25% over £250,000, and a sliding 'marginal relief' band in between (an effective rate up to 26.5%). We help plan around these thresholds.<br><a onclick=\"cfaGo('faqs')\">See the FAQ →</a>" },
    { k:['company car','electric car','ev','car through','buy a car'],
      a:"It depends on the vehicle. A petrol/diesel car through a limited company usually creates high personal tax, but a fully electric car leased through the business can cut your tax bill (VAT reclaim + lease deductions). We'll review the exact models you're considering.<br><a onclick=\"cfaGo('faqs')\">Read more →</a>" },
    { k:['capital allowance','equipment','machinery','assets','write off'],
      a:"Capital allowances give you tax relief on business equipment — computers, furniture, machinery, tools and vans, and sometimes commercial building works. We check your receipts so you don't miss savings.<br><a onclick=\"cfaGo('faqs')\">FAQ details →</a>" },
    { k:['r&d','research','development','rd tax','innovation'],
      a:"You don't need a lab to qualify for R&D tax credits — if you spend time and money solving a technical problem (custom software, prototypes, improving a process), you may be eligible. We can review your project to check.<br><a onclick=\"cfaGo('faqs')\">More on R&D →</a>" },
    { k:['share','emi','employee shares','equity','incentive'],
      a:"The Enterprise Management Incentive (EMI) scheme is the most popular way to give your team shares with excellent tax benefits for both sides. We handle the legal setup and compliance.<br><a onclick=\"cfaGo('faqs')\">Read the FAQ →</a>" },
    { k:['sell','selling','exit','cgt','capital gains','sale of business'],
      a:"Selling involves Capital Gains Tax and Corporation Tax, and the bill differs for an asset sale vs a share sale. Planning early often unlocks reliefs that cut the rate sharply. We structure the sale to protect your wealth.<br><a onclick=\"cfaGo('faqs')\">See the FAQ →</a>" },
    { k:['cis','construction','subcontractor','contractor'],
      a:"If you work in construction as a contractor or subcontractor you'll likely need to register for the Construction Industry Scheme (CIS). We handle worker verification, deductions and the monthly returns so you avoid penalties.<br><a onclick=\"cfaGo('faqs')\">CIS FAQ →</a>" },
    { k:['inheritance','iht','estate','325000','325,000','passes away','death'],
      a:"Inheritance Tax has a £325,000 tax-free band (with extra allowance when leaving a home to children); value above that is usually taxed at 40%. There are legal ways to plan ahead and protect your family.<br><a onclick=\"cfaGo('faqs')\">Read more →</a>" },
    { k:['making tax digital','mtd'],
      a:"Making Tax Digital (MTD) requires digital VAT records and submissions. We set up MTD-compliant systems and handle your quarterly digital filings.<br><a onclick=\"cfaGo('accounting')\">More on VAT & MTD →</a>" },
    { k:['switch','change accountant','move','transfer','leave old'],
      a:"Switching to us takes zero effort on your side — no awkward conversations. You just email your old firm to say you're moving, and we handle the entire handover and collect your records.<br><a class='cfa-inline-btn' onclick=\"cfaGo('contact')\">Start the switch</a>" },
    { k:['sole trader','self employed','self-employed','freelance','freelancer'],
      a:"Yes — we work with sole traders and the self-employed, from bookkeeping and Self Assessment to using allowances (like the new 55p mileage rate) to lower your tax bill.<br><a onclick=\"cfaGo('tax')\">Tax for individuals →</a>" },
    { k:['limited company','ltd','startup','start up','small business','business owner'],
      a:"Absolutely. We support limited companies and growing businesses with year-end accounts, Corporation Tax, payroll, VAT and advisory.<br><a onclick=\"cfaGo('services')\">See services →</a>" },
    { k:['software','xero','quickbooks','cloud','app'],
      a:"We work with modern cloud accounting tools like Xero and QuickBooks, including receipt capture and automated bank reconciliation, and we'll train your team to use them." },
    { k:['deadline','due date','when is','31 january','filing'],
      a:"Key dates vary by filing — for example, the Self Assessment deadline is 31 January. We keep you well ahead of every deadline. Want us to check your specific dates? "+contactBtn },
    { k:['dedicated','my accountant','same person','point of contact','who handles'],
      a:"Yes — no call centres or shared helpdesks. We match every business owner with a specific Manchester accountant who knows your name and your business, and manages your files personally." },
    { k:['when to hire','need an accountant','should i','first accountant'],
      a:"It's smart to bring in help right at the start so you pick the best structure — and especially once payroll, VAT and receipts start eating your evenings. We take the admin so you can focus on your business.<br>"+contactBtn },
    { k:['who are you','about','experience','qualified','certified','team','trust','chartered'],
      a:"CFA Accountants is a Manchester-based firm of chartered certified accountants offering modern, tech-forward accounting and advisory built on trust and transparency.<br><a onclick=\"cfaGo('about')\">About us →</a>" },
    { k:['payroll','paye','wages','employee','staff','pension'],
      a:"We run end-to-end payroll — PAYE setup, RTI submissions to HMRC, payslips, auto-enrolment pensions, and starter/leaver paperwork.<br><a onclick=\"cfaGo('accounting')\">Payroll details →</a>" },
    { k:['hours','open','available','response','reply','how long'],
      a:"We aim to respond promptly during business hours. The best way to reach us is by phone or email.<br>📞 <a href='tel:+447440290584'>+44 7440 290584</a> · ✉️ <a href='mailto:cfa@cfaaccountants.com'>cfa@cfaaccountants.com</a>" },
    { k:['human','person','agent','real','someone','talk to'],
      a:"Of course — you'll always talk to a real person here in Manchester.<br>📞 <a href='tel:+447440290584'>+44 7440 290584</a><br>✉️ <a href='mailto:cfa@cfaaccountants.com'>cfa@cfaaccountants.com</a><br>"+contactBtn },
    { k:['hi','hello','hey','good morning','good afternoon'],
      a:"Hi there! 👋 I can help with questions about our services, tax, fees, FAQs, or booking a consultation. What would you like to know?" },
    { k:['thank','thanks','cheers','ta'],
      a:"You're welcome! If there's anything else, just ask — or reach the team any time on "+'<a href=\'tel:+447440290584\'>+44 7440 290584</a>.' }
  ];

  const CHIPS = [
    ['Your services','what services do you offer'],
    ['Tax help','tax'],
    ['Fees','how much do you charge'],
    ["What's new",'what is new insights'],
    ['FAQs','faq common questions'],
    ['Where are you based','where are you based']
  ];

  let greeted = false;

  function body(){ return document.getElementById('cfaChatBody'); }

  function addMsg(html, who){
    const m = document.createElement('div');
    m.className = 'cfa-msg ' + who;
    m.innerHTML = html;
    body().appendChild(m);
    body().scrollTop = body().scrollHeight;
  }

  function renderChips(){
    const wrap = document.getElementById('cfaChips');
    wrap.innerHTML = '';
    CHIPS.forEach(([label,q])=>{
      const b = document.createElement('button');
      b.className = 'cfa-chip';
      b.textContent = label;
      b.onclick = ()=>{ addMsg(label,'user'); respond(q); };
      wrap.appendChild(b);
    });
  }

  function respond(text){
    const t = text.toLowerCase();
    let best = null, bestScore = 0;
    KB.forEach(item=>{
      const score = item.k.reduce((s,kw)=> t.includes(kw) ? s+1 : s, 0);
      if(score > bestScore){ bestScore = score; best = item; }
    });
    const reply = best ? best.a :
      "I'm not sure I caught that, but I can help with our services, tax, fees, FAQs, or booking a consultation. You might find your answer in our FAQs, or reach the team directly:<br><a onclick=\"cfaGo('faqs')\">Browse FAQs →</a><br><a class='cfa-inline-btn' onclick=\"cfaGo('contact')\">Get in touch</a>";
    setTimeout(()=>addMsg(reply,'bot'), 280);
  }

  window.cfaSend = function(){
    const inp = document.getElementById('cfaChatInput');
    const v = inp.value.trim();
    if(!v) return;
    addMsg(v,'user');
    inp.value = '';
    respond(v);
  };

  window.cfaGo = function(page){
    if(typeof show === 'function') show(page);
    cfaToggleChat(false);
  };

  window.cfaToggleChat = function(force){
    const chat = document.getElementById('cfaChat');
    const wrap = document.getElementById('cfaFabWrap');
    const open = force === undefined ? !chat.classList.contains('open') : force;
    chat.classList.toggle('open', open);
    wrap.classList.toggle('open', open);
    if(open){
      document.getElementById('cfaFabBadge').style.display = 'none';
      if(!greeted){
        greeted = true;
        renderChips();
        addMsg("Hi! 👋 I'm the CFA Assistant. Ask me about our services, tax, fees or booking a consultation — or tap a topic below.", 'bot');
      }
      setTimeout(()=>document.getElementById('cfaChatInput').focus(), 300);
    }
  };
})();
