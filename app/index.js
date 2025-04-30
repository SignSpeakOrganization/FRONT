document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("desactivate").addEventListener("click", () => {
        chrome.windows.create({
            url: "popup.html",
            type: "popup",
            width: 400,
            height: 500
        });
    });

    document.getElementById("activate").addEventListener("click", () => {
        chrome.windows.create({
            url: "popup.html",
            type: "popup",
            width: 400,
            height: 500
        });
    });
});
