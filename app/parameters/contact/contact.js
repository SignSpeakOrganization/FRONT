const attachmentInput = document.getElementById("attachment");
const fileName = document.getElementById("file-name");

attachmentInput.addEventListener("change", () => {
  fileName.textContent =
    attachmentInput.files[0]?.name || "Aucun fichier sélectionné";
});
