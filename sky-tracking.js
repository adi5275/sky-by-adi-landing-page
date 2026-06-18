/* ============================================================
   SKY BY ADI - מעקב + הסכמת עוגיות (consent-gated)
   הפיקסלים נטענים אך ורק לאחר אישור הגולשת בבאנר העוגיות.
   ============================================================ */
(function(){
  // ====== עדי: הדביקי כאן את המזהים האמיתיים ======
  var SKY_FB_PIXEL_ID = 'FB_PIXEL_ID';   // מזהה Meta / Facebook Pixel
  var SKY_GA4_ID      = 'GA4_ID';        // מזהה Google Analytics 4 (בפורמט G-XXXXXXX)
  // ===============================================

  var KEY = 'sky_cookie_consent';
  function consent(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function setConsent(v){ try{ localStorage.setItem(KEY, v); }catch(e){} }
  function ready(id){ return id && id.indexOf('_ID') === -1 && id !== 'GA4_ID'; }

  function loadFB(){
    if(!ready(SKY_FB_PIXEL_ID) || window.fbq) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', SKY_FB_PIXEL_ID);
    window.fbq('track','PageView');
  }
  function loadGA(){
    if(!ready(SKY_GA4_ID) || window.gtag) return;
    var s=document.createElement('script'); s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+SKY_GA4_ID; document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[]; window.gtag=function(){dataLayer.push(arguments)};
    window.gtag('js', new Date()); window.gtag('config', SKY_GA4_ID);
  }
  function loadTrackers(){ loadFB(); loadGA(); }

  /* קריאה ידנית לאירוע המרה (נטען רק אם ניתנה הסכמה) - לדוגמה: skyTrack('Lead') */
  window.skyTrack = function(event, params){
    if(consent() !== 'granted') return;
    if(window.fbq)  window.fbq('track', event, params || {});
    if(window.gtag) window.gtag('event', event, params || {});
  };

  function hideBanner(){ var b=document.getElementById('sky-cookie'); if(b&&b.parentNode) b.parentNode.removeChild(b); }
  function showBanner(){
    if(document.getElementById('sky-cookie')) return;
    var d=document.createElement('div'); d.id='sky-cookie';
    d.setAttribute('role','dialog'); d.setAttribute('aria-label','הודעת עוגיות');
    d.innerHTML='<div class="skc-in"><p>אנחנו משתמשות בעוגיות כדי לשפר את החוויה ולמדוד את ביצועי הקמפיינים. ההסכמה אינה חובה. <a href="cookie-policy.html">מדיניות העוגיות</a></p><div class="skc-btns"><button type="button" id="skc-no">לא, תודה</button><button type="button" id="skc-yes">אני מאשרת</button></div></div>';
    document.body.appendChild(d);
    document.getElementById('skc-yes').onclick=function(){ setConsent('granted'); hideBanner(); loadTrackers(); };
    document.getElementById('skc-no').onclick =function(){ setConsent('denied');  hideBanner(); };
  }

  var css='#sky-cookie{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#21380F;color:#EAF0E0;font-family:Heebo,Arial,sans-serif;direction:rtl;box-shadow:0 -10px 30px -12px rgba(0,0,0,.45)}'
   +'#sky-cookie .skc-in{max-width:1100px;margin:0 auto;padding:15px 22px;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}'
   +'#sky-cookie p{font-size:.92rem;margin:0;line-height:1.6;flex:1 1 320px}'
   +'#sky-cookie a{color:#DCC594;font-weight:700;text-decoration:underline}'
   +'#sky-cookie .skc-btns{display:flex;gap:10px;flex:0 0 auto}'
   +'#sky-cookie button{font-family:inherit;font-weight:700;font-size:.92rem;padding:10px 22px;border-radius:8px;cursor:pointer;border:1px solid rgba(220,197,148,.5);background:transparent;color:#EAF0E0;transition:transform .15s ease,filter .15s ease}'
   +'#sky-cookie #skc-yes{background:linear-gradient(135deg,#C2A060,#A8843E);border-color:transparent;color:#fff}'
   +'#sky-cookie button:hover{transform:translateY(-1px);filter:brightness(1.05)}'
   +'@media(max-width:560px){#sky-cookie .skc-in{flex-direction:column;align-items:stretch;text-align:center}#sky-cookie .skc-btns{justify-content:center}}';

  function init(){
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    var c=consent();
    if(c==='granted') loadTrackers();
    else if(c!=='denied') showBanner();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
