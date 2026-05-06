import {
  callBackendStart,
  callBackendEnd,
  openPopupWindow,
  closePopupWindow,
} from "../scripts/popup.js";
import { initRetranscriptionPage } from "./retranscription/retranscription.js";

const PAGES = {
  general: "general/general.html",
  retranscription: "retranscription/retranscription.html",
  accessibilite: "accessibilite/accessibilite.html",
  compatibilite: "compatibilite/compatibilite.html",
  contact: "contact/contact.html",
};

const activateMenuItem = (pageKey) => {
  const items = document.querySelectorAll("#links li");
  items.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageKey);
  });
};

const initGeneralPage = () => {
  const signDetection = document.getElementById("enable-sign-detection");
  const languageSelect = document.getElementById("language-select");

  if (!signDetection || !languageSelect) {
    return;
  }

  chrome.storage.sync.get(["signDetection", "language"], (data) => {
    signDetection.checked = data.signDetection || false;
    languageSelect.value = data.language || "fr";
  });

  signDetection.addEventListener("change", () => {
    const value = signDetection.checked;

    chrome.storage.sync.set({ signDetection: value });

    if (value) {
      console.log("Checkbox -> ACTIVER");

      callBackendStart();
      openPopupWindow();
    } else {
      console.log("Checkbox -> DESACTIVER");

      closePopupWindow();
      callBackendEnd();
    }
  });

  languageSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ language: languageSelect.value });
  });
};

const loadPage = (pageKey) => {
  const pagePath = PAGES[pageKey];

  if (!pagePath) {
    return;
  }

  fetch(pagePath)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Impossible de charger ${pagePath}`);
      }
      return res.text();
    })
    .then((html) => {
      document.getElementById("content-container").innerHTML = html;
      activateMenuItem(pageKey);

      if (pageKey === "general") {
        initGeneralPage();
      }

      if (pageKey === "retranscription") {
        initRetranscriptionPage();
      }
    })
    .catch((err) => console.error("Erreur de chargement de page :", err));
};

const bindMenuNavigation = () => {
  const items = document.querySelectorAll("#links li");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      loadPage(item.dataset.page);
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  fetch("menu/menu.html")
    .then((res) => {
      if (!res.ok) {
        throw new Error("Impossible de charger le menu");
      }
      return res.text();
    })
    .then((html) => {
      document.getElementById("menu-container").innerHTML = html;
      bindMenuNavigation();
      loadPage("general");
    })
    .catch((err) => console.error("Erreur de chargement du menu :", err));
});
