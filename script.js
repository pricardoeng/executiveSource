const candidates = []; // Base limpa para busca real

function renderCandidates(data) {
    const tableBody = document.getElementById('candidates-body');
    
    // Update Stats
    document.getElementById('stat-candidatos').textContent = data.length;
    if (data.length > 0) {
        const avgMatch = Math.round(data.reduce((acc, curr) => acc + curr.match, 0) / data.length);
        document.getElementById('stat-match').textContent = `${avgMatch}%`;
        document.getElementById('stat-vagas').textContent = "1"; // Simula 1 vaga ativa para a busca
    } else {
        document.getElementById('stat-match').textContent = `0%`;
        document.getElementById('stat-vagas').textContent = "0";
    }

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 4rem; color: var(--grey-500);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <i data-lucide="search-x" style="width: 48px; height: 48px; opacity: 0.3;"></i>
                        <p>Nenhum perfil carregado. Insira os requisitos acima para iniciar a busca real.</p>
                    </div>
                </td>
            </tr>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    tableBody.innerHTML = '';

    data.forEach((candidate, index) => {
        const row = document.createElement('tr');
        row.className = 'animate-fade-in';
        row.style.animationDelay = `${(index + 1) * 0.1}s`;

        const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
        
        row.innerHTML = `
            <td>
                <div class="rank-pill ${rankClass}">
                    ${index + 1}
                </div>
            </td>
            <td>
                <div class="candidate-info">
                    <div class="avatar" style="width: 35px; height: 35px;">
                        <img src="${candidate.avatar}" alt="${candidate.name}">
                    </div>
                    <div>
                        <span class="candidate-name">${candidate.name}</span>
                        <span class="candidate-title">${candidate.title}</span>
                    </div>
                </div>
            </td>
            <td>${candidate.company}</td>
            <td>
                <span class="badge badge-match">${candidate.match}% Match</span>
            </td>
            <td style="font-size: 0.85rem; color: var(--grey-600);">${candidate.experience}</td>
            <td>
                <a href="${candidate.linkedin}" target="_blank" class="linkedin-link">
                    <i data-lucide="linkedin" style="width: 16px;"></i>
                    Perfil
                </a>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Refresh Lucide icons for the new elements
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    renderCandidates(candidates);
    
    const searchBtn = document.getElementById('btn-search');
    const jobInput = document.getElementById('job-description');

    searchBtn.addEventListener('click', () => {
        const query = jobInput.value.trim();
        
        // Visual feedback for searching
        searchBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Processando...';
        window.lucide.createIcons();
        
        setTimeout(() => {
            // Simulate ranking logic
            let filtered = [...candidates];
            if (query) {
                // Just a mock: shuffle candidates to simulate re-ranking based on query
                filtered = filtered.sort(() => Math.random() - 0.5);
                // Update match scores randomly for simulation
                filtered = filtered.map(c => ({
                    ...c,
                    match: Math.floor(Math.random() * (99 - 80 + 1) + 80)
                })).sort((a, b) => b.match - a.match);
            }
            
            renderCandidates(filtered);
            searchBtn.innerHTML = '<i data-lucide="zap"></i> Rankear';
            window.lucide.createIcons();
        }, 1200);
    });
});

// Add rotation animation for the loader
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
