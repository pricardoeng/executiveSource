const candidates = [
    {
        id: 1,
        name: "Mariana Silva",
        title: "Chief Technology Officer",
        company: "TechFlow Solutions",
        experience: "15+ anos em engenharia e escala global",
        match: 98,
        linkedin: "https://linkedin.com/in/mariana-silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana"
    },
    {
        id: 2,
        name: "Carlos Eduardo",
        title: "VP of Product",
        company: "Innovate Labs",
        experience: "12 anos liderando times multidisciplinares",
        match: 94,
        linkedin: "https://linkedin.com/in/carlos-eduardo",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
    },
    {
        id: 3,
        name: "Beatriz Santos",
        title: "Director of Engineering",
        company: "DataPulse",
        experience: "Ex-Google, 10 anos em infraestrutura",
        match: 91,
        linkedin: "https://linkedin.com/in/beatriz-santos",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beatriz"
    },
    {
        id: 4,
        name: "Roberto Almeida",
        title: "Chief Operating Officer",
        company: "Global Logistics",
        experience: "Especialista em M&A e Expansão Latam",
        match: 87,
        linkedin: "https://linkedin.com/in/roberto-almeida",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto"
    },
    {
        id: 5,
        name: "Fernanda Costa",
        title: "Head of Growth",
        company: "ScaleUp Co",
        experience: "8 anos em SaaS e estratégias PLG",
        match: 84,
        linkedin: "https://linkedin.com/in/fernanda-costa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda"
    }
];

function renderCandidates(data) {
    const tableBody = document.getElementById('candidates-body');
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
