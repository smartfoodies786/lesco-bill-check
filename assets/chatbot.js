/* Bijli Baji — LESCO Bill Dost (corner chatbot)
   Text-only, rule-based, no backend. Runs fully in the browser.
   NEVER asks for, collects, stores, or sends reference numbers,
   Customer IDs, CNICs, or phone numbers. No fetch, no XHR, no
   beacon, no localStorage, no cookies, no external calls. */
(function () {
  'use strict';

  var widget = document.getElementById('bb-widget');
  if (!widget) { return; }
  var button = document.getElementById('bb-button');
  var panel = document.getElementById('bb-panel');
  var closeBtn = document.getElementById('bb-close');
  var messages = document.getElementById('bb-messages');
  var quickBox = document.getElementById('bb-quick');
  var form = document.getElementById('bb-form');
  var input = document.getElementById('bb-input');

  /* Canned answers. Links point to pages on this site only. */
  var ANSWERS = [
    {
      keys: ['reference', 'ref no', 'ref number', 'number kahan', 'kahan hai', 'kahan se mile'],
      html: 'Aapka 14-digit reference number paper bill ke <strong>top-left</strong> par hota hai, barcode ke upar, “Ref No” likha hota hai. 2 digit batch + 5 digit sub-division + 7 digit reference. Poori tafseel: <a href="lesco-reference-number.html">Reference Number guide</a>.'
    },
    {
      keys: ['kaise check', 'check karein', 'check karna', 'bill check', 'bill dekhna', 'bill nikalna'],
      html: 'Bill check karne ke liye: reference number aur U/R is page ke checker box mein daalein, phir Check Bill dabayein — official PITC portal khul jayega. Step by step: <a href="how-to-check-lesco-bill-online.html">How to Check LESCO Bill Online</a>.'
    },
    {
      keys: ['paid status', 'paid ya nahi', 'jama hua', 'pay ho gaya', 'bill paid', 'paid'],
      html: 'Bill paid hai ya nahi — agle bill ki arrears line dekhein: agar pichla bill poora aur waqt par pay hua tha to koi arrears nahi honge. Receipt aur transaction ID 6 mahine sambhal kar rakhein. Poora tareeqa: <a href="lesco-bill-paid-status.html">How to Check If Your LESCO Bill Is Paid</a>.'
    },
    {
      keys: ['pay', 'payment', 'jama', 'ada', 'jazzcash', 'easypaisa', 'bank'],
      html: 'Bill JazzCash, Easypaisa, 1LINK bank app, ATM, bank counter ya post office se pay kar sakte hain. Due date se pehle pay karein — late par 10% surcharge lagta hai. Poora guide: <a href="how-to-pay-lesco-bill-online.html">How to Pay LESCO Bill Online</a>.'
    },
    {
      keys: ['protected', 'unprotected', 'slab'],
      html: 'Protected ya unprotected hona aapke pichle mahino ke units par depend karta hai — 200 units se zyada istemal par protected status khatam ho sakta hai. Poora rule: <a href="lesco-protected-vs-unprotected.html">Protected vs Unprotected</a>.'
    },
    {
      keys: ['complaint', 'shikayat', 'helpline', '118', 'galat bill', 'wrong bill', 'overbilling', 'zyada bill'],
      html: 'Galat bill ya shikayat ke liye LESCO helpline <strong>118</strong> par call karein, ya CCMS+ par complaint file karein (ccms.pitc.com.pk/complaint). Tafseel: <a href="lesco-wrong-bill-complaint.html">Wrong Bill Complaint</a>.'
    },
    {
      keys: ['nahi aa raha', 'not showing', 'no record', 'record not found', 'bill nahi', 'bill kab', 'kab aayega'],
      html: 'Bill aam tor par generate hone ke 24–48 ghante baad online aata hai (bills 1–10 tareekh ke darmiyan bante hain). Pehle 14 digits aur U/R dobara check karein — aik galat digit bhi “no record” dikhata hai. Madad: <a href="lesco-bill-not-showing.html">Bill Not Showing</a>.'
    },
    {
      keys: ['duplicate', 'print', 'download', 'copy', 'dobara'],
      html: 'Duplicate bill official portal se print ya PDF save karke mil jata hai — wohi bill banks mein chalta hai. Tareeqa: <a href="how-to-check-lesco-bill-online.html">How to Check LESCO Bill Online</a>.'
    },
    {
      keys: ['previous bill', 'pichla bill', 'purana bill', 'old bill'],
      html: 'Portal par sirf current bill dikhta hai — purane bill dekhne ke liye har mahine ka PDF save karein. Agle bill ki arrears line bhi batati hai ke pichla bill pay hua tha ya nahi. Tafseel: <a href="lesco-previous-bill.html">LESCO Previous Bill</a>.'
    },
    {
      keys: ['name change', 'naam tabdeel', 'naam change'],
      html: 'Bill par naam tabdeel karna office ka kaam hai — SDO ya Customer Service Centre jayein, apna CNIC aur ownership proof le kar. Online naam change nahi hota. Tafseel: <a href="lesco-name-change.html">LESCO Bill Name Change</a>.'
    },
    {
      keys: ['customer id', 'customer-id'],
      html: 'Aapka 10-digit Customer ID bhi portal par kaam karta hai — reference number ki jagah use ho sakta hai. Tafseel: <a href="lesco-reference-number.html">Reference Number guide</a>.'
    },
    {
      keys: ['cnic'],
      html: 'Portal par CNIC se bill check <strong>nahi</strong> hota — sirf reference number ya Customer ID se. CNIC se kya kar sakte hain aur kya nahi: <a href="lesco-bill-check-by-cnic.html">LESCO Bill Check by CNIC</a>.'
    },
    {
      keys: ['unit', 'calculator'],
      html: 'Units ke hisaab se slab ka andaza homepage ke Units Calculator se laga sakte hain — woh sirf protected/unprotected batata hai, bill ki raqam nahi. Bill samajhne ke liye: <a href="understanding-your-lesco-bill.html">Understanding Your LESCO Bill</a>.'
    },
    {
      keys: ['meter', 'reading'],
      html: 'Meter reading bill par likhi hoti hai — apne meter se milaan karein. Agar reading galat lagti hai to dated photo lein aur 118 par call karein. Tafseel: <a href="lesco-wrong-bill-complaint.html">Wrong Bill Complaint</a>.'
    },
    {
      keys: ['sms', '8118'],
      html: 'SMS short code 8118 maujood hai — istemal se pehle format lesco.gov.pk par confirm kar lein, kyunki mukhtalif jagah mukhtalif tareeqe likhe hain.'
    },
    {
      keys: ['peak', 'peak hours', 'tou', 'time of use'],
      html: 'Peak hours shaam ke 4 ghante hote hain — November 2026 mein 6 PM se 10 PM, aur 1 December se 5 PM se 9 PM. Peak rate sirf TOU meter walon par lagta hai. Poori tafseel: <a href="lesco-peak-hours.html">LESCO Peak Hours 2026</a>.'
    },
    {
      keys: ['electrician'],
      html: 'Ghar ki wiring ya meter ke masle ke liye pehle yeh check karein ke kaam LESCO ka hai ya private electrician ka: <a href="lesco-electrician-in-lahore.html">Electrician in Lahore</a>.'
    },
    {
      keys: ['lahore'],
      html: 'Lahore LESCO ka sab se bara district hai — check ka tareeqa har district mein aik jaisa hai. Lahore ke liye khaas page: <a href="lesco-bill-check-lahore.html">LESCO Bill Check Lahore</a>.'
    },
    {
      keys: ['okara'],
      html: 'Okara LESCO ka district hai — check ka tareeqa wohi hai. Page: <a href="lesco-bill-check-okara.html">LESCO Bill Check Okara</a>.'
    },
    {
      keys: ['sheikhupura'],
      html: 'Sheikhupura LESCO ka district hai — check ka tareeqa wohi hai. Page: <a href="lesco-bill-check-sheikhupura.html">LESCO Bill Check Sheikhupura</a>.'
    },
    {
      keys: ['nankana'],
      html: 'Nankana Sahib LESCO ka district hai — check ka tareeqa wohi hai. Page: <a href="lesco-bill-check-nankana-sahib.html">LESCO Bill Check Nankana Sahib</a>.'
    },
    {
      keys: ['kasur'],
      html: 'Kasur LESCO ka district hai — check ka tareeqa wohi hai. Page: <a href="lesco-bill-check-kasur.html">LESCO Bill Check Kasur</a>.'
    },
    {
      keys: ['salam', 'assalam', 'hello', 'hi', 'aoa', 'adaab'],
      html: 'Assalam-o-Alaikum! Main Bijli Baji hoon — aapki LESCO Bill Dost. Neeche diye gaye sawalon mein se aik chunein, ya apna sawaal likhein.'
    },
    {
      keys: ['shukriya', 'thanks', 'thank'],
      html: 'Khush aamdeed! Bill check karne mein aur koi madad chahiye to poochein.'
    },
    {
      keys: ['tum kaun', 'kaun ho', 'bijli baji', 'baji'],
      html: 'Main Bijli Baji hoon — is site ki LESCO Bill Dost. Main bill check karne, samajhne aur shikayat ke tareeqe mein madad karti hoon. Main aapka number kabhi nahi mangti aur kuch save nahi karti.'
    }
  ];

  var QUICK = [
    { label: 'Reference number kahan hai?', q: 'reference number kahan hai' },
    { label: 'Bill kaise check karein?', q: 'bill kaise check karein' },
    { label: 'Payment kaise karein?', q: 'payment kaise karein' },
    { label: 'Protected / unprotected?', q: 'protected unprotected' },
    { label: 'Complaint / helpline 118', q: 'complaint helpline 118' },
    { label: 'Bill nahi aa raha', q: 'bill nahi aa raha' },
    { label: 'Duplicate bill', q: 'duplicate bill' }
  ];

  var FALLBACK = 'Maaf kijiye, main is sawaal ka jawab nahi jaanti. Neeche diye gaye sawalon mein se aik chunein, ya LESCO helpline <strong>118</strong> par call karein.';

  var NUMBER_WARNING = 'Apna reference number, Customer ID, CNIC ya phone number yahan <strong>kabhi na likhein</strong> — Bijli Baji number save nahi karti aur is chat mein number likhna mehfooz nahi. Number sirf official portal par daalein: <a href="https://bill.pitc.com.pk/lescobill" target="_blank" rel="noopener">bill.pitc.com.pk/lescobill</a>.';

  var GREETING = 'Assalam-o-Alaikum! Main <strong>Bijli Baji</strong> hoon — aapki LESCO Bill Dost. <strong>Apna reference number check karke hi button dabayein — Bijli Baji aapka number save nahi karti.</strong> Neeche sawal chunein ya apna sawaal likhein.';

  var opened = false;

  function addMsg(html, who) {
    var div = document.createElement('div');
    div.className = 'bb-msg bb-' + who;
    div.innerHTML = html;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function answer(text) {
    var t = (text || '').toLowerCase();
    /* Safety: never echo back anything that looks like a number/CNIC. */
    if (/\d{5,}/.test(t.replace(/[-\s]/g, '')) || /\d{5}-\d{7}-\d/.test(t)) {
      return NUMBER_WARNING;
    }
    for (var i = 0; i < ANSWERS.length; i++) {
      var keys = ANSWERS[i].keys;
      for (var j = 0; j < keys.length; j++) {
        if (t.indexOf(keys[j]) !== -1) { return ANSWERS[i].html; }
      }
    }
    return FALLBACK;
  }

  function ask(q) {
    addMsg(q, 'user');
    window.setTimeout(function () { addMsg(answer(q), 'bot'); }, 250);
  }

  function openPanel() {
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    if (!opened) {
      opened = true;
      addMsg(GREETING, 'bot');
    }
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.focus();
  }

  /* Quick-question buttons */
  QUICK.forEach(function (item) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bb-chip';
    b.textContent = item.label;
    b.addEventListener('click', function () { ask(item.q); });
    quickBox.appendChild(b);
  });

  button.addEventListener('click', function () {
    if (panel.hidden) { openPanel(); } else { closePanel(); }
  });
  closeBtn.addEventListener('click', closePanel);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) { return; }
    input.value = '';
    ask(q);
  });

  /* Homepage intro button (data-bb-open) opens the chat panel. */
  var openers = document.querySelectorAll('[data-bb-open]');
  for (var k = 0; k < openers.length; k++) {
    openers[k].addEventListener('click', openPanel);
  }
})();
