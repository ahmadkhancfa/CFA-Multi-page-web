// CFA Accountants — shared multi-page script
var PAGE_URLS={home:'/',services:'/services.html',accounting:'/accounting.html',advisory:'/advisory.html',tax:'/tax.html',insights:'/insights.html','blog-mileage':'/blog/hmrc-mileage-rate-increase-2026.html',faqs:'/faqs.html',about:'/about.html',contact:'/contact.html',privacy:'/privacy.html'};
function show(id){var u=PAGE_URLS[id];if(u)location.href=u;}
var svcPageMap={'svc-bookkeeping':'accounting','svc-payroll':'accounting','svc-annual':'accounting','svc-vat':'accounting','svc-fd':'accounting','svc-mgmt':'advisory','svc-tax':'advisory','svc-biz':'advisory','svc-corp':'advisory','tax-business':'tax','tax-personal':'tax','tax-compliance':'tax'};
function goService(id){var p=svcPageMap[id]||'accounting';location.href=PAGE_URLS[p]+'#'+id;}
function onNavScroll(){var n=document.querySelector('nav');if(!n)return;if(window.scrollY>40)n.classList.add('scrolled');else n.classList.remove('scrolled');}
window.addEventListener('scroll',onNavScroll,{passive:true});
function toggleTax(btn){var c=btn.closest('.tax-card');if(c)c.classList.toggle('open');}
function toggleFaq(btn){var i=btn.closest('.faq-item');if(i)i.classList.toggle('open');}
function toggleNav(){var m=document.getElementById('mobileNav');if(m)m.classList.toggle('open');}
function closeMobile(){var m=document.getElementById('mobileNav');if(m)m.classList.remove('open');}
function cvTab(name){document.querySelectorAll('.cv-tab').forEach(function(b){b.classList.remove('active');});document.querySelectorAll('.cv-tab').forEach(function(b){if(b.getAttribute('onclick')==="cvTab('"+name+"')")b.classList.add('active');});document.querySelectorAll('.cv-panel').forEach(function(p){p.classList.remove('cv-active');});var t=document.getElementById('cvPanel'+name.charAt(0).toUpperCase()+name.slice(1));if(t)t.classList.add('cv-active');}
function animateFades(){var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target);}});},{threshold:0.08});document.querySelectorAll('.fade:not(.in)').forEach(function(el){obs.observe(el);});}
function submitForm(btn){btn.textContent='Message Sent! \u2713';btn.style.background='#27ae60';setTimeout(function(){btn.textContent='Send Message';btn.style.background='';},3500);}
function checkAdminHash(){var btn=document.getElementById('galleryAdminBtn');if(!btn)return;if(window.location.hash==='#gallery-admin'){btn.style.display='flex';}else{btn.style.display='none';var p=document.getElementById('galleryAdminPanel');if(p)p.style.display='none';}}
function handleServiceHash(){var id=location.hash.replace('#','');if(!id)return;var el=document.getElementById(id);if(!el)return;el.classList.add('in');if(el.classList.contains('tax-card'))el.classList.add('open');el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('flash');setTimeout(function(){el.classList.remove('flash');},1900);}
document.addEventListener('DOMContentLoaded',function(){onNavScroll();setTimeout(animateFades,150);if(document.querySelector('.cv-tab'))cvTab('values');checkAdminHash();window.addEventListener('hashchange',checkAdminHash);setTimeout(handleServiceHash,400);});
