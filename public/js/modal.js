document.addEventListener("DOMContentLoaded", () => {
	const modalHTML = `
    <div id="confirmModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="modal-title">Confirm Action</h3>
        <p class="modal-text">Are you sure you want to proceed?</p>
        <div class="modal-actions">
          <button id="cancelBtn" class="btn-cancel">Cancel</button>
          <button id="confirmBtn" class="btn-confirm">Delete</button>
        </div>
      </div>
    </div>
  `;
	document.body.insertAdjacentHTML("beforeend", modalHTML);

	const modal = document.getElementById("confirmModal");
	const cancelBtn = document.getElementById("cancelBtn");
	const confirmBtn = document.getElementById("confirmBtn");
	let currentForm = null;

	window.showConfirmModal = function (event, formElement) {
		event.preventDefault();
		currentForm = formElement;
		modal.classList.add("active");
	};

	cancelBtn.addEventListener("click", () => {
		modal.classList.remove("active");
		currentForm = null;
	});

	confirmBtn.addEventListener("click", () => {
		if (currentForm) {
			currentForm.submit();
		}
		modal.classList.remove("active");
	});

	// Close on outside click
	modal.addEventListener("click", (e) => {
		if (e.target === modal) {
			modal.classList.remove("active");
		}
	});
});
