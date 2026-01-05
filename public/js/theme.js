// Theme Management
(function () {
	// Get current theme mode (light, dark, or auto)
	function getCurrentMode() {
		return localStorage.getItem("themeMode") || "auto";
	}

	// Apply theme based on mode
	function applyTheme(mode) {
		if (mode === "auto") {
			const systemPrefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)"
			).matches;
			document.documentElement.setAttribute(
				"data-theme",
				systemPrefersDark ? "dark" : "light"
			);
		} else {
			document.documentElement.setAttribute("data-theme", mode);
		}
		updateThemeButtons(mode);
	}

	// Update active state of theme buttons
	function updateThemeButtons(mode) {
		// Wait for DOM to be ready
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () =>
				updateThemeButtons(mode)
			);
			return;
		}

		const buttons = document.querySelectorAll(".theme-btn");
		buttons.forEach((btn) => {
			btn.classList.remove("active");
			if (btn.dataset.theme === mode) {
				btn.classList.add("active");
			}
		});
	}

	// Initialize theme on load
	const currentMode = getCurrentMode();
	applyTheme(currentMode);

	// Listen for system theme changes (only if in auto mode)
	window
		.matchMedia("(prefers-color-scheme: dark)")
		.addEventListener("change", (e) => {
			if (getCurrentMode() === "auto") {
				document.documentElement.setAttribute(
					"data-theme",
					e.matches ? "dark" : "light"
				);
			}
		});

	// Expose setTheme function globally
	window.setTheme = function (mode) {
		localStorage.setItem("themeMode", mode);
		applyTheme(mode);
	};
})();
