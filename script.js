// State Management
let appState = {
    vagas: JSON.parse(localStorage.getItem('forgood_vagas')) || [],
    bancoDeTalentos: JSON.parse(localStorage.getItem('forgood_banco')) || [],
    activeVagaId: localStorage.getItem('forgood_activeVagaId') || null,
    currentSearchResults: []
};

// FUNÇÃO PARA LIMPAR TUDO (Chamada via console ou botão se necessário)
function clearAllData() {
    if (confirm("Isso apagará permanentemente todas as vagas e o banco de talentos. Confirmar?")) {
        localStorage.clear();
        appState = { vagas: [], bancoDeTalentos: [], activeVagaId: null, currentSearchResults: [] };
        saveState();
        location.reload();
    }
}

function saveState() {
    localStorage.setItem('forgood_vagas', JSON.stringify(appState.vagas));
    localStorage.setItem('forgood_banco', JSON.stringify(appState.bancoDeTalentos));
    localStorage.setItem('forgood_activeVagaId', appState.activeVagaId);
}

// Navigation
function showSection(sectionId) {
    const sections = ['dashboard', 'vagas', 'busca', 'banco'];
    sections.forEach(s => {
        const el = document.getElementById(`section-${s}`);
        if (el) el.style.display = s === sectionId ? 'block' : 'none';
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(sectionId)) {
            link.classList.add('active');
        }
    });

    if (sectionId === 'vagas') renderVagasList();
    if (sectionId === 'dashboard') updateDashboardStats();
    if (sectionId === 'banco') renderBancoTalentos();
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
    document.getElementById('btn-search').click();
}

// Vacancy Management
function createNewVaga() {
    const name = prompt("Nome da Vaga (ex: Head de Operações):");
    if (!name) return;
    const newVaga = { id: Date.now().toString(), name: name, status: 'Aberta', createdAt: new Date().toLocaleDateString(), candidates: [] };
    appState.vagas.push(newVaga);
    appState.activeVagaId = newVaga.id;
    saveState();
    renderVagasList();
    updateDashboardStats();
}

function selectVaga(id) {
    appState.activeVagaId = id;
    saveState();
    showSection('dashboard');
}

function renderVagasList() {
    const container = document.getElementById('vagas-list-grid');
    if (!container) return;
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
    const totalCandidatosGlobal = appState.bancoDeTalentos.length;
    
    const vCountEl = document.getElementById('stat-vagas');
    const cCountEl = document.getElementById('stat-candidatos');
    if (vCountEl) vCountEl.textContent = appState.vagas.filter(v => v.status === 'Aberta').length;
    if (cCountEl) cCountEl.textContent = totalCandidatosGlobal;
    
    if (activeVaga) {
        if (banner) banner.style.display = 'flex';
        const activeVagaNameEl = document.getElementById('active-vaga-name');
        if (activeVagaNameEl) activeVagaNameEl.textContent = activeVaga.name;
        
        const savedTableSection = document.getElementById('saved-candidates-section');
        const savedTableBody = document.getElementById('saved-candidates-body');
        
        if (activeVaga.candidates && activeVaga.candidates.length > 0) {
            if (savedTableSection) savedTableSection.style.display = 'block';
            if (savedTableBody) {
                savedTableBody.innerHTML = '';
                activeVaga.candidates.forEach((candidate) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <div class="candidate-info">
                                <div>
                                    <span class="candidate-name" style="display: block;">${candidate.name}</span>
                                    <span class="candidate-title" style="display: block; font-size: 0.75rem;">${candidate.title}</span>
                                </div>
                            </div>
                        </td>
                        <td><div style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${candidate.company}</div></td>
                        <td><span class="badge badge-match">${candidate.match}%</span></td>
                        <td><span style="font-size: 0.8rem; color: var(--grey-500);">Mapeado via Busca</span></td>
                        <td>
                            <div style="display: flex; gap: 0.8rem; align-items: center;">
                                <a href="${candidate.linkedin}" target="_blank" class="linkedin-link-premium" style="padding: 0.5rem; border-radius: 8px;">
                                    <i data-lucide="linkedin" style="width: 16px;"></i>
                                </a>
                                <button class="btn-search" style="background: #ff4d4d; padding: 0.5rem; border-radius: 8px; height: auto; width: auto; border: none; cursor: pointer; color: white;" onclick="removeCandidate('${activeVaga.id}', '${candidate.linkedin}')">
                                    <i data-lucide="trash-2" style="width: 16px;"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    savedTableBody.appendChild(row);
                });
            }
            const avgMatch = Math.round(activeVaga.candidates.reduce((acc, curr) => acc + curr.match, 0) / activeVaga.candidates.length);
            const matchEl = document.getElementById('stat-match');
            if (matchEl) matchEl.textContent = `${avgMatch}%`;
        } else {
            if (savedTableSection) savedTableSection.style.display = 'none';
            const matchEl = document.getElementById('stat-match');
            if (matchEl) matchEl.textContent = '0%';
        }
    } else {
        if (banner) banner.style.display = 'none';
        const savedTableSection = document.getElementById('saved-candidates-section');
        if (savedTableSection) savedTableSection.style.display = 'none';
        const matchEl = document.getElementById('stat-match');
        if (matchEl) matchEl.textContent = '0%';
    }
    if (window.lucide) window.lucide.createIcons();
}

// Banco de Talentos Logic
function renderBancoTalentos() {
    const container = document.getElementById('banco-talentos-body');
    if (!container) return;
    if (appState.bancoDeTalentos.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 4rem; color: var(--grey-500);">Seu banco está vazio. Salve candidatos na busca para visualizá-los aqui.</td></tr>';
        return;
    }
    container.innerHTML = '';
    appState.bancoDeTalentos.forEach(candidate => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="candidate-info">
                    <div>
                        <span class="candidate-name" style="display: block;">${candidate.name}</span>
                        <span class="candidate-title" style="display: block; font-size: 0.75rem;">${candidate.title}</span>
                    </div>
                </div>
            </td>
            <td><strong>${candidate.company}</strong></td>
            <td><span class="badge badge-match">${candidate.match}%</span></td>
            <td>${candidate.savedAt || new Date().toLocaleDateString()}</td>
            <td>
                <div style="display: flex; gap: 0.8rem; align-items: center;">
                    <a href="${candidate.linkedin}" target="_blank" class="linkedin-link-premium" style="padding: 0.5rem; border-radius: 8px;">
                        <i data-lucide="linkedin" style="width: 16px;"></i>
                    </a>
                    <button class="btn-search" style="background: #ff4d4d; padding: 0.5rem; border-radius: 8px; height: auto; width: auto; color: white;" onclick="removeFromBank('${candidate.linkedin}')">
                        <i data-lucide="trash-2" style="width: 16px;"></i>
                    </button>
                </div>
            </td>
        `;
        container.appendChild(row);
    });
    if (window.lucide) window.lucide.createIcons();
}

function removeFromBank(linkedinUrl) {
    if (!confirm("Remover do banco de talentos?")) return;
    appState.bancoDeTalentos = appState.bancoDeTalentos.filter(c => c.linkedin !== linkedinUrl);
    saveState();
    renderBancoTalentos();
    updateDashboardStats();
}

// Candidate Saving
function saveCandidate(index) {
    const candidate = appState.currentSearchResults[index];
    candidate.savedAt = new Date().toLocaleDateString();

    if (!appState.bancoDeTalentos.some(c => c.linkedin === candidate.linkedin)) {
        appState.bancoDeTalentos.push(candidate);
    }

    if (appState.activeVagaId) {
        const vaga = appState.vagas.find(v => v.id === appState.activeVagaId);
        if (!vaga.candidates.some(c => c.linkedin === candidate.linkedin)) {
            vaga.candidates.push(candidate);
        }
    }

    saveState();
    updateDashboardStats();
    renderCandidates(appState.currentSearchResults);
    
    const toast = document.createElement('div');
    toast.style.cssText = `position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #4CAF50; color: white; padding: 1rem 2rem; border-radius: 100px; z-index: 10000; box-shadow: var(--shadow-lg); font-weight: 600; animation: fadeInUp 0.3s ease;`;
    toast.textContent = `${candidate.name} salvo com sucesso no banco!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function removeCandidate(vagaId, linkedinUrl) {
    if (!confirm("Remover da vaga?")) return;
    const vaga = appState.vagas.find(v => v.id === vagaId);
    vaga.candidates = vaga.candidates.filter(c => c.linkedin !== linkedinUrl);
    saveState();
    updateDashboardStats();
}

function connectToCandidate(name, linkedinUrl) {
    const activeVaga = appState.vagas.find(v => v.id === appState.activeVagaId);
    const vagaName = activeVaga ? activeVaga.name : "uma oportunidade estratégica";
    const message = `Olá ${name.split(' ')[0]}, vi seu perfil e ele é ideal para a vaga de ${vagaName}. Topa conversar?`;
    navigator.clipboard.writeText(message).then(() => {
        const toast = document.createElement('div');
        toast.style.cssText = `position: fixed; top: 20px; right: 20px; background: var(--darker); color: white; padding: 1rem 2rem; border-radius: 12px; z-index: 9999; box-shadow: var(--shadow-lg); font-size: 0.9rem; border-left: 4px solid var(--primary); animation: fadeIn 0.3s ease;`;
        toast.innerHTML = `<div style="font-weight: 600; margin-bottom: 4px;">Convite Copiado!</div><div style="font-size: 0.8rem; opacity: 0.8;">Cole a mensagem ao adicionar a nota no LinkedIn.</div>`;
        document.body.appendChild(toast);
        setTimeout(() => { window.open(linkedinUrl, '_blank'); setTimeout(() => toast.remove(), 3000); }, 800);
    });
}

// Search & Render
function renderCandidates(data) {
    appState.currentSearchResults = data;
    const tableBody = document.getElementById('candidates-body');
    if (!tableBody) return;
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
        const isSaved = appState.bancoDeTalentos.some(c => c.linkedin === candidate.linkedin);
        
        row.innerHTML = `
            <td><div class="rank-pill ${rankClass}">${index + 1}</div></td>
            <td>
                <div class="candidate-info">
                    ${candidate.photo ? `<div class="avatar" style="width: 40px; height: 40px; margin-right: 15px;"><img src="${candidate.photo}" alt="${candidate.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid var(--grey-100);"></div>` : ''}
                    <div>
                        <span class="candidate-name" style="display: block;">${candidate.name}</span>
                        <span class="candidate-title" style="display: block; font-size: 0.75rem;">${candidate.title}</span>
                        <div style="font-size: 0.75rem; color: var(--grey-500); display: flex; align-items: center; gap: 4px; margin-top: 4px;"><i data-lucide="map-pin" style="width: 12px;"></i> ${candidate.location}</div>
                    </div>
                </div>
            </td>
            <td><div style="font-weight: 600; color: var(--darker);">${candidate.company}</div></td>
            <td><span class="badge badge-match">${candidate.match}% Match</span></td>
            <td style="font-size: 0.8rem; color: var(--grey-600); line-height: 1.4; max-width: 400px;">${candidate.experience}</td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 0.8rem; align-items: flex-start;">
                    <div style="display: flex; gap: 0.5rem;">
                        <a href="${candidate.linkedin}" target="_blank" class="linkedin-link-premium" title="Ver Perfil"><i data-lucide="linkedin" style="width: 18px;"></i></a>
                        <button onclick="connectToCandidate('${candidate.name.replace(/'/g, "\\'")}', '${candidate.linkedin}')" class="btn-connect" title="Conectar"><i data-lucide="send" style="width: 14px;"></i></button>
                    </div>
                    <button class="btn-search" style="height: auto; padding: 0.6rem 1.2rem; font-size: 0.8rem; width: 100%; background: ${isSaved ? '#4CAF50' : 'var(--darker)'}" onclick="saveCandidate(${index})">
                        ${isSaved ? 'No Banco' : 'Salvar no Banco'}
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    if (window.lucide) window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    // RESET INICIAL PARA LIMPAR TUDO COMO SOLICITADO
    // Descomente as linhas abaixo se quiser limpar ao carregar
    // localStorage.clear();
    // appState = { vagas: [], bancoDeTalentos: [], activeVagaId: null, currentSearchResults: [] };
    
    showSection('dashboard');
    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const query = document.getElementById('job-description').value.trim();
            if (!query) return;
            searchBtn.disabled = true;
            searchBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Buscando na Internet...';
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
    }
});

function exportVagaData() {
    const activeVaga = appState.vagas.find(v => v.id === appState.activeVagaId);
    if (!activeVaga) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeVaga, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vaga_${activeVaga.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function exportAllTalents() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState.bancoDeTalentos, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `banco_talentos_forgood.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

const style = document.createElement('style');
style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`;
document.head.appendChild(style);
