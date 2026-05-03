/* global process */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar Firebase Admin una sola vez
let adminApp;
let adminAuth;

const initAdmin = () => {
  if (adminApp) return { app: adminApp, auth: adminAuth };

  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || join(__dirname, '..', 'firebase-service-account.json');
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  }

  adminApp = initializeApp({
    credential: cert(serviceAccount)
  });

  adminAuth = getAuth(adminApp);
  return { app: adminApp, auth: adminAuth };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'EMAIL_REQUIRED' });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'INVALID_EMAIL' });
  }

  try {
    const { auth } = initAdmin();

    // Verificar que el usuario existe
    await auth.getUserByEmail(email);

    // Generar enlace de restablecimiento SIN actionCodeSettings
    // Usa la URL configurada en Firebase Console (Password reset URL)
    const resetLink = await auth.generatePasswordResetLink(email);

    // Configurar nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
        ciphers: 'SSLv3'
      },
      connectionTimeout: 10000,
      socketTimeout: 10000
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Restablece tu contraseña - Balances',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #333;">
          <h2 style="color: #6366f1;">Restablecer Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña en Balances.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <p>
            <a href="${resetLink}" 
               style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
               Restablecer Contraseña
            </a>
          </p>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 0.9rem;">
            Este enlace expira en <strong>1 hora</strong> por seguridad.
          </p>
          <p style="color: #999; font-size: 0.9rem;">
            Si no solicitaste este cambio, puedes ignorar este correo. Tu cuenta seguirá segura.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending reset email:', error);
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ success: false, error: 'USER_NOT_FOUND' });
    }
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}
