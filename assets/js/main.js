// small interactivity: year, menu toggle, smooth scroll
document.addEventListener('DOMContentLoaded',()=>{
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.links');
  if(toggle && links){
    toggle.addEventListener('click',()=>{
      links.classList.toggle('open');
      links.style.display = links.classList.contains('open') ? 'flex' : '';
    });
  }

  // theme toggle (Bold Green <-> Deep Green)
  const THEME_KEY = 'site-theme';
  function applyTheme(theme){
    document.body.classList.remove('theme-bold-green','theme-deep-green');
    document.body.classList.add(`theme-${theme}`);
    document.querySelectorAll('#theme-toggle').forEach(btn=>{
      btn.textContent = theme==='bold-green' ? '☀️' : '🌲';
    });
  }
  const saved = localStorage.getItem(THEME_KEY) || 'bold-green';
  applyTheme(saved);
  document.querySelectorAll('#theme-toggle').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const next = document.body.classList.contains('theme-bold-green') ? 'deep-green' : 'bold-green';
      applyTheme(next);
      localStorage.setItem(THEME_KEY,next);
    });
  });

  // respect prefers-reduced-motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // smooth scroll for anchor links (skip if reduced motion)
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const href = a.getAttribute('href');
      if(href && href.startsWith('#') && href.length>1){
        e.preventDefault();
        const target = document.querySelector(href);
        if(target) target.scrollIntoView({behavior: reduced ? 'auto' : 'smooth'});
      }
    })
  })

  // Intersection observer for feature reveal
  if(!reduced && 'IntersectionObserver' in window){
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting) entry.target.classList.add('visible');
      })
    },{threshold:0.12});
    document.querySelectorAll('.feature').forEach((el,i)=>{
      el.style.transitionDelay = (i*80)+'ms';
      obs.observe(el);
    });
  } else {
    // if reduced motion or no observer, show features immediately
    document.querySelectorAll('.feature').forEach(el=>el.classList.add('visible'))
  }

  // fetch prayer times using geolocation when available (fallback to Mecca)
  const prayerList = document.getElementById('prayer-list');
  const prayerStatus = document.getElementById('prayer-status');
  function handlePrayerData(data){
    if(!(data && data.data && data.data.timings)){
      prayerStatus.textContent = 'Could not load prayer times.'; return;
    }
    const times = data.data.timings;
    prayerStatus.textContent = '';
    prayerList.innerHTML = '';
    for(const [name, time] of Object.entries(times)){
      if(['Fajr','Dhuhr','Asr','Maghrib','Isha'].includes(name)){
        const li = document.createElement('li');
        li.textContent = `${name}: ${time}`;
        prayerList.appendChild(li);
      }
    }
    // determine next prayer and start countdown
    const prayerOrder = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
    const nextNameEl = document.getElementById('next-name');
    const countdownEl = document.getElementById('countdown');
    let countdownTimer = null;
    function parseTimeStr(t){
      const cleaned = String(t).replace(/[^0-9:]/g,'');
      const [hh,mm] = cleaned.split(':').map(s=>parseInt(s,10));
      if(Number.isNaN(hh) || Number.isNaN(mm)) return null;
      const d = new Date(); d.setHours(hh,mm,0,0); return d;
    }
    function startCountdownTo(target, name){
      if(countdownTimer) clearInterval(countdownTimer);
      function tick(){
        const now = new Date();
        let diff = Math.max(0, target - now);
        const hrs = String(Math.floor(diff/3600000)).padStart(2,'0');
        const mins = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
        const secs = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
        if(countdownEl) countdownEl.textContent = `${hrs}:${mins}:${secs}`;
        if(nextNameEl) nextNameEl.textContent = name;
        if(diff<=0){ clearInterval(countdownTimer); }
      }
      tick();
      countdownTimer = setInterval(tick,1000);
    }
    (function findNext(){
      const now = new Date();
      let found = false;
      for(const p of prayerOrder){
        if(!times[p]) continue;
        const tDate = parseTimeStr(times[p]);
        if(!tDate) continue;
        if(tDate > now){ startCountdownTo(tDate, p); found=true; break; }
      }
      if(!found){
        const fajrTime = parseTimeStr(times['Fajr']);
        if(fajrTime){ fajrTime.setDate(fajrTime.getDate()+1); startCountdownTo(fajrTime,'Fajr'); }
      }
    })();
  }
  if(prayerList && prayerStatus){
    if(navigator.geolocation){
      const geoTimeout = setTimeout(()=>{
        // fallback after timeout
        fetch('https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=Saudi%20Arabia&method=2')
          .then(res=>res.json()).then(handlePrayerData).catch(err=>{console.error(err);prayerStatus.textContent='Error retrieving prayer times.'});
      },5000);
      navigator.geolocation.getCurrentPosition(pos=>{
        clearTimeout(geoTimeout);
        const {latitude,longitude} = pos.coords;
        fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`)
          .then(res=>res.json()).then(handlePrayerData).catch(err=>{console.error(err);prayerStatus.textContent='Error retrieving prayer times.'});
      },err=>{
        // permission denied or error -> fallback
        fetch('https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=Saudi%20Arabia&method=2')
          .then(res=>res.json()).then(handlePrayerData).catch(err=>{console.error(err);prayerStatus.textContent='Error retrieving prayer times.'});
      },{timeout:5000});
    } else {
      // no geolocation support
      fetch('https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=Saudi%20Arabia&method=2')
        .then(res=>res.json()).then(handlePrayerData).catch(err=>{console.error(err);prayerStatus.textContent='Error retrieving prayer times.'});
    }
  }

  // kente SVG pattern generator using Ghana colors
  function generateKenteSVG(){
    const colors = ['#ef4444','#f59e0b','#15803d','#1f2937','#fbbf24'];
    const rnd = (min, max) => Math.floor(Math.random()*(max-min+1))+min;
    const c1 = colors[rnd(0,colors.length-1)];
    const c2 = colors[rnd(0,colors.length-1)];
    const c3 = colors[rnd(0,colors.length-1)];
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='${encodeURIComponent(c1)}' width='400' height='300'/%3E%3Crect fill='${encodeURIComponent(c2)}' width='100' height='100' x='0' y='0'/%3E%3Crect fill='${encodeURIComponent(c3)}' width='100' height='100' x='100' y='100'/%3E%3Crect fill='${encodeURIComponent(c1)}' width='100' height='100' x='200' y='0'/%3E%3Crect fill='${encodeURIComponent(c2)}' width='100' height='100' x='300' y='100'/%3E%3Crect fill='${encodeURIComponent(c3)}' width='100' height='100' x='0' y='200'/%3E%3Crect fill='${encodeURIComponent(c1)}' width='100' height='100' x='200' y='200'/%3E%3Cline x1='0' y1='0' x2='400' y2='300' stroke='%23fff' stroke-width='2' opacity='0.1'/%3E%3Cline x1='400' y1='0' x2='0' y2='300' stroke='%23fff' stroke-width='2' opacity='0.1'/%3E%3C/svg%3E`;
  }
  if(document.body.classList.contains('resources')){
    const RESOURCES_KEY = 'custom-resources';
    const defaultResources = [
      {title:'Holy Quran',desc:'Read the Quran online or download translations.',url:'https://quran.com',query:'quran'},
      {title:'Hadith Collections',desc:'Explore authentic hadith narrations.',url:'https://sunnah.com',query:'hadith'},
      {title:'Articles & Essays',desc:'Faith-based articles and history.',url:'https://islamicfinder.org',query:'islamic calligraphy'},
      {title:'Tafsir & Commentary',desc:'Classical and modern tafsir resources.',url:'https://qtafsir.com',query:'tafsir'},
      {title:'Local Masajid',desc:'Find nearby masajid and community centers.',url:'https://masjidfinder.example',query:'mosque'}
    ];
    let customResources = JSON.parse(localStorage.getItem(RESOURCES_KEY) || '[]');
    let allResources = [...defaultResources, ...customResources];
    const grid = document.getElementById('resources-grid');
    const countEl = document.getElementById('resources-count');
    function render(list){
      grid.innerHTML='';
      if(!list || list.length===0){
        grid.innerHTML = '<p class="muted">No resources found.</p>';
        if(countEl) countEl.textContent = '0 results';
        return;
      }
      list.forEach(r=>{
        const link = document.createElement('a');
        link.href = r.url;
        link.target = '_blank';
        link.className = 'project card';
        const img = generateKenteSVG();
        link.innerHTML = `
          <img src="${img}" alt="${r.title}" style="background-color:#1f2937" />
          <h4>${r.title}</h4>
          <p class="muted">${r.desc}</p>
        `;
        grid.appendChild(link);
      });
      if(countEl) countEl.textContent = `${list.length} result${list.length>1?'s':''}`;
    }
    render(allResources);
    const searchInput = document.getElementById('resources-search');
    if(searchInput){
      searchInput.addEventListener('input',e=>{
        const q = String(e.target.value || '').trim().toLowerCase();
        if(q===''){ render(allResources); return; }
        const filtered = allResources.filter(r=>{
          return r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || (r.query && r.query.toLowerCase().includes(q));
        });
        render(filtered);
      });
    }
    // add resource form handler
    const addForm = document.getElementById('add-resource');
    if(addForm){
      addForm.addEventListener('submit',e=>{
        e.preventDefault();
        const title = (document.getElementById('res-title')?.value||'').trim();
        const desc = (document.getElementById('res-desc')?.value||'').trim();
        const url = (document.getElementById('res-url')?.value||'').trim();
        const status = document.getElementById('add-resource-status');
        if(!title || !desc || !url){ if(status) status.textContent='All fields required.'; return; }
        if(!url.startsWith('http')){ if(status) status.textContent='URL must start with http:// or https://'; return; }
        const newRes = {title,desc,url,query:title.toLowerCase()};
        customResources.push(newRes);
        localStorage.setItem(RESOURCES_KEY, JSON.stringify(customResources));
        allResources = [...defaultResources, ...customResources];
        render(allResources);
        if(status) status.textContent = `✓ Added "${title}"`;
        addForm.reset();
        setTimeout(()=>{ if(status) status.textContent=''; },3000);
      });
    }
  }

    // newsletter mock handler (per-form)
    document.querySelectorAll('form.newsletter').forEach(form=>{
      form.addEventListener('submit',e=>{
        e.preventDefault();
        const email = form.querySelector('input[type="email"]')?.value || '';
        const status = form.querySelector('#newsletter-status');
        if(status) status.textContent = `Thanks — subscription recorded for ${email} (mock)`;
        form.reset();
        setTimeout(()=>{ if(status) status.textContent = '' },4000);
      })
    });
});
