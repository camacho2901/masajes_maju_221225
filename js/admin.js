// Panel de administración
class AdminPanel {
    constructor() {
        this.candidates = [];
        this.filteredCandidates = [];
        this.currentFilters = {
            category: '',
            date: '',
            search: ''
        };
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupAuth();
        this.loadCandidates();
        this.setupFilters();
        this.setupModal();
        this.setupDragAndDrop();
    }

    // Verificar autenticación
    checkAuth() {
        const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';
        const loginOverlay = document.getElementById('loginOverlay');
        
        if (loginOverlay) {
            if (!isAuthenticated) {
                loginOverlay.classList.remove('hidden');
            } else {
                loginOverlay.classList.add('hidden');
            }
        }
    }

    // Configurar autenticación
    setupAuth() {
        const loginBtn = document.getElementById('loginBtn');
        const passwordInput = document.getElementById('adminPassword');
        const logoutBtn = document.getElementById('logoutBtn');
        const loginOverlay = document.getElementById('loginOverlay');

        if (!loginBtn || !passwordInput || !logoutBtn || !loginOverlay) return;

        // Login
        loginBtn.addEventListener('click', () => {
            const password = passwordInput.value;
            if (password === 'admin123') { // Contraseña simple para demo
                sessionStorage.setItem('adminAuth', 'true');
                loginOverlay.classList.add('hidden');
                EliteTalentApp.showNotification('Acceso concedido', 'success');
            } else {
                EliteTalentApp.showNotification('Contraseña incorrecta', 'error');
                passwordInput.value = '';
            }
        });

        // Enter key para login
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });

        // Logout
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminAuth');
            location.reload();
        });
    }

    async loadCandidates() {
        try {
            if (CONFIG.demoMode || !CONFIG.supabase.enabled) {
                EliteTalentApp.showNotification('Modo Demo: Usando datos locales', 'info');
                this.candidates = DEMO_DATA.candidates;
                this.filteredCandidates = [...this.candidates];
                this.renderKanban();
                this.updateStats();
                return;
            }

            EliteTalentApp.showNotification('Cargando candidatas...', 'info');
            const records = await supabaseService.getApplications();
            
            this.candidates = records.map(record => ({
                id: record.id,
                name: record.nombre || 'Sin nombre',
                email: record.email || '',
                age: record.edad || 0,
                category: record.categoria || 'other',
                status: record.estado || 'new',
                rating: record.rating || 0,
                date: new Date(record.fecha || Date.now()),
                avatar: this.getAvatarByCategory(record.categoria),
                description: record.descripcion || '',
                experience: record.experiencia || '',
                location: record.ubicacion || '',
                instagram: record.instagram || '',
                notes: record.notas || '',
                images: record.imagenes || []
            }));

            this.filteredCandidates = [...this.candidates];
            this.renderKanban();
            this.updateStats();
            EliteTalentApp.showNotification(`${this.candidates.length} candidatas cargadas`, 'success');
        } catch (error) {
            console.error('Error:', error);
            EliteTalentApp.showNotification('Error. Usando datos locales.', 'warning');
            this.candidates = DEMO_DATA.candidates;
            this.filteredCandidates = [...this.candidates];
            this.renderKanban();
            this.updateStats();
        }
    }

    // Avatar por categoría
    getAvatarByCategory(category) {
        const avatars = {
            photography: '👩‍🎨',
            video: '🎥',
            streaming: '📹',
            modeling: '💃',
            other: '⭐'
        };
        return avatars[category] || '👩';
    }



    // Renderizar tablero Kanban
    renderKanban() {
        const columns = {
            new: document.getElementById('newColumn'),
            review: document.getElementById('reviewColumn'),
            approved: document.getElementById('approvedColumn'),
            rejected: document.getElementById('rejectedColumn')
        };

        // Limpiar columnas
        Object.values(columns).forEach(column => {
            if (column) column.innerHTML = '';
        });

        // Agrupar por estado
        const grouped = this.groupByStatus(this.filteredCandidates);

        // Renderizar cada grupo
        Object.keys(grouped).forEach(status => {
            const column = columns[status];
            if (!column) return;

            grouped[status].forEach(candidate => {
                const card = this.createCandidateCard(candidate);
                column.appendChild(card);
            });
        });

        // Actualizar contadores
        this.updateColumnCounts(grouped);
    }

    // Agrupar candidatas por estado
    groupByStatus(candidates) {
        return candidates.reduce((groups, candidate) => {
            const status = candidate.status;
            if (!groups[status]) {
                groups[status] = [];
            }
            groups[status].push(candidate);
            return groups;
        }, {});
    }

    // Crear tarjeta de candidata
    createCandidateCard(candidate) {
        const card = document.createElement('div');
        card.className = 'candidate-card';
        card.draggable = true;
        card.dataset.candidateId = candidate.id;

        card.innerHTML = `
            <div class="candidate-header">
                <div class="candidate-name">${candidate.name}</div>
                <div class="candidate-date">${this.formatDate(candidate.date)}</div>
            </div>
            <div class="candidate-category">${this.getCategoryName(candidate.category)}</div>
            <div class="candidate-rating">
                <span>Rating:</span>
                <div class="star-rating" data-rating="${candidate.rating}">
                    ${this.renderStars(candidate.rating, candidate.id)}
                </div>
            </div>
            <div class="candidate-actions">
                <button class="action-btn btn-view" onclick="adminPanel.viewCandidate(${candidate.id})">
                    Ver
                </button>
                ${candidate.status === 'new' ? `
                    <button class="action-btn btn-approve" onclick="adminPanel.updateStatus(${candidate.id}, 'review')">
                        Revisar
                    </button>
                ` : ''}
                ${candidate.status === 'review' ? `
                    <button class="action-btn btn-approve" onclick="adminPanel.updateStatus(${candidate.id}, 'approved')">
                        Aprobar
                    </button>
                    <button class="action-btn btn-reject" onclick="adminPanel.updateStatus(${candidate.id}, 'rejected')">
                        Rechazar
                    </button>
                ` : ''}
            </div>
        `;

        return card;
    }

    // Renderizar estrellas de rating
    renderStars(rating, candidateId) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            const active = i <= rating ? 'active' : '';
            stars += `<span class="star ${active}" onclick="adminPanel.setRating(${candidateId}, ${i})">★</span>`;
        }
        return stars;
    }

    // Establecer rating
    async setRating(candidateId, rating) {
        const candidate = this.candidates.find(c => c.id === candidateId);
        if (!candidate) return;

        try {
            await supabaseService.updateRating(candidateId, rating);
            
            candidate.rating = rating;
            this.renderKanban();
            EliteTalentApp.showNotification(`Rating actualizado: ${rating} estrellas`, 'success');
        } catch (error) {
            console.error('Error al actualizar rating:', error);
            EliteTalentApp.showNotification('Error al actualizar rating', 'error');
        }
    }

    // Actualizar estado de candidata
    async updateStatus(candidateId, newStatus) {
        const candidate = this.candidates.find(c => c.id === candidateId);
        if (!candidate) return;

        try {
            await supabaseService.updateStatus(candidateId, newStatus);
            
            candidate.status = newStatus;
            this.renderKanban();
            this.updateStats();
            
            const statusNames = {
                new: 'Nueva',
                review: 'En Revisión',
                approved: 'Aprobada',
                rejected: 'Rechazada'
            };
            
            EliteTalentApp.showNotification(
                `${candidate.name} movida a ${statusNames[newStatus]}`, 
                'success'
            );
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            EliteTalentApp.showNotification('Error al actualizar estado', 'error');
        }
    }

    // Ver detalles de candidata
    viewCandidate(candidateId) {
        const candidate = this.candidates.find(c => c.id === candidateId);
        if (!candidate) return;

        const modal = document.getElementById('candidateModal');
        const detail = document.getElementById('candidateDetail');

        detail.innerHTML = `
            <div class="candidate-detail">
                <div class="candidate-avatar">${candidate.avatar}</div>
                <h2>${candidate.name}</h2>
                <p style="color: var(--accent-pink); margin-bottom: 20px;">
                    ${this.getCategoryName(candidate.category)}
                </p>
                
                <div class="detail-section">
                    <h4>Información Personal</h4>
                    <p><strong>Email:</strong> ${candidate.email}</p>
                    <p><strong>Edad:</strong> ${candidate.age} años</p>
                    <p><strong>Ubicación:</strong> ${candidate.location}</p>
                    <p><strong>Experiencia:</strong> ${candidate.experience}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Redes Sociales</h4>
                    <p><strong>Instagram:</strong> ${candidate.instagram}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Descripción</h4>
                    <p>${candidate.description}</p>
                </div>
                
                <div class="detail-section">
                    <h4>Estado Actual</h4>
                    <p><strong>Estado:</strong> ${this.getStatusName(candidate.status)}</p>
                    <p><strong>Rating:</strong> ${candidate.rating}/5 ⭐</p>
                    <p><strong>Fecha de aplicación:</strong> ${this.formatDate(candidate.date)}</p>
                </div>
                
                <div class="notes-section">
                    <h4>Notas Administrativas</h4>
                    <textarea class="notes-textarea" id="candidateNotes" 
                              placeholder="Agregar notas sobre esta candidata...">${candidate.notes}</textarea>
                    <button class="btn-primary" onclick="adminPanel.saveNotes(${candidate.id})" 
                            style="margin-top: 10px;">
                        Guardar Notas
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    }

    // Guardar notas
    async saveNotes(candidateId) {
        const candidate = this.candidates.find(c => c.id === candidateId);
        const notes = document.getElementById('candidateNotes')?.value;
        
        if (!candidate || !notes) return;

        try {
            await supabaseService.addNotes(candidateId, notes);
            
            candidate.notes = notes;
            EliteTalentApp.showNotification('Notas guardadas', 'success');
        } catch (error) {
            console.error('Error al guardar notas:', error);
            EliteTalentApp.showNotification('Error al guardar notas', 'error');
        }
    }

    // Configurar filtros
    setupFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFilter = document.getElementById('dateFilter');
        const searchInput = document.getElementById('searchAdmin');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.applyFilters();
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.currentFilters.date = e.target.value;
                this.applyFilters();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
    }

    // Aplicar filtros
    applyFilters() {
        this.filteredCandidates = this.candidates.filter(candidate => {
            const matchesCategory = !this.currentFilters.category || 
                                  candidate.category === this.currentFilters.category;
            
            const matchesSearch = !this.currentFilters.search ||
                                candidate.name.toLowerCase().includes(this.currentFilters.search) ||
                                candidate.email.toLowerCase().includes(this.currentFilters.search);
            
            const matchesDate = this.matchesDateFilter(candidate.date, this.currentFilters.date);
            
            return matchesCategory && matchesSearch && matchesDate;
        });

        this.renderKanban();
        this.updateStats();
    }

    // Verificar filtro de fecha
    matchesDateFilter(candidateDate, filter) {
        if (!filter) return true;
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (filter) {
            case 'today':
                return candidateDate >= today;
            case 'week':
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                return candidateDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                return candidateDate >= monthAgo;
            default:
                return true;
        }
    }

    // Configurar modal
    setupModal() {
        const modal = document.getElementById('candidateModal');
        const closeBtn = document.getElementById('modalClose');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }

    // Configurar drag and drop
    setupDragAndDrop() {
        let draggedElement = null;

        // Eventos de drag
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('candidate-card')) {
                draggedElement = e.target;
                e.target.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('candidate-card')) {
                e.target.classList.remove('dragging');
                draggedElement = null;
            }
        });

        // Eventos de drop en columnas
        document.querySelectorAll('.kanban-column').forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.style.background = 'rgba(255, 77, 141, 0.1)';
            });

            column.addEventListener('dragleave', (e) => {
                if (!column.contains(e.relatedTarget)) {
                    column.style.background = 'var(--glass-bg)';
                }
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.style.background = 'var(--glass-bg)';
                
                if (draggedElement) {
                    const candidateId = parseInt(draggedElement.dataset.candidateId);
                    const newStatus = column.dataset.status;
                    this.updateStatus(candidateId, newStatus);
                }
            });
        });
    }

    // Actualizar estadísticas
    updateStats() {
        const stats = this.filteredCandidates.reduce((acc, candidate) => {
            acc.total++;
            if (candidate.status === 'new') acc.new++;
            if (candidate.status === 'approved') acc.approved++;
            return acc;
        }, { total: 0, new: 0, approved: 0 });

        const totalEl = document.getElementById('totalCandidates');
        const newEl = document.getElementById('newCandidates');
        const approvedEl = document.getElementById('approvedCandidates');

        if (totalEl) totalEl.textContent = stats.total;
        if (newEl) newEl.textContent = stats.new;
        if (approvedEl) approvedEl.textContent = stats.approved;
    }

    // Actualizar contadores de columnas
    updateColumnCounts(grouped) {
        const newCountEl = document.getElementById('newCount');
        const reviewCountEl = document.getElementById('reviewCount');
        const approvedCountEl = document.getElementById('approvedCount');
        const rejectedCountEl = document.getElementById('rejectedCount');

        if (newCountEl) newCountEl.textContent = (grouped.new || []).length;
        if (reviewCountEl) reviewCountEl.textContent = (grouped.review || []).length;
        if (approvedCountEl) approvedCountEl.textContent = (grouped.approved || []).length;
        if (rejectedCountEl) rejectedCountEl.textContent = (grouped.rejected || []).length;
    }

    // Utilidades
    getCategoryName(category) {
        const names = {
            photography: 'Fotografía',
            video: 'Video',
            streaming: 'Streaming',
            modeling: 'Modelaje',
            other: 'Otros'
        };
        return names[category] || category;
    }

    getStatusName(status) {
        const names = {
            new: 'Nueva',
            review: 'En Revisión',
            approved: 'Aprobada',
            rejected: 'Rechazada'
        };
        return names[status] || status;
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }
}

// Inicializar panel admin
let adminPanel;

document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});