// State Management
let appState = {
    vagas: JSON.parse(localStorage.getItem('forgood_vagas')) || [],
    activeVagaId: localStorage.getItem('forgood_activeVagaId') || null,
    currentSearchResults: []
};

function saveState() {
    localStorage.setItem('forgood_vagas', JSON.stringify(appState.vagas));
    localStorage.setItem('forgood_activeVagaId', appState.activeVagaId);
}

// Navigation
function showSection(sectionId) {
    const sections = ['dashboard', 'vagas', 'busca'];
    sections.forEach(s => {
        document.getElementById(`section-${s}`).style.display = s === sectionId ? 'block' : 'none';
    });

    // Update nav links active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(sectionId)) {
            link.classList.add('active');
        }
    });

    if (sectionId === 'vagas') renderVagasList();
    if (sectionId === 'dashboard') updateDashboardStats();
    if (sectionId === 'busca') {
        const activeVaga = appState.vagas.find(v => v.id === appState.activeVagaId);
        document.getElementById('search-active-vaga-label').textContent = activeVaga ? activeVaga.name : "Nenhuma vaga selecionada";
    }
}

function quickSearchForActiveVaga() {
    const activeVaga = appState.vagas.find(v => v.id === appState.activeVagaId);
    if (!activeVaga) return;
    
    showSection('busca');
    document.getElementById('job-description').value = activeVaga.name;
    // Trigger rank search immediately
    document.getElementById('btn-search').click();
}

// Vacancy Management
function createNewVaga() {
    const name = prompt("Nome da Vaga (ex: Head de Operações):");
    if (!name) return;

    const newVaga = {
        id: Date.now().toString(),
        name: name,
        status: 'Aberta',
        createdAt: new Date().toLocaleDateString(),
        candidates: []
    };

    appState.vagas.push(newVaga);
    appState.activeVagaId = newVaga.id;
    saveState();
    renderVagasList();
}

function selectVaga(id) {
    appState.activeVagaId = id;
    saveState();
    showSection('dashboard');
}

function renderVagasList() {
    const container = document.getElementById('vagas-list-grid');
    container.innerHTML = '';

    appState.vagas.forEach(vaga => {
        const card = document.createElement('div');
        card.className = `stat-card animate-fade-in ${appState.activeVagaId === vaga.id ? 'active-vaga-card' : ''}`;
        card.style.cursor = 'pointer';
        card.onclick = () => selectVaga(vaga.id);
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div class="stat-icon"><i data-lucide="briefcase"></i></div>
                <span class="badge ${vaga.status === 'Aberta' ? 'badge-match' : 'badge-closed'}">${vaga.status}</span>
            </div>
            <div class="stat-value" style="font-size: 1.2rem;">${vaga.name}</div>
            <div class="stat-label">${vaga.candidates.length} Candidatos Salvos</div>
            <p style="font-size: 0.7rem; color: var(--grey-500); margin-top: 1rem;">Criada em: ${vaga.createdAt}</p>
        `;
        container.appendChild(card);
    });
    
    if (window.lucide) window.lucide.createIcons();
}

// Dashboard Logic
function updateDashboardStats() {
    const activeVaga = appState.vagas.find(v => v.id === appState.activeVagaId);
    const banner = document.getElementById('vaga-context-banner');
    
    // Global Stats - Total de todas as vagas
    const totalCandidatosGlobal = appState.vagas.reduce((acc, v) => acc + (v.candidates ? v.candidates.length : 0), 0);
    document.getElementById('stat-vagas').textContent = appState.vagas.filter(v => v.status === 'Aberta').length;
    document.getElementById('stat-candidatos').textContent = totalCandidatosGlobal;
    
    if (activeVaga) {
        banner.style.display = 'flex';
        document.getElementById('active-vaga-name').textContent = activeVaga.name;
        document.getElementById('search-active-vaga-label').textContent = activeVaga.name;
        
        // Se houver candidatos na vaga ativa, mostra o match médio dela
        if (activeVaga.candidates && activeVaga.candidates.length > 0) {
            const avgMatch = Math.round(activeVaga.candidates.reduce((acc, curr) => acc + curr.match, 0) / activeVaga.candidates.length);
            document.getElementById('stat-match').textContent = `${avgMatch}%`;
        } else {
            document.getElementById('stat-match').textContent = '0%';
        }
    } else {
        banner.style.display = 'none';
        document.getElementById('stat-match').textContent = '0%';
    }
}

// Candidate Saving
function saveCandidate(index) {
    if (!appState.activeVagaId) {
        alert("Selecione ou crie uma vaga primeiro na seção 'Minhas Vagas'!");
        showSection('vagas');
        return;
    }

    const candidate = appState.currentSearchResults[index];
    const vaga = appState.vagas.find(v => v.id === appState.activeVagaId);
    
    if (vaga.candidates.some(c => c.linkedin === candidate.linkedin)) {
        alert("Este candidato já foi salvo nesta vaga.");
        return;
    }

    vaga.candidates.push(candidate);
    saveState();
    updateDashboardStats(); // Atualiza os números no topo imediatamente
    alert(`${candidate.name} salvo na vaga ${vaga.name}!`);
    renderCandidates(appState.currentSearchResults);
}

function connectToCandidate(name, linkedinUrl) {
    const activeVaga = appState.vagas.find(v => v.id === appState.activeVagaId);
    const vagaName = activeVaga ? activeVaga.name : "uma oportunidade estratégica";
    
    const message = `Olá ${name.split(' ')[0]}, vi seu perfil e ele é ideal para a vaga de ${vagaName}. Topa conversar?`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(message).then(() => {
        // Show a temporary notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: var(--darker); color: white;
            padding: 1rem 2rem; border-radius: 12px; z-index: 9999; box-shadow: var(--shadow-lg);
            font-size: 0.9rem; border-left: 4px solid var(--primary);
            animation: fadeIn 0.3s ease;
        `;
        toast.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">Convite Copiado!</div>
            <div style="font-size: 0.8rem; opacity: 0.8;">Cole a mensagem ao adicionar a nota no LinkedIn.</div>
        `;
        document.body.appendChild(toast);
        
        // Open LinkedIn after a short delay
        setTimeout(() => {
            window.open(linkedinUrl, '_blank');
            setTimeout(() => toast.remove(), 3000);
        }, 800);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        window.open(linkedinUrl, '_blank');
    });
}

// Search & Render
function renderCandidates(data) {
    appState.currentSearchResults = data;
    const tableBody = document.getElementById('candidates-body');
    
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 4rem; color: var(--grey-500);">Nenhum perfil carregado.</td></tr>`;
        return;
    }

    tableBody.innerHTML = '';
    data.forEach((candidate, index) => {
        const row = document.createElement('tr');
        row.className = 'animate-fade-in';
        row.style.animationDelay = `${(index + 1) * 0.1}s`;

        const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
        const isSaved = appState.activeVagaId && appState.vagas.find(v => v.id === appState.activeVagaId).candidates.some(c => c.linkedin === candidate.linkedin);
        
        row.innerHTML = `
            <td><div class="rank-pill ${rankClass}">${index + 1}</div></td>
            <td>
                <div class="candidate-info">
                    ${candidate.photo ? `
                        <div class="avatar" style="width: 40px; height: 40px; margin-right: 15px;">
                            <img src="${candidate.photo}" alt="${candidate.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid var(--grey-100);">
                        </div>
                    ` : ''}
                    <div>
                        <span class="candidate-name">${candidate.name}</span>
                        <span class="candidate-title">${candidate.title}</span>
                        <div style="font-size: 0.75rem; color: var(--grey-500); display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                            <i data-lucide="map-pin" style="width: 12px;"></i> ${candidate.location}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div style="font-weight: 600; color: var(--darker);">${candidate.company}</div>
            </td>
            <td><span class="badge badge-match">${candidate.match}% Match</span></td>
            <td style="font-size: 0.8rem; color: var(--grey-600); line-height: 1.4; max-width: 400px;">
                ${candidate.experience}
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 0.8rem; align-items: flex-start;">
                    <div style="display: flex; gap: 0.5rem;">
                        <a href="${candidate.linkedin}" target="_blank" class="linkedin-link-premium" title="Ver Perfil no LinkedIn">
                            <i data-lucide="linkedin" style="width: 18px;"></i>
                            <span>LinkedIn</span>
                        </a>
                        <button onclick="connectToCandidate('${candidate.name.replace(/'/g, "\\'")}', '${candidate.linkedin}')" class="btn-connect" title="Enviar Mensagem">
                            <i data-lucide="send" style="width: 14px;"></i>
                            Conectar
                        </button>
                    </div>
                    <button class="btn-search" style="height: auto; padding: 0.6rem 1.2rem; font-size: 0.8rem; width: 100%; background: ${isSaved ? '#4CAF50' : 'var(--darker)'}" onclick="saveCandidate(${index})">
                        ${isSaved ? 'Candidato Salvo' : 'Salvar na Vaga'}
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    if (window.lucide) window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    showSection('dashboard');
    
    const searchBtn = document.getElementById('btn-search');
    searchBtn.addEventListener('click', async () => {
        const query = document.getElementById('job-description').value.trim();
        if (!query) return;
        
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Buscando...';
        if (window.lucide) window.lucide.createIcons();
        
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            renderCandidates(results);
        } catch (error) {
            console.error(error);
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i data-lucide="zap"></i> Rankear';
            if (window.lucide) window.lucide.createIcons();
        }
    });
});
