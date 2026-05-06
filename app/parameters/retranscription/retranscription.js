const TOGGLE_SECTIONS = [
	{
		checkboxId: "enable-oral-transcription",
		sectionId: "oral-transcription-options",
	},
	{
		checkboxId: "enable-subtitles",
		sectionId: "subtitle-options",
	},
	{
		checkboxId: "enable-lsf-bubble",
		sectionId: "lsf-bubble-options",
	},
];

const setSectionVisibility = (checkbox, section) => {
	section.classList.toggle("hidden", !checkbox.checked);
};

export const initRetranscriptionPage = () => {
	TOGGLE_SECTIONS.forEach(({ checkboxId, sectionId }) => {
		const checkbox = document.getElementById(checkboxId);
		const section = document.getElementById(sectionId);

		if (!checkbox || !section) {
			return;
		}

		setSectionVisibility(checkbox, section);

		checkbox.addEventListener("change", () => {
			setSectionVisibility(checkbox, section);
		});
	});
};
