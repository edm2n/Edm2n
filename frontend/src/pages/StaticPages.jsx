// Static content pages: About, FAQ, Privacy, Terms, Links
import React from 'react';

function Container({ title, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">{title}</h1>
      <div className="prose prose-lg max-w-none leading-loose text-foreground">
        {children}
      </div>
    </div>
  );
}

export function About() {
  return (
    <Container title="من نحن">
      <p>
        <strong>دليل مطر الإلكتروني</strong> هو مبادرة عربية مجانية تجمع أهم الأدوات
        والحاسبات الإلكترونية في مكان واحد — من دون تسجيل، ومن دون إعلانات مزعجة، ومع
        احترام كامل لخصوصيتك.
      </p>
      <p>
        نؤمن بأن الأدوات الرقمية يجب أن تكون في متناول الجميع بلغتهم الأم. لذلك صمّمنا
        الموقع باللغة العربية أصلاً (RTL كامل، خطوط عربية أنيقة، أرقام هندية)، وليس مجرد
        ترجمة لأداة أجنبية.
      </p>
      <p>
        الموقع مصمم ومبرمج بواسطة <strong>مطر الموايقي</strong>. للتواصل والاقتراحات
        اضغط على اسمه في ذيل الصفحة، أو راسله على{' '}
        <a href="mailto:edm2n@msn.com" className="text-[#D4AF37]">edm2n@msn.com</a> أو تويتر{' '}
        <a href="https://twitter.com/edm2n" className="text-[#D4AF37]" target="_blank" rel="noreferrer">@edm2n</a>.
      </p>
    </Container>
  );
}

const FAQS = [
  { q: 'هل الموقع مجاني بالكامل؟', a: 'نعم، جميع الأدوات مجانية 100% وبدون تسجيل.' },
  { q: 'هل تحفظون بياناتي؟', a: 'لا نحفظ أي بيانات تدخلها في الحاسبات. جميع العمليات تتم في متصفحك محلياً.' },
  { q: 'الحاسبات دقيقة؟', a: 'الصيغ الرياضية دقيقة، لكن الحاسبات المرتبطة بأنظمة (كنهاية الخدمة، الميراث، التأمين) هي للاسترشاد فقط. راجع الجهات المختصة للحالات الرسمية.' },
  { q: 'هل يعمل على الجوال؟', a: 'نعم، بشكل ممتاز. يمكنك أيضاً إضافة الموقع للشاشة الرئيسية كتطبيق (PWA).' },
  { q: 'كيف أقترح أداة جديدة؟', a: 'اضغط على "مطر الموايقي" في ذيل الصفحة أو راسلنا مباشرة.' },
  { q: 'هل يمكنني استخدامه بدون إنترنت؟', a: 'أغلب الأدوات تعمل بدون إنترنت بعد أول زيارة. الأدوات التي تحتاج بيانات مباشرة (كأسعار الذهب/العملات ومواقيت الصلاة) تحتاج اتصالاً.' },
];

export function FAQ() {
  return (
    <Container title="الأسئلة الشائعة">
      <div className="space-y-4 not-prose">
        {FAQS.map((f, i) => (
          <details key={i} data-testid={`faq-${i}`} className="rounded-2xl border border-border p-4 group">
            <summary className="cursor-pointer font-semibold text-lg">{f.q}</summary>
            <p className="mt-3 text-muted-foreground leading-loose">{f.a}</p>
          </details>
        ))}
      </div>
    </Container>
  );
}

export function Privacy() {
  return (
    <Container title="سياسة الخصوصية">
      <p>نحن نحترم خصوصيتك بشكل كامل:</p>
      <ul>
        <li>لا نطلب التسجيل ولا نجمع بيانات شخصية.</li>
        <li>جميع الحسابات تتم في متصفحك (Client-side) ولا تُرسل لأي خادم.</li>
        <li>نستخدم localStorage محلياً فقط لحفظ إعداداتك (كتفضيل الوضع الداكن وقائمة المهام).</li>
        <li>عند إرسال رسالة عبر نموذج الاتصال، نحفظ الاسم والبريد والرسالة فقط للرد عليك.</li>
        <li>خدمات خارجية للأسعار (Aladhan للصلاة، Currency API للعملات) قد تسجّل الطلبات لدى مزوّديها — راجع سياساتهم.</li>
      </ul>
    </Container>
  );
}

export function Terms() {
  return (
    <Container title="شروط الاستخدام">
      <p>باستخدامك للموقع فأنت توافق على:</p>
      <ul>
        <li>الحاسبات للاسترشاد فقط، وليست بديلاً عن استشارة المختصين (في المسائل الشرعية والطبية والقانونية والمالية).</li>
        <li>عدم استخدام الموقع في أي غرض غير قانوني.</li>
        <li>يحق لنا تعديل الأدوات وإضافة أو إزالة ميزات في أي وقت.</li>
        <li>الملكية الفكرية للتصميم والبرمجة تعود لمطر الموايقي.</li>
      </ul>
    </Container>
  );
}

export function Links() {
  const links = [
    { n: 'تويتر / X', u: 'https://twitter.com/edm2n', h: '@edm2n' },
    { n: 'البريد الإلكتروني', u: 'mailto:edm2n@msn.com', h: 'edm2n@msn.com' },
  ];
  return (
    <Container title="روابطنا">
      <p>تابعنا وتواصل معنا عبر:</p>
      <div className="not-prose grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <a key={l.n} href={l.u} data-testid={`link-${l.n}`} target="_blank" rel="noreferrer" className="rounded-2xl border border-border p-4 hover:border-[#D4AF37] block">
            <div className="font-semibold">{l.n}</div>
            <div className="text-sm text-muted-foreground" dir="ltr">{l.h}</div>
          </a>
        ))}
      </div>
    </Container>
  );
}
