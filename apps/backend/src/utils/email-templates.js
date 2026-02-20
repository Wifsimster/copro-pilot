function layout(content) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; color: #18181b; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4f46e5, #4338ca); padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; }
    .body { padding: 40px; }
    .body p { margin: 0 0 16px; line-height: 1.6; font-size: 15px; color: #3f3f46; }
    .btn { display: inline-block; padding: 12px 32px; background: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
    .code { display: inline-block; padding: 16px 32px; background: #f4f4f5; border: 2px dashed #d4d4d8; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; margin: 8px 0 24px; }
    .footer { padding: 24px 40px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5; }
    .footer a { color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CoproPilot</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CoproPilot — Plateforme de gestion de copropriété</p>
      <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>`
}

export function generateResetPasswordEmail(name, url) {
  return layout(`
    <p>Bonjour${name ? ` ${name}` : ''},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe CoproPilot.</p>
    <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
    <p style="text-align: center;">
      <a href="${url}" class="btn">Réinitialiser mon mot de passe</a>
    </p>
    <p>Ce lien est valable <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    <p style="font-size: 13px; color: #71717a;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>${url}</p>
  `)
}

export function generateVerificationEmail(name, url) {
  return layout(`
    <p>Bonjour${name ? ` ${name}` : ''},</p>
    <p>Merci de vous être inscrit sur CoproPilot. Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
    <p style="text-align: center;">
      <a href="${url}" class="btn">Vérifier mon email</a>
    </p>
    <p>Ce lien est valable <strong>24 heures</strong>.</p>
    <p style="font-size: 13px; color: #71717a;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>${url}</p>
  `)
}

export function generateOTPEmail(name, otp) {
  return layout(`
    <p>Bonjour${name ? ` ${name}` : ''},</p>
    <p>Voici votre code de connexion CoproPilot :</p>
    <p style="text-align: center;">
      <span class="code">${otp}</span>
    </p>
    <p>Ce code est valable <strong>15 minutes</strong>. Ne le partagez avec personne.</p>
    <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
  `)
}

export function generateWelcomeEmail(name, email, loginUrl) {
  return layout(`
    <p>Bonjour${name ? ` ${name}` : ''},</p>
    <p>Un compte CoproPilot a été créé pour vous afin d'accéder à votre espace copropriétaire.</p>
    <p><strong>Votre identifiant :</strong> ${email}</p>
    <p>Pour activer votre compte, cliquez sur le bouton ci-dessous. Vous recevrez un code de vérification par email pour vous connecter et définir votre mot de passe.</p>
    <p style="text-align: center;">
      <a href="${loginUrl}" class="btn">Activer mon compte</a>
    </p>
    <p style="font-size: 13px; color: #71717a;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>${loginUrl}</p>
  `)
}

export function generateAccountLinkedEmail(name, coproprieteNom) {
  return layout(`
    <p>Bonjour${name ? ` ${name}` : ''},</p>
    <p>Vous avez été ajouté(e) comme copropriétaire dans la copropriété <strong>${coproprieteNom}</strong>.</p>
    <p>Vous pouvez accéder à vos informations pour cette copropriété via votre espace extranet habituel, avec vos identifiants existants.</p>
    <p>Aucune action n'est requise de votre part.</p>
  `)
}
