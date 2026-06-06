(function(){
  const contactBtn = "<a class='cfa-inline-btn' onclick=\"cfaGo('contact')\">Get in touch</a>";

  // Published insights — add a new line here whenever you post an article.
  const INSIGHTS = [
    { title:'HMRC Raises Mileage Rate to 55p', page:'blog-mileage', date:'June 2026' },
    { title:'Great British Summer Savings 2026: What the New VAT Relief Means for Your Business', url:'/blog/summer-savings-vat-relief-2026', date:'June 2026' }
  ];
  function insightsHTML(){
    if(!INSIGHTS.length) return "We haven't published any articles just yet — check back soon!";
    let h = "Here's what we've posted recently:";
    INSIGHTS.forEach(it=>{
      if(it.url){
        h += "<br>• <a href='"+it.url+"'>"+it.title+"</a> <span style='color:var(--text-light);font-size:.76rem'>("+it.date+")</span>";
      } else {
        h += "<br>• <a onclick=\"cfaGo('"+it.page+"')\">"+it.title+"</a> <span style='color:var(--text-light);font-size:.76rem'>("+it.date+")</span>";
      }
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
    { k:['summer','summer savings','vat relief','5%','5 percent','family attraction','children meal','hospitality vat'],
      a:"The government has announced a temporary VAT cut from 20% to 5% on qualifying children's meals and family attraction tickets, running from 25 June to 1 September 2026. Hospitality venues and entertainment businesses need to update their till systems and accounting software before 25 June.<br><a href='/blog/summer-savings-vat-relief-2026'>Read our full guide →</a>" },
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
      a:"The VAT registration threshold is £90,000 for the 2026 tax year. You must register if your taxable sales cross £90,000 in any rolling 12-month period, or if you expect to in the next 30 days. We can monitor this for you.<br><a onclick=\"cfaGo('faqs')\">More in our FAQs →</a>" },
    { k:['corporation tax','company tax','19%','25%','marginal','profit rate'],
      a:"Corporation Tax depends on profit: 19% under £50,000, 25% over £250,000, and a sliding 'marginal relief' band in between. We help plan around these thresholds.<br><a onclick=\"cfaGo('faqs')\">See the FAQ →</a>" },
    { k:['company car','electric car','ev','car through','buy a car'],
      a:"It depends on the vehicle. A petrol/diesel car through a limited company usually creates high personal tax, but a fully electric car leased through the business can cut your tax bill. We'll review the exact models you're considering.<br><a onclick=\"cfaGo('faqs')\">Read more →</a>" },
    { k:['capital allowance','equipment','machinery','assets','write off'],
      a:"Capital allowances give you tax relief on business equipment — computers, furniture, machinery, tools and vans. We check your receipts so you don't miss savings.<br><a onclick=\"cfaGo('faqs')\">FAQ details →</a>" },
    { k:['r&d','research','development','rd tax','innovation'],
      a:"You don't need a lab to qualify for R&D tax credits — if you spend time solving a technical problem, you may be eligible. We can review your project to check.<br><a onclick=\"cfaGo('faqs')\">More on R&D →</a>" },
    { k:['share','emi','employee shares','equity','incentive'],
      a:"The Enterprise Management Incentive (EMI) scheme is the most popular way to give your team shares with excellent tax benefits. We handle the legal setup and compliance.<br><a onclick=\"cfaGo('faqs')\">Read the FAQ →</a>" },
    { k:['sell','selling','exit','cgt','capital gains','sale of business'],
      a:"Selling involves Capital Gains Tax and Corporation Tax, and the bill differs for an asset sale vs a share sale. Planning early often unlocks reliefs that cut the rate sharply.<br><a onclick=\"cfaGo('faqs')\">See the FAQ →</a>" },
    { k:['cis','construction','subcontractor'],
      a:"If you work in construction as a contractor or subcontractor you'll need to register for the Construction Industry Scheme (CIS). We handle worker verification, deductions and monthly returns.<br><a onclick=\"cfaGo('faqs')\">CIS FAQ →</a>" },
    { k:['inheritance','iht','estate','325000','325,000','passes away','death'],
      a:"Inheritance Tax has a £325,000 tax-free band; value above that is usually taxed at 40%. There are legal ways to plan ahead and protect your family.<br><a onclick=\"cfaGo('faqs')\">Read more →</a>" },
    { k:['making tax digital','mtd'],
      a:"Making Tax Digital (MTD) requires digital VAT records and submissions. We set up MTD-compliant systems and handle your quarterly digital filings.<br><a onclick=\"cfaGo('accounting')\">More on VAT & MTD →</a>" },
    { k:['switch','change accountant','move','transfer','leave old'],
      a:"Switching to us takes zero effort on your side. You just email your old firm to say you're moving, and we handle the entire handover.<br><a class='cfa-inline-btn' onclick=\"cfaGo('contact')\">Start the switch</a>" },
    { k:['sole trader','self employed','self-employed','freelance','freelancer'],
      a:"Yes — we work with sole traders and the self-employed, from bookkeeping and Self Assessment to lowering your tax bill.<br><a onclick=\"cfaGo('tax')\">Tax for individuals →</a>" },
    { k:['limited company','ltd','startup','start up','small business','business owner'],
      a:"Absolutely. We support limited companies with year-end accounts, Corporation Tax, payroll, VAT and advisory.<br><a onclick=\"cfaGo('services')\">See services →</a>" },
    { k:['software','xero','quickbooks','cloud','app'],
      a:"We work with modern cloud accounting tools like Xero and QuickBooks, including receipt capture and automated bank reconciliation." },
    { k:['deadline','due date','when is','31 january','filing'],
      a:"Key dates vary by filing — for example, the Self Assessment deadline is 31 January. We keep you well ahead of every deadline. Want us to check your specific dates? "+contactBtn },
    { k:['dedicated','my accountant','same person','point of contact','who handles'],
      a:"Yes — no call centres. We match every business with a specific Manchester accountant who knows your name and manages your files personally." },
    { k:['law firm','solicitor','sra','legal practice','client money','conveyancing'],
      a:"We're specialists in accounting for law firms and solicitors — SRA Accounts Rules compliance, client money reconciliations, partner drawings and management accounts.<br><a href='/accountants-for-law-firms-manchester'>Accountants for Law Firms →</a>" },
    { k:['dentist','dental','nhs dental','private dental','dental practice'],
      a:"We support NHS and private dental practices with bookkeeping, NHS and private income tracking, payroll, tax planning and annual accounts.<br><a href='/accountants-for-dentists-manchester'>Accountants for Dentists →</a>" },
    { k:['contractor','ir35','inside ir35','outside ir35','limited company contractor','freelancer tax'],
      a:"We're IR35 specialists — we advise contractors on inside/outside IR35 status, limited company accounts, dividend planning and self-assessment.<br><a href='/contractor-accountants-manchester'>Contractor Accountants →</a>" },
    { k:['ecommerce','shopify','amazon','online seller','ebay','etsy','stripe reconciliation','stock accounting'],
      a:"We support Shopify, Amazon and online sellers with multi-channel bookkeeping, stock accounting, VAT compliance, payment reconciliation and profit analysis.<br><a href='/ecommerce-accountants-manchester'>Ecommerce Accountants →</a>" },
    { k:['property','landlord','rental','buy to let','portfolio','cgt property','section 24','mortgage interest'],
      a:"We support property investors and landlords with rental accounting, self-assessment, CGT planning, portfolio structuring and mortgage interest planning (Section 24).<br><a href='/property-accountants-manchester'>Property Accountants →</a>" },
    { k:['industry','sector','specialist','niche'],
      a:"We have dedicated teams for five sectors:<br>• <a href='/accountants-for-law-firms-manchester'>Law Firms & Solicitors</a><br>• <a href='/accountants-for-dentists-manchester'>Dentists & Dental Practices</a><br>• <a href='/contractor-accountants-manchester'>Contractors & Freelancers</a><br>• <a href='/ecommerce-accountants-manchester'>Ecommerce Businesses</a><br>• <a href='/property-accountants-manchester'>Property Investors</a>" },
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
