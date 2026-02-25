document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.querySelector('.modal-close');
  const slides = document.querySelectorAll('.slide');

  if (!modal || !closeBtn) return;

  slides.forEach(slide => {
    slide.classList.add('clickable');
    slide.addEventListener('click', function() {
      const img = this.querySelector('img');
      const projectId = img.dataset.projectId;

      if (projectId) {
        openProjectModal(parseInt(projectId));
      }
    });
  });

  closeBtn.addEventListener('click', closeProjectModal);

  modal.addEventListener('click', function(e) {
    if (e.target === this) {
      closeProjectModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeProjectModal();
    }
  });

  function openProjectModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const modalContent = document.querySelector('.modal-content');

    modalContent.innerHTML = `
      <div class="modal-header">
        <img src="${project.image}" alt="${project.title}">
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <h2 class="modal-title">${project.title}</h2>
        <span class="modal-category">${project.category}</span>
        <p class="modal-description">${project.description}</p>

        <div class="modal-section">
          <h3 class="modal-section-title">Project Details</h3>
          <p>${project.details}</p>
        </div>

        <div class="modal-section">
          <h3 class="modal-section-title">Technologies Used</h3>
          <div class="technologies-list">
            ${project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
          </div>
        </div>

        <div class="modal-section">
          <h3 class="modal-section-title">Key Achievements</h3>
          <ul class="achievements-list">
            ${project.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    const newCloseBtn = modalContent.querySelector('.modal-close');
    newCloseBtn.addEventListener('click', closeProjectModal);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});
