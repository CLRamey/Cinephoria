import { sendEmail } from '../services/mailService';

export const sendVerificationEmail = async (
  to: string,
  firstName: string,
  verificationLink: string,
) => {
  const subject = 'Confirmez votre compte Cinéphoria';

  const text = `Bonjour ${firstName},

Nous vous remercions pour votre inscription sur Cinéphoria.

Afin de finaliser la création de votre compte, veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse e-mail :
${verificationLink}

Ce lien expirera dans une heure.

Cordialement,
L'équipe Cinéphoria`;

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 15px;">
      <p>Bonjour <strong>${firstName}</strong>,</p>
      <p>Nous vous remercions pour votre inscription sur <strong>Cinéphoria</strong>.</p>
      <p>
        Afin de finaliser la création de votre compte,<br>veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse e-mail :
      </p>
      <p>
        <a href="${verificationLink}" style="background: #80c683; color: black; padding: 10px 15px; border-radius: 5px; margin-top: 8px; text-decoration: none;">
          Confirmer mon compte
        </a>
      </p>
      <p style="color: #999; font-size: 13px; text-decoration: italic;">
        Ce lien expirera dans une heure.
      </p>
      <p>Cordialement,<br>L'équipe Cinéphoria</p>
    </div>
  `;

  await sendEmail(to, subject, text, html);
};
