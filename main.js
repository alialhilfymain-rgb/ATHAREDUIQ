/**
 * ATHAR Educational Platform - Main Application Controller
 * Art Direction: "The impact expands"
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. Custom Desktop Gold Dot Cursor
  // ==========================================================================
  const cursorDot = document.getElementById('atharCursor');
  const cursorRing = document.getElementById('atharCursorRing');
  let targetX = -100, targetY = -100;
  let ringX = -100, ringY = -100;

  if (cursorDot && cursorRing && window.innerWidth >= 1024) {
    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cursorDot.style.left = targetX + 'px';
      cursorDot.style.top = targetY + 'px';
    }, { passive: true });

    function updateCursorRing() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(updateCursorRing);
    }
    requestAnimationFrame(updateCursorRing);

    // Enlarge cursor on interactive elements
    document.querySelectorAll('a, button, input, select, textarea, .hairline-item').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorRing.style.width = '46px';
        cursorRing.style.height = '46px';
        cursorDot.style.width = '12px';
        cursorDot.style.height = '12px';
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.style.width = '32px';
        cursorRing.style.height = '32px';
        cursorDot.style.width = '8px';
        cursorDot.style.height = '8px';
      });
    });
  }

  // ==========================================================================
  // 2. Bilingual Language Controller (Arabic RTL default, English toggle)
  // ==========================================================================
  let currentLang = localStorage.getItem('athar_lang') || 'ar';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('athar_lang', lang);
    const htmlEl = document.documentElement;
    htmlEl.setAttribute('lang', lang);
    htmlEl.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Update text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
        el.setAttribute('placeholder', translations[lang][key]);
      }
    });

    // Update Language toggle labels
    const langBtn = document.getElementById('langToggleBtn');
    const langBtnMobile = document.getElementById('langToggleBtnMobile');
    const nextLangLabel = lang === 'ar' ? 'English' : 'العربية';
    if (langBtn) {
      const span = langBtn.querySelector('span');
      if (span) span.textContent = nextLangLabel;
    }
    if (langBtnMobile) {
      const span = langBtnMobile.querySelector('span');
      if (span) span.textContent = nextLangLabel;
    }

    // Trigger word reveal animation refresh on hero
    animateHeroHeadline();
  }

  const langToggleBtn = document.getElementById('langToggleBtn');
  const langToggleBtnMobile = document.getElementById('langToggleBtnMobile');

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
    });
  }
  if (langToggleBtnMobile) {
    langToggleBtnMobile.addEventListener('click', () => {
      applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
      toggleMobileMenu(false);
    });
  }

  // ==========================================================================
  // 3. Hero Word-by-Word Reveal Animation
  // ==========================================================================
  function animateHeroHeadline() {
    const headlineEl = document.getElementById('heroHeadline');
    if (!headlineEl) return;

    const text = headlineEl.getAttribute(`data-${currentLang}`) || headlineEl.textContent.trim();
    const words = text.split(/\s+/);
    headlineEl.innerHTML = '';

    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'word-reveal-span';
      span.style.animationDelay = `${0.35 + index * 0.12}s`;
      span.textContent = word + (index < words.length - 1 ? '\u00A0' : '');
      headlineEl.appendChild(span);
    });
  }

  // Initial application of language & hero reveal
  applyLanguage(currentLang);

  // ==========================================================================
  // 4. Multi-Page Active Nav Highlighting
  // ==========================================================================
  const currentPath = window.location.pathname.toLowerCase();
  const pageMap = [
    { file: 'about.html', key: 'about' },
    { file: 'academy.html', key: 'academy' },
    { file: 'impact.html', key: 'impact' },
    { file: 'partnerships.html', key: 'partnerships' },
    { file: 'volunteer.html', key: 'volunteer' },
    { file: 'contact.html', key: 'contact' },
    { file: 'index.html', key: 'home' }
  ];

  let matchedKey = 'home';
  for (const item of pageMap) {
    if (currentPath.includes(item.file)) {
      matchedKey = item.key;
      break;
    }
  }
  if (currentPath === '/' || currentPath.endsWith('/')) {
    matchedKey = 'home';
  }

  document.querySelectorAll('header nav a[data-nav-item], #mobileMenuDrawer a[data-nav-item]').forEach(link => {
    if (link.getAttribute('data-nav-item') === matchedKey) {
      link.classList.add('text-athar-gold', 'font-bold');
      link.style.borderBottom = '2px solid var(--color-gold)';
    }
  });

  // ==========================================================================
  // 5. Mobile Menu Controller
  // ==========================================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenuCloseBtn = document.getElementById('mobileMenuCloseBtn');
  const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');
  const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');

  function toggleMobileMenu(show) {
    if (!mobileMenuDrawer || !mobileMenuBackdrop) return;
    if (show) {
      mobileMenuDrawer.classList.remove('translate-x-full', '-translate-x-full');
      mobileMenuBackdrop.classList.remove('hidden');
      setTimeout(() => mobileMenuBackdrop.classList.add('opacity-100'), 10);
      document.body.style.overflow = 'hidden';
    } else {
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      if (isRtl) {
        mobileMenuDrawer.classList.add('translate-x-full');
      } else {
        mobileMenuDrawer.classList.add('-translate-x-full');
      }
      mobileMenuBackdrop.classList.remove('opacity-100');
      setTimeout(() => {
        mobileMenuBackdrop.classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleMobileMenu(true));
  if (mobileMenuCloseBtn) mobileMenuCloseBtn.addEventListener('click', () => toggleMobileMenu(false));
  if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', () => toggleMobileMenu(false));

  // ==========================================================================
  // 6. Unified Modal System (Workshop, Course, Partnership)
  // ==========================================================================
  const modalContainer = document.getElementById('atharModalContainer');
  const modalBackdrop = document.getElementById('atharModalBackdrop');
  const modalCloseBtn = document.getElementById('atharModalCloseBtn');
  const modalForm = document.getElementById('atharModalForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalFormType = document.getElementById('modalFormType');
  const modalSuccess = document.getElementById('modalSuccessState');

  function openModal(type = 'workshop') {
    if (!modalContainer) return;
    if (modalSuccess) modalSuccess.classList.add('hidden');
    if (modalForm) {
      modalForm.reset();
      modalForm.classList.remove('hidden');
    }

    if (type === 'workshop') {
      if (modalTitle) modalTitle.textContent = currentLang === 'ar' ? 'طلب ورشة مجانية لمدرستك أو كليتك' : 'Request Free Workshop for School/College';
      if (modalDesc) modalDesc.textContent = currentLang === 'ar' ? 'ورش أثر المجتمعية مجانية بالكامل وتهدف لنشر الثقافة الرقمية دون أي مقابل مالي أو شروط تجارية.' : 'ATHAR Impact workshops are 100% free with no commercial obligations.';
      if (modalFormType) modalFormType.value = 'طلب ورشة مجانية';
    } else if (type === 'academy') {
      if (modalTitle) modalTitle.textContent = currentLang === 'ar' ? 'تسجيل الاهتمام بدورات أكاديمية أثر' : 'Register Interest in ATHAR Academy';
      if (modalDesc) modalDesc.textContent = currentLang === 'ar' ? 'حدد البرنامج التدريبي الذي ترغب بالالتحاق به، وسيتواصل معك فريقنا بتفاصيل الموعد والقاعة.' : 'Select the training course you wish to join, and our team will follow up with schedule details.';
      if (modalFormType) modalFormType.value = 'تسجيل دورة تدريبية';
    } else if (type === 'partnership') {
      if (modalTitle) modalTitle.textContent = currentLang === 'ar' ? 'طلب شراكة وتعاون مؤسسي' : 'Institutional Partnership Request';
      if (modalDesc) modalDesc.textContent = currentLang === 'ar' ? 'نرحب بالتعاون مع المدارس، الجامعات، والشركات في البصرة والعراق لتحقيق أثر مستدام.' : 'We welcome partnerships with schools, universities, and organizations in Basra.';
      if (modalFormType) modalFormType.value = 'طلب شراكة مؤسسية';
    }

    modalContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalContainer) return;
    modalContainer.classList.add('hidden');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const type = trigger.getAttribute('data-open-modal');
      openModal(type);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ==========================================================================
  // 6. Unified Form Submission & Lead Dispatch Engine
  // ==========================================================================
  const ATHAR_CONFIG = {
    // مفتاح Web3Forms المعتمد لإرسال الرسائل مباشرة إلى إيميل الإدارة
    web3formsKey: 'bae4af72-0a48-44dd-aef4-c75011908ef0', 
    whatsappNumber: '9647727437144'
  };

  const formsRegistry = [
    { formId: 'atharModalForm', successId: 'modalSuccessState', type: 'طلب من النافذة السريعة' },
    { formId: 'academyEnrollForm', successId: 'academyFormSuccessMsg', type: 'تسجيل دورة أكاديمية أثر' },
    { formId: 'impactWorkshopForm', successId: 'impactFormSuccessMsg', type: 'طلب ورشة أثر المجتمعية' },
    { formId: 'partnershipInquiryForm', successId: 'partFormSuccessMsg', type: 'طلب شراكة مؤسسية' },
    { formId: 'volunteerApplicationForm', successId: 'volFormSuccessMsg', type: 'استمارة تطوع وانضمام' },
    { formId: 'directContactForm', successId: 'contactFormSuccessMsg', type: 'رسالة تواصل واستفسار' }
  ];

  formsRegistry.forEach(({ formId, successId, type }) => {
    const formEl = document.getElementById(formId);
    if (!formEl) return;

    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = formEl.querySelector('button[type="submit"]');
      const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.75';
        submitBtn.innerHTML = currentLang === 'ar' ? 'جارٍ إرسال الطلب...' : 'Sending...';
      }

      // Collect all inputs (works with name, id, or placeholder)
      const formData = new FormData();
      const dataObj = {
        form_type: type,
        time: new Date().toLocaleString('ar-IQ'),
        page: window.location.pathname
      };

      formEl.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.type === 'submit' || field.type === 'button') return;
        const key = field.name || field.id || field.getAttribute('placeholder') || 'field';
        const val = field.value || '';
        dataObj[key] = val;
        formData.append(key, val);
      });

      // Save locally to browser storage so leads are never lost
      try {
        const stored = JSON.parse(localStorage.getItem('athar_leads') || '[]');
        stored.push({ id: Date.now(), ...dataObj });
        localStorage.setItem('athar_leads', JSON.stringify(stored));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      // If Web3Forms Access Key is set, post to email service
      if (ATHAR_CONFIG.web3formsKey) {
        formData.append('access_key', ATHAR_CONFIG.web3formsKey);
        formData.append('from_name', 'موقع أثر التعليمي');
        formData.append('subject', `[أثر | ATHAR] ${type} جديد`);

        try {
          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
          });
        } catch (apiErr) {
          console.warn('Web3Forms dispatch error:', apiErr);
        }
      }

      // Show success feedback
      formEl.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = originalBtnContent;
      }

      const successEl = document.getElementById(successId);
      if (successEl) {
        successEl.classList.remove('hidden');
        successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (formId === 'atharModalForm') {
        formEl.classList.add('hidden');
        setTimeout(() => closeModal(), 3500);
      }
    });
  });

  // ==========================================================================
  // 7. WhatsApp Integration (Phone: 07727437144)
  // ==========================================================================
  const whatsappNumber = '9647727437144';
  document.querySelectorAll('[data-whatsapp-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const message = currentLang === 'ar' 
        ? 'مرحباً مشروع أثر | ATHAR، أود الاستفسار عن برامجكم والتعاون معكم.'
        : 'Hello ATHAR, I would like to inquire about your programs and collaboration opportunities.';
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  // ==========================================================================
  // 8. Roadmap Vertical Timeline Node Scroll Growth
  // ==========================================================================
  const timelineNodes = document.querySelectorAll('.timeline-node');
  if (timelineNodes.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -50px 0px' });

    timelineNodes.forEach(node => observer.observe(node));
  }

  console.log('🏛️ ATHAR Editorial System initialized successfully.');
});
