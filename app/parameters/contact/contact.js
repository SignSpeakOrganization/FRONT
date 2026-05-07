const SUPPORT_EMAIL = 'support@signspeak.fr';

const updateFileNameDisplay = () => {
  const attachmentInput = document.getElementById('attachment');
  const fileName = document.getElementById('file-name');
  if (!attachmentInput || !fileName) return;

  attachmentInput.addEventListener('change', () => {
    fileName.textContent =
      attachmentInput.files[0]?.name || 'Aucun fichier sélectionné';
  });
};

const bindFormSubmit = () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const object = document.getElementById('object')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';
    const attachmentInput = document.getElementById('attachment');
    const attachmentName = attachmentInput?.files[0]?.name;

    const bodyLines = [
      name ? `Nom : ${name}` : null,
      `Email : ${email}`,
      '',
      message,
      attachmentName ? `\n(Pièce jointe à attacher manuellement : ${attachmentName})` : null,
    ].filter(Boolean);

    const subject = encodeURIComponent(object || 'Contact SignSpeak');
    const body = encodeURIComponent(bodyLines.join('\n'));
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  });
};

export const initContactPage = () => {
  updateFileNameDisplay();
  bindFormSubmit();
};
