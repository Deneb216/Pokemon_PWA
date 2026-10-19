const urlParams = new URLSearchParams(window.location.search);
const pokemonId = urlParams.get('id');

const nombrePokemon = document.getElementById('nombrePokemon');
const contenedorDetalles = document.getElementById('contenedorDetalles');
const btnVolver = document.getElementById('btnVolver');

btnVolver.addEventListener('click', () => {
    window.location.href = 'index.html';
});

const cargarDetalles = async () => {
    if (!pokemonId) {
        contenedorDetalles.innerHTML = "<p>Pokémon no encontrado.</p>";
        return;
    }

    try {
        // Recuerda la diagonal al final para evitar problemas de caché
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`);
        const pokemon = await respuesta.json();

        nombrePokemon.innerText = pokemon.name;
        
        // Imágenes Normal y Shiny
        const imgNormal = pokemon.sprites.other['official-artwork'].front_default;
        const imgShiny = pokemon.sprites.other['official-artwork'].front_shiny;
        
        // URL del Grito (Audio)
        const audioUrl = pokemon.cries.latest;

        // Tipos
        let tiposHtml = '';
        pokemon.types.forEach(t => {
            tiposHtml += `<span class="tipo-badge">${t.type.name}</span>`;
        });

        // Habilidades (mostramos todas separadas por comas)
        const habilidades = pokemon.abilities.map(a => a.ability.name).join(', ');

        // Generar Barras de Estadísticas (Stats)
        let statsHtml = '<div class="stats-container"><h3>Estadísticas Base</h3>';
        pokemon.stats.forEach(s => {
            // Recortamos el nombre para que no ocupe tanto espacio (ej. special-attack -> SP-ATK)
            let statName = s.stat.name.toUpperCase().replace('SPECIAL-', 'SP-');
            const statValue = s.base_stat;
            // Calculamos el ancho de la barra (usamos 150 como un buen valor máximo de referencia)
            const anchoBarra = Math.min((statValue / 150) * 100, 100);
            
            statsHtml += `
                <div class="stat-row">
                    <span class="stat-name">${statName}</span>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill" style="width: ${anchoBarra}%">
                            ${statValue}
                        </div>
                    </div>
                </div>
            `;
        });
        statsHtml += '</div>';

        // Inyectar todo al HTML
        contenedorDetalles.innerHTML = `
            <div class="imagen-container">
                <img id="imgPokemon" src="${imgNormal}" alt="${pokemon.name}">
                <div class="botones-accion">
                    <button id="btnShiny" class="btn-accion">✨ Ver Shiny</button>
                    <button id="btnAudio" class="btn-accion">🔊 Grito</button>
                </div>
            </div>
            <h2>N° ${pokemon.id}</h2>
            <div class="tipos-container">${tiposHtml}</div>
            
            <div class="estadisticas">
                <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
                <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                <p><strong>Habilidades:</strong> <span style="text-transform: capitalize;">${habilidades}</span></p>
                <p><strong>Experiencia Base:</strong> ${pokemon.base_experience}</p>
            </div>
            
            ${statsHtml}
        `;

        // --- LÓGICA DE LOS BOTONES --- //
        
        // Botón Shiny
        const imgElement = document.getElementById('imgPokemon');
        const btnShiny = document.getElementById('btnShiny');
        let mostrandoShiny = false;

        btnShiny.addEventListener('click', () => {
            mostrandoShiny = !mostrandoShiny;
            imgElement.src = mostrandoShiny ? imgShiny : imgNormal;
            btnShiny.innerText = mostrandoShiny ? "⭐ Ver Normal" : "✨ Ver Shiny";
        });

        // Botón Audio
        const btnAudio = document.getElementById('btnAudio');
        btnAudio.addEventListener('click', () => {
            const sonido = new Audio(audioUrl);
            sonido.play().catch(error => console.log("Error al reproducir audio:", error));
        });

    } catch (error) {
        console.error("Error al cargar detalles:", error);
        contenedorDetalles.innerHTML = "<p>Error al cargar la información.</p>";
    }
};

cargarDetalles();