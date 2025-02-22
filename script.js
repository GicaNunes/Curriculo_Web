// Função para mudar o título da página com base na hora do dia
function updateTitle() {
    const now = new Date();
    const hour = now.getHours();
    let greeting;

    if (hour >= 5 && hour < 12) {
        greeting = "Bom Dia!";
    } else if (hour >= 12 && hour < 18) {
        greeting = "Boa Tarde!";
    } else {
        greeting = "Boa Noite!";
    }

    document.title = `${greeting} Currículo de Giselle Nunes Santana`;
}

window.addEventListener('load', updateTitle);
