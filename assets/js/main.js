(function(){const root=document.documentElement;const THEME_KEY='memorial-theme';const navToggle=document.querySelector('.nav-toggle');const nav=document.getElementById('site-nav');const themeBtn=document.getElementById('themeToggle');function setTheme(mode){root.setAttribute('data-theme',mode);try{localStorage.setItem(THEME_KEY,mode);}catch(e){}}function loadTheme(){try{const saved=localStorage.getItem(THEME_KEY);if(saved){setTheme(saved);return;}}catch(e){}setTheme('dark');}function initThemeToggle(){if(!themeBtn)return;themeBtn.addEventListener('click',()=>{const current=root.getAttribute('data-theme')||'dark';setTheme(current==='dark'?'light':'dark');});}function initNav(){if(!navToggle||!nav)return;navToggle.addEventListener('click',()=>{const isOpen=nav.classList.toggle('open');navToggle.setAttribute('aria-expanded',String(isOpen));});document.addEventListener('click',(e)=>{if(!nav.contains(e.target)&&!navToggle.contains(e.target)){nav.classList.remove('open');navToggle.setAttribute('aria-expanded','false');}});}function renderCondolences(listEl,items){listEl.innerHTML='';items.forEach(it=>{const el=document.createElement('div');el.className='condolence-item';el.innerHTML=`<div class="meta">${it.name?escapeHtml(it.name):'Anonymous'}${it.location?` • ${escapeHtml(it.location)}`:''} — <time datetime="${new Date(it.ts).toISOString()}">${new Date(it.ts).toLocaleString()}</time></div><div class="message">${escapeHtml(it.message)}</div>`;listEl.appendChild(el);});}function escapeHtml(str){return String(str).replace(/[&<>\"]+/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));}function initCondolences(){const form=document.getElementById('condolenceForm');const list=document.getElementById('condolenceList');if(!form||!list)return;const KEY='condolences-v1';function getAll(){try{return JSON.parse(localStorage.getItem(KEY))||[];}catch(e){return []}}function saveAll(items){try{localStorage.setItem(KEY,JSON.stringify(items));}catch(e){}}let items=getAll();renderCondolences(list,items);form.addEventListener('submit',(e)=>{e.preventDefault();const fd=new FormData(form);const name=(fd.get('name')||'').toString().trim();const location=(fd.get('location')||'').toString().trim();const message=(fd.get('message')||'').toString().trim();if(!message){return}const entry={name,location,message,ts:Date.now()};items=[entry,...items].slice(0,200);saveAll(items);form.reset();renderCondolences(list,items);list.scrollIntoView({behavior:'smooth',block:'start'});});}
function initLocalMasonry(){
  const container=document.getElementById('localMasonry');
  if(!container)return;
  const IMGS_PATH='imgs/';
  const EXTENSIONS=['.jpg','.jpeg','.png','.gif','.webp','.bmp','.svg'];
  const hasValidExt=(href)=>{
    const clean=(href||'').split('?')[0].split('#')[0].toLowerCase();
    return EXTENSIONS.some(ext=>clean.endsWith(ext));
  };
  const makeSrc=(href)=>{
    if(!href)return null;
    if(/^https?:\/\//i.test(href) || href.startsWith('data:')) return href;
    // Compute base path for current project (e.g., /raila-tribute-page/)
    const base=window.location.pathname.replace(/[^\/]+$/,'');
    // Absolute path from server root (e.g., /imgs/file.jpg) -> map into current base
    if(href.startsWith('/')) return base + href.replace(/^\//,'');
    // Already points to imgs/ or relative dot notation
    if(/^\.\.\/|^\.\//.test(href)) href=href.replace(/^\.\/?/,'');
    if(href.startsWith('imgs/')) return href;
    // Plain filename -> prefix with IMGS_PATH
    return IMGS_PATH + href.replace(/^\/?/,'');
  };
  fetch(IMGS_PATH,{headers:{'Accept':'text/html'}})
    .then(r=>{if(!r.ok) throw new Error('Failed to list imgs/'); return r.text();})
    .then(html=>{
      const tmp=document.createElement('div');
      tmp.innerHTML=html;
      const anchors=[...tmp.querySelectorAll('a')];
      const hrefs=anchors.map(a=>a.getAttribute('href')||'');
      const files=hrefs.filter(hasValidExt);
      if(files.length===0){
        container.innerHTML='<p class="note">No images found in <code>imgs/</code>.</p>';
        return;
      }
      const frag=document.createDocumentFragment();
      files.forEach(href=>{
        const src=makeSrc(href);
        if(!src) return;
        const fig=document.createElement('figure');
        fig.className='masonry-item';
        const img=new Image();
        img.alt=decodeURIComponent((href||'').split('/').pop());
        img.loading='lazy';
        img.src=src;
        fig.appendChild(img);
        frag.appendChild(fig);
      });
      container.innerHTML='';
      container.appendChild(frag);
    })
    .catch(()=>{
      container.innerHTML='<p class="note">Unable to auto-load images.</p>';
    });
}
document.addEventListener('DOMContentLoaded',()=>{loadTheme();initThemeToggle();initNav();initCondolences();
  initLocalMasonry();
});})();
