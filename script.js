const links = document.querySelectorAll("#nav a");
const sections = document.querySelectorAll(".view-section");

const vistas = {
    dia: "view-day", semana: "view-week", mes: "view-month"
};

links.forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        const target = link.getAttribute("href").substring(1);

        // 1. Apagar todas las píldoras
        links.forEach(function (item) {
            item.classList.remove("active");
        });

        // 2. Encender la píldora que pulsé
        link.classList.add("active");

        // 3. Apagar todas las secciones
        sections.forEach(function (section) {
            section.classList.remove("active");
        });

        // 4. Encender la sección que corresponde
        const sectionToShow = document.getElementById(vistas[target]);
        sectionToShow.classList.add("active");
    });
});

const avatarButton = document.querySelector("#avatar-display");

avatarButton.addEventListener("click", function () {
    console.log("Click en avatar");

    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");

    if (currentTheme === "light") {
        html.setAttribute("data-theme", "dark");
    } else {
        html.setAttribute("data-theme", "light");
    }
});