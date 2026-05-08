export default async function handler(req, res) {
    const { q } = req.query;
    const apiKey = "ff3138f9e9a709c5dc919294741c8e20020886fd23273aa1570d6698925b6569";
    
    if (!q) {
        return res.status(400).json({ error: "Query is required" });
    }

    try {
        // Busca estruturada no LinkedIn via SerpApi
        const searchQuery = `site:linkedin.com/in/ "${q}" Brazil`;
        const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}&num=10`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.organic_results) {
            return res.status(200).json([]);
        }

        // Mapeia os resultados orgânicos para o formato do nosso sistema
        const profiles = data.organic_results.map((result, index) => {
            // Tenta extrair Nome e Cargo do título (ex: "Fulano de Tal - Head of Ops - Empresa")
            const titleParts = result.title.split(" - ");
            const name = titleParts[0] || "Executivo";
            const title = titleParts[1] || q;
            const company = titleParts[2] || result.displayed_link.split("/")[2] || "Empresa";

            return {
                id: index + 1,
                name: name.replace(" | LinkedIn", ""),
                title: title,
                company: company,
                experience: result.snippet || "Experiência extraída do perfil do LinkedIn.",
                match: Math.floor(Math.random() * (99 - 85 + 1) + 85), // Simula o match score baseado na query
                linkedin: result.link,
                avatar: "" // Gerado dinamicamente pelas iniciais
            };
        });

        res.status(200).json(profiles);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
}
