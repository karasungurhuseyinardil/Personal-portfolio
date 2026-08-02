/* ═══════════════════════════════════════════════════════════
   ÖRNEK KONFİGÜRASYON

   Yerel geliştirme için bu dosyayı `config.js` olarak kopyala
   ve değerleri EmailJS panelinden doldur:

       cp config.example.js config.js

   config.js .gitignore'da — repoya gitmez.
   Canlı sitede bu dosya GitHub Actions tarafından
   repository secrets kullanılarak deploy anında üretilir.
   Bkz. .github/workflows/deploy.yml
═══════════════════════════════════════════════════════════ */
window.PORTFOLIO_CONFIG = {
  // EmailJS → Account → General → Public Key
  EMAILJS_PUBLIC_KEY: "buraya_public_key",

  // EmailJS → Email Services → Service ID ("service_xxxxxxx")
  EMAILJS_SERVICE_ID: "service_xxxxxxx",

  // EmailJS → Email Templates → Template ID ("template_xxxxxxx")
  EMAILJS_TEMPLATE_ID: "template_xxxxxxx",

  // Formdan gelen mesajların düşeceği adres
  EMAILJS_RECEIVER_EMAIL: "ardilkarasungur12@gmail.com"
};
