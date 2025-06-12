const fetch = require('node-fetch');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

const url = 'https://g1.globo.com/natureza/';

async function fetchNoticiasAmbientais() {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const noticias = [];
  $('.feed-post-body-title').each((i, el) => {
    const titulo = $(el).text().trim();
    const link = $(el).find('a').attr('href');
    if (titulo && link) noticias.push({ titulo, link });
  });

  return noticias.slice(0, 5);
}

async function sendEmail(noticias) {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const htmlBody = `
    <h2>Boletim Ambiental</h2>
    <ul>
      ${noticias.map(n => `<li><a href="${n.link}">${n.titulo}</a></li>`).join('')}
    </ul>
  `;

  const info = await transporter.sendMail({
    from: '"Boletim Ambiental" <no-reply@ethereal.email>',
    to: 'alguem@exemplo.com', 
    subject: 'Boletim Ambiental - Últimas Notícias',
    html: htmlBody,
  });

  console.log('✅ E-mail enviado (modo teste):', info.messageId);
  console.log('📬 Link para visualizar:', nodemailer.getTestMessageUrl(info));
}

(async () => {
  const noticias = await fetchNoticiasAmbientais();
  if (noticias.length > 0) {
    await sendEmail(noticias);
  } else {
    console.log('Nenhuma notícia encontrada.');
  }
})();
