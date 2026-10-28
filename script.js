/*
 * script.js - Lógica principal del Delivery Analytics Dashboard
 *
 * Este archivo se carga al final del <body> de index.html. Por eso, cuando
 * se ejecuta, todo el HTML ya existe y getElementById / querySelector
 * pueden encontrar sus elementos.
 *
 * Orden de ejecución (de arriba hacia abajo, una sola vez al cargar):
 *   1. Navegación entre vistas (Día / Semana / Mes).
 *   2. Cambio de tema claro / oscuro.
 *   3. Datos de ejemplo del día (arreglo "pedidos").
 *   4. Dibujo de la tabla del día.
 *   5. Cálculo de métricas y escritura de los resúmenes de "Desempeño del turno".
 *   6. Perspectivas de las tarjetas: define pintarTarjeta, que pinta cada
 *      tarjeta al cargar y en cada clic.
 *
 * Los bloques 1 y 2 solo "programan" eventos: su código interno corre
 * después, cuando el usuario hace clic. Los bloques 3, 4 y 5 corren de
 * inmediato al cargar la página. El bloque 6 hace las dos cosas: programa el
 * clic de las tarjetas y las pinta una vez al cargar.
 */

/* ============================================================
 * 1. NAVEGACIÓN ENTRE VISTAS (SPA)
 * ============================================================ */

// Los tres enlaces del menú (<a> dentro de <nav id="nav">: Día, Semana, Mes).
const links = document.querySelectorAll("#nav a");
// Las tres secciones de contenido (<section class="view-section"> en index.html).
const sections = document.querySelectorAll(".view-section");

// Diccionario que traduce el href de cada enlace (sin el "#") al id de la
// sección que debe mostrarse. Ejemplo: href="#dia" -> "dia" -> "view-day".
const vistas = {
    dia: "view-day", semana: "view-week", mes: "view-month"
};

// Se recorre cada enlace para programar su clic. Todas las vistas ya están
// en el HTML; aquí solo se decide cuál lleva la clase "active" (en
// styles.css, .view-section sin "active" es display: none).
links.forEach(function (link) {
    link.addEventListener("click", function (event) {
        // Evita el comportamiento por defecto de un enlace con ancla (#dia):
        // saltar a esa posición de la página y cambiar la URL.
        event.preventDefault();
        // "#dia" -> "dia": se quita el primer carácter para obtener la clave
        // que existe en el diccionario "vistas".
        const target = link.getAttribute("href").substring(1);
        // Patrón "apagar todo, encender uno": primero se limpia el estado
        // anterior y luego se marca solo el elemento elegido.
        links.forEach(function (item) {
            item.classList.remove("active");
        });
        link.classList.add("active");
        sections.forEach(function (section) {
            section.classList.remove("active");
        });
        // vistas[target] devuelve el id de la sección. Si el href no tuviera
        // una clave en "vistas", getElementById devolvería null y la línea
        // siguiente produciría un error.
        const sectionToShow = document.getElementById(vistas[target]);
        sectionToShow.classList.add("active");
    });
});

/* ============================================================
 * 2. MODO CLARO / OSCURO
 * ============================================================ */

// El avatar "MR" del header (<button id="avatar-display">) funciona como
// botón de cambio de tema.
const avatarButton = document.querySelector("#avatar-display");

avatarButton.addEventListener("click", function () {
    // document.documentElement es la etiqueta <html>, donde vive el atributo
    // data-theme (el HTML lo inicia en "light").
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    // Este código solo cambia el atributo. Los colores cambian porque
    // styles.css redefine sus variables bajo [data-theme="dark"].
    // El tema no se guarda en ningún lugar: al recargar vuelve a "light".
    if (currentTheme === "light") {
        html.setAttribute("data-theme", "dark");
    } else {
        html.setAttribute("data-theme", "light");
    }
});

/* ============================================================
 * 3. DATOS DEL DÍA
 * ============================================================ */

// Aporte fijo del restaurante por cada pedido. Se escribe en mayúsculas por
// convención: es una constante que no debe cambiar mientras corre la app.
const PAGO_RESTAURANTE = 1;
// Usuario que está usando la app. Se compara con pedido.repartidor para
// decidir cuáles pedidos son "míos" y cuáles de "compañeros". Hoy es un
// valor fijo; el código actual no lo obtiene de ninguna sesión o login.
const USUARIO_ACTUAL = "Miguel";

// Arreglo de objetos: cada objeto es un pedido. Son datos de ejemplo escritos
// a mano; el código actual no los lee de ningún servidor ni los guarda.
// Solo se almacena lo que no se puede calcular: el total de cada carrera
// se calcula cuando hace falta (aporteCliente + PAGO_RESTAURANTE).
const pedidos = [
    { hora: "08:15", aporteCliente: 3, repartidor: "Miguel" },
    { hora: "09:00", aporteCliente: 5, repartidor: "Oliver" },
    { hora: "09:45", aporteCliente: 2, repartidor: "Miguel" },
    { hora: "10:30", aporteCliente: 4, repartidor: "Miguel" },
    { hora: "11:10", aporteCliente: 6, repartidor: "Oliver" },
    { hora: "12:00", aporteCliente: 3, repartidor: "Miguel" },
    { hora: "12:50", aporteCliente: 5, repartidor: "Oliver" },
    { hora: "13:30", aporteCliente: 2, repartidor: "Miguel" },
    { hora: "14:15", aporteCliente: 4, repartidor: "Miguel" },
    { hora: "15:00", aporteCliente: 3, repartidor: "Oliver" },
    { hora: "16:20", aporteCliente: 5, repartidor: "Miguel" },
    { hora: "17:10", aporteCliente: 2, repartidor: "Oliver" },
    { hora: "18:25", aporteCliente: 6, repartidor: "Miguel" },
    { hora: "19:15", aporteCliente: 3, repartidor: "Miguel" },
    { hora: "20:00", aporteCliente: 4, repartidor: "Oliver" },
    { hora: "20:45", aporteCliente: 5, repartidor: "Miguel" },
    { hora: "21:30", aporteCliente: 2, repartidor: "Oliver" },
    { hora: "22:10", aporteCliente: 4, repartidor: "Miguel" },
    { hora: "22:50", aporteCliente: 3, repartidor: "Miguel" },
    { hora: "23:20", aporteCliente: 5, repartidor: "Oliver" }
];

/* ============================================================
 * 4. TABLA DEL DÍA
 * ============================================================ */

// <tbody id="deliveries-table-body"> está vacío en el HTML; aquí se le
// agrega una fila por cada pedido.
const tbodyDia = document.getElementById("deliveries-table-body");

// forEach entrega en cada vuelta el pedido y su posición (empieza en 0).
// Las filas salen en el mismo orden del arreglo, sin ordenar por hora.
pedidos.forEach(function (pedido, posicion) {
    const total = pedido.aporteCliente + PAGO_RESTAURANTE;
    // Etiqueta del repartidor: texto y color. Los valores iniciales se
    // reemplazan en ambas ramas del if/else de abajo.
    let quienEs = pedido.repartidor;
    let quienEsColor = "green";
    // Si el pedido es del usuario actual se muestra "Yo" (verde); si no,
    // "Compañero" (azul). Las clases tag-green y tag-blue están en styles.css.
    if (quienEs === USUARIO_ACTUAL) {
        quienEs = "Yo";
        quienEsColor = "green";
    } else {
        quienEs = "Compañero";
        quienEsColor = "blue";
    }
    // La fila <tr> se crea solo en memoria: no se ve hasta que se inserta
    // en el documento (última línea de esta función).
    const fila = document.createElement("tr");
    // Una celda <td> por cada <th> de la tabla, en el mismo orden:
    // #, Hora, Aporte Cliente, Aporte Restaurante, Total Carrera, Repartidor.
    // ${...} inserta el valor de una expresión dentro del texto.
    // toFixed(2) deja 2 decimales pero devuelve texto, por eso aquí solo se
    // usa para mostrar, no para calcular.
    // "cell-key-figure" resalta en negrita la cifra clave (el total).
    fila.innerHTML = `
    <td>${posicion + 1}</td>
    <td>${pedido.hora}</td>
    <td>${pedido.aporteCliente.toFixed(2) + "$"}</td>
    <td>${PAGO_RESTAURANTE.toFixed(2) + "$"}</td>
    <td class="cell-key-figure">${total.toFixed(2) + "$"}</td>
    <td><span class="tag tag-${quienEsColor}">${quienEs}</span></td>
    `;
    // appendChild hace visible la fila: la agrega como último hijo del <tbody>.
    tbodyDia.appendChild(fila);
});

/* ============================================================
 * 5. MÉTRICAS DEL DÍA
 * ============================================================
 * Cada métrica se calcula para tres "perspectivas":
 *   - user      -> pedidos de USUARIO_ACTUAL ("mine...")
 *   - coworkers -> pedidos de los demás repartidores ("them...")
 *   - team      -> todos los pedidos juntos ("team...")
 * Los cálculos se hacen UNA vez al cargar la página. Los clics sobre las
 * tarjetas (bloque 6) no recalculan: solo leen estas variables.
 */

// Elementos de las tarjetas Pedidos e Ingresos (<p class="metric-value">).
// Este bloque solo los guarda: quien escribe en ellos es pintarTarjeta
// (bloque 6). El de la tarjeta Promedio se declara más abajo.
const deliveriesAmount = document.getElementById("metric-orders");

const totalIncome = document.getElementById("metric-income");

// --- Ingreso total del equipo ---
// Acumulador: se inicia en 0 fuera del bucle para que no se reinicie en
// cada vuelta. Cada pedido le suma su total.
let finalIncome = 0;

pedidos.forEach(function (pedido) {
    // El "total" de la tabla vive solo dentro de aquel bucle, por eso aquí
    // se vuelve a calcular.
    const total = pedido.aporteCliente + PAGO_RESTAURANTE;
    finalIncome = finalIncome + total;
});

// --- Cantidad de pedidos por grupo (tarjeta "Desempeño del turno") ---
// <p id="mine-orders"> y <p id="them-orders"> muestran la cantidad de
// pedidos del usuario y de sus compañeros.
const currentUserCard = document.getElementById("mine-orders");

const otherUserCard = document.getElementById("them-orders");

// Un contador por grupo, iniciados en 0 fuera del bucle.
let mineOrders = 0;
let themOrders = 0;

pedidos.forEach(function (pedido) {
    // Cada pedido suma 1 al contador del grupo al que pertenece.
    if (pedido.repartidor === USUARIO_ACTUAL) {
        mineOrders = mineOrders + 1;
    } else {
        themOrders = themOrders + 1;
    }
});

currentUserCard.textContent = mineOrders;
otherUserCard.textContent = themOrders;

// --- Ingresos por grupo ---
// <span id="mine-income"> y <span id="them-income"> muestran el dinero
// acumulado de cada grupo en la tarjeta "Desempeño del turno".
const currentUserCardIncome = document.getElementById("mine-income");
const otherUserCardIncome = document.getElementById("them-income");

let mineIncome = 0;
let themIncome = 0;

pedidos.forEach(function (pedido) {
    // Esta fórmula (aporteCliente + PAGO_RESTAURANTE) aparece en tres
    // bucles del archivo.
    const totalOrder = pedido.aporteCliente + PAGO_RESTAURANTE;
    // El total de la carrera se suma al acumulador del grupo del repartidor.
    if (pedido.repartidor === USUARIO_ACTUAL) {
        mineIncome = mineIncome + totalOrder;
    } else {
        themIncome = themIncome + totalOrder;
    }
});

currentUserCardIncome.textContent = mineIncome.toFixed(2) + "$ acumulados";
otherUserCardIncome.textContent = themIncome.toFixed(2) + "$ acumulados";

// --- Promedio por pedido ---
// Promedio = ingreso total / cantidad de pedidos, calculado por perspectiva.
const deliveriesAverage = document.getElementById("metric-average");

// Los totales del equipo ya se conocen. teamOrders es el largo del arreglo.
// teamIncome guarda en un const el valor FINAL de finalIncome: finalIncome es
// un let porque cambia mientras el bucle suma, pero al terminar el bucle ya no
// cambia. El const evita reasignar teamIncome por error y le da un nombre
// paralelo a mineIncome y themIncome.
const teamOrders = pedidos.length;
const teamIncome = finalIncome;
let mineAverage;
let themAverage;
let teamAverage;

// Caso sin pedidos: dividir entre 0 daría Infinity o NaN, así que cada
// perspectiva revisa primero si tiene pedidos y, si no, deja el promedio en 0.
// Ese 0 no llega a mostrarse: el texto "Sin pedidos" que ve el usuario lo
// decide pintarTarjeta (bloque 6), que vuelve a revisar los pedidos.
// Posible limpieza para otra sesión: la comprobación está duplicada.
if (mineOrders === 0) {
    mineAverage = 0;
} else {
    mineAverage = mineIncome / mineOrders;
}

if (themOrders === 0) {
    themAverage = 0;
} else {
    themAverage = themIncome / themOrders;
}

if (teamOrders === 0) {
    teamAverage = 0;
} else {
    teamAverage = teamIncome / teamOrders;
}

/* ============================================================
 * 6. PERSPECTIVAS INDEPENDIENTES DE LAS TARJETAS
 * ============================================================
 * Cada clic en una tarjeta .metric-card avanza su perspectiva en el ciclo
 * user -> coworkers -> team -> user ...
 *
 * Por qué son independientes: la perspectiva actual de cada tarjeta se
 * guarda en su propio atributo data-perspectiva (en el HTML, cada tarjeta
 * empieza en "user"). No existe una variable global compartida, así que
 * cambiar una tarjeta no afecta a las otras.
 *
 * Reparto de trabajo: el manejador de clic (al final del archivo) avanza la
 * perspectiva, la etiqueta y los puntos, y marca la tarjeta como pulsada
 * (data-card-pressed, que atenúa la pista en styles.css); pintarTarjeta
 * escribe el valor, el pie y el anillo según esa perspectiva.
 */

// Orden del ciclo. Los textos deben coincidir con los valores de
// data-perspectiva, con las claves de "etiquetas" y con las comparaciones de
// pintarTarjeta.
const perspectivas = ["user", "coworkers", "team"];
// Las 4 tarjetas de la vista Día (clase "metric-card" en index.html).
const metricCards = document.querySelectorAll(".metric-card");
// Texto de la etiqueta de cada perspectiva. Sus claves son las mismas de
// data-perspectiva; el manejador de clic lo escribe en .metric-state.
const etiquetas = {
    user: "· Yo", coworkers: "· Compañeros", team: "· Equipo"
};

// Pinta el contenido de UNA tarjeta según su data-perspectiva actual: elige
// qué valor mostrar (de los ya calculados en el bloque 5) y lo escribe.
// Se llama una vez por tarjeta al cargar y de nuevo en cada clic (ver el final
// del archivo). Usa variables del bloque 5 (mineOrders, themIncome,
// teamAverage...), por eso la llamada inicial tiene que ir después de ese
// bloque: con let y const, usar una variable antes de su línea da error.
function pintarTarjeta(card) {
    // Valores a mostrar, iniciados en 0; cada rama de abajo reemplaza el que
    // le corresponde según la perspectiva de la tarjeta.
    let ordersToShow = 0;
    let incomeToShow = 0;
    let averageToShow = 0;

    // Pedidos e Ingresos tienen pie calculado y anillo; Promedio Día tiene pie
    // calculado sin anillo; Promedio Semana todavía no tiene rama (ver el final).
    if (card.id === "card-order") {
        const theRings = card.querySelector(".ring");
        const ringValue = theRings.querySelector(".ring-value");
        // Porcentaje de los pedidos del equipo que son míos (0 si no hay pedidos,
        // para no dividir entre 0). El anillo lo recibe en stroke-dasharray como
        // "pintado vacío": como el contorno mide 100 (pathLength="100" en el
        // HTML), el pintado es el porcentaje y el vacío es lo que falta hasta 100.
        // toFixed(0) redondea y devuelve TEXTO: 100 - "60" da 40 porque la resta
        // convierte el texto en número, pero "60" + " " + 40 concatena y da "60 40".
        const percentage = teamOrders === 0 ? 0 : (mineOrders / teamOrders) * 100;
        const emptyDasharray = 100 - percentage.toFixed(0);
        ringValue.setAttribute("stroke-dasharray", percentage.toFixed(0) + " " + emptyDasharray);

        const footer = card.querySelector(".metric-change");
        // Texto del pie y su estado (color), que dependen de la perspectiva.
        let text;
        let status;

        if (card.dataset.perspectiva === "user") {
            ordersToShow = mineOrders;
            // Texto provisional: la comparación con ayer está pendiente.
            text = "Sin datos de ayer";
            status = "status-neutral";
        } else if (card.dataset.perspectiva === "coworkers") {
            ordersToShow = themOrders;
            // Diferencia a mi favor (positiva) o en contra (negativa).
            const difference = mineOrders - themOrders;

            if (difference > 0) {
                text = `Tú +${difference}`;
                status = "status-success";
            } else if (difference < 0) {
                text = `Tú −${Math.abs(difference)}`;
                status = "status-danger";
            } else {
                text = "Parejos";
                status = "status-neutral";
            }
        } else if (card.dataset.perspectiva === "team") {
            ordersToShow = teamOrders;

            if (teamOrders === 0) {
                text = "Sin pedidos";
                status = "status-neutral";
            } else if (mineOrders > themOrders) {
                text = `Tú ${percentage.toFixed(0)}%`;
                status = "status-success";
            } else if (mineOrders < themOrders) {
                text = `Tú ${percentage.toFixed(0)}%`;
                status = "status-danger";
            } else {
                text = `Tú ${percentage.toFixed(0)}%`;
                status = "status-neutral";
            }
        }

        // Se quitan los tres estados antes de poner el nuevo; si no, los colores
        // de clics anteriores se acumularían. El anillo usa el mismo estado que
        // el pie para tener su mismo color.
        footer.textContent = text;
        footer.classList.remove("status-success", "status-neutral", "status-danger");
        footer.classList.add(status);

        ringValue.classList.remove("status-success", "status-neutral", "status-danger");
        ringValue.classList.add(status);

        // El anillo solo se muestra en la perspectiva "Equipo" (en styles.css,
        // .ring sin "active" es display: none).
        if (card.dataset.perspectiva === "team") {
            theRings.classList.add("active");
        } else {
            theRings.classList.remove("active");
        }

        deliveriesAmount.textContent = ordersToShow;

    } else if (card.id === "card-income") {
        const theRings = card.querySelector(".ring");
        const footer = card.querySelector(".metric-change");
        const ringValue = theRings.querySelector(".ring-value");

        // Misma lógica que Pedidos, pero con dinero: porcentaje del ingreso del
        // equipo que es mío (0 si el equipo no tiene ingresos, para no dividir
        // entre 0; la condición y la división usan la misma variable, teamIncome).
        // El anillo recibe "pintado vacío" en stroke-dasharray, igual que en Pedidos.
        const percentage = teamIncome === 0 ? 0 : (mineIncome / teamIncome) * 100;
        const emptyDasharray = 100 - percentage.toFixed(0);
        ringValue.setAttribute("stroke-dasharray", percentage.toFixed(0) + " " + emptyDasharray);

        // Texto del pie y su estado (color), que dependen de la perspectiva.
        let text;
        let status;

        // Aquí se da formato al valor: toFixed(2) devuelve TEXTO con 2 decimales
        // y se le pega "$". Por eso el formato va al final, después de calcular.
        if (card.dataset.perspectiva === "user") {
            incomeToShow = mineIncome.toFixed(2) + "$";
            text = "Cliente + local";
            status = "status-neutral";
        } else if (card.dataset.perspectiva === "coworkers") {
            incomeToShow = themIncome.toFixed(2) + "$";
            // Diferencia a mi favor (positiva) o en contra (negativa).
            // toFixed(2) redondea a 2 decimales pero devuelve TEXTO; Number(...) lo vuelve
            // a convertir en número para poder comparar con > y <. Así el signo se decide
            // con el mismo valor que ve el usuario: una diferencia de 0.003 queda en 0 y
            // cae en "Parejos", en vez de mostrar "Tú +0.00$" en verde. También absorbe
            // los errores diminutos de los decimales (0.1 + 0.2 - 0.3 no da 0).
            const difference = Number((mineIncome - themIncome).toFixed(2));
            if (difference > 0) {
                text = `Tú +${difference.toFixed(2)}` + "$";
                status = "status-success";
            } else if (difference < 0) {
                // Primero Math.abs (número) y después toFixed (texto): al revés,
                // Math.abs volvería a convertir el texto y se perderían los decimales.
                text = `Tú −${Math.abs(difference).toFixed(2)}` + "$";
                status = "status-danger";
            } else {
                text = "Parejos";
                status = "status-neutral";
            }
        } else if (card.dataset.perspectiva === "team") {
            incomeToShow = teamIncome.toFixed(2) + "$";

            if (teamIncome === 0) {
                text = "Sin pedidos";
                status = "status-neutral";
            } else if (mineIncome > themIncome) {
                text = `Tú ${percentage.toFixed(0)}%`;
                status = "status-success";
            } else if (mineIncome < themIncome) {
                text = `Tú ${percentage.toFixed(0)}%`;
                status = "status-danger";
            } else {
                text = `Tú ${percentage.toFixed(0)}%`;
                status = "status-neutral";
            }

        }
        // Mismo patrón que Pedidos: se limpian los estados anteriores y se pone
        // el nuevo en el pie y en el anillo.
        footer.textContent = text;
        footer.classList.remove("status-success", "status-neutral", "status-danger");
        footer.classList.add(status);

        ringValue.classList.remove("status-success", "status-neutral", "status-danger");
        ringValue.classList.add(status);

        // El anillo solo se muestra en la perspectiva "Equipo" (en styles.css,
        // .ring sin "active" es display: none).
        if (card.dataset.perspectiva === "team") {
            theRings.classList.add("active");
        } else {
            theRings.classList.remove("active");
        }

        totalIncome.textContent = incomeToShow;

    } else if (card.id === "card-average") {
        // Promedio Día: el valor es el promedio por pedido de la perspectiva actual
        // y el pie compara MI promedio con otro. Sin anillo a propósito: un promedio
        // no es una parte de un total, así que un porcentaje no tendría sentido.
        //   · Yo: "Sin datos de ayer" (provisional, como en Pedidos)
        //   · Compañeros: mi promedio menos el de los compañeros
        //   · Equipo: mi promedio menos el de todo el equipo (yo incluido)
        // Diferencia positiva = mi promedio es mayor (success); negativa = menor (danger).
        const footer = card.querySelector(".metric-change");
        // Texto del pie y su estado (color), que dependen de la perspectiva.
        let text;
        let status;

        if (card.dataset.perspectiva === "user") {
            // Ternario (condición ? A : B): si el grupo no tiene pedidos muestra
            // "Sin pedidos" y, si los tiene, el promedio con 2 decimales y "$".
            averageToShow = mineOrders === 0 ? "Sin pedidos" : mineAverage.toFixed(2) + "$";
            text = "Sin datos de ayer";
            status = "status-neutral";
        } else if (card.dataset.perspectiva === "coworkers") {
            averageToShow = themOrders === 0 ? "Sin pedidos" : themAverage.toFixed(2) + "$";
            // Diferencia a mi favor (positiva) o en contra (negativa), redondeada a 2
            // decimales y vuelta a número (mismo motivo que en Ingresos): el signo se
            // decide con el valor que se muestra.
            const difference = Number((mineAverage - themAverage).toFixed(2));

            // Si yo o mis compañeros no tenemos pedidos, el promedio de ese grupo es
            // un 0 de relleno (bloque 5), no un promedio real: restarlo daría una
            // comparación falsa. Por eso esta revisión va antes que la resta.
            if (mineOrders === 0 || themOrders === 0) {
                text = "Sin comparación";
                status = "status-neutral";
            } else if (difference > 0) {
                text = `Tú +${difference.toFixed(2)}` + "$";
                status = "status-success";
            } else if (difference < 0) {
                // Primero Math.abs (número) y después toFixed (texto): al revés,
                // Math.abs volvería a convertir el texto y se perderían los decimales.
                text = `Tú −${Math.abs(difference).toFixed(2)}` + "$";
                status = "status-danger";
            } else {
                text = "Parejos";
                status = "status-neutral";
            }

        } else if (card.dataset.perspectiva === "team") {
            averageToShow = teamOrders === 0 ? "Sin pedidos" : teamAverage.toFixed(2) + "$";
            // Diferencia entre mi promedio y el del equipo completo, redondeada a 2
            // decimales y vuelta a número para que el signo coincida con lo que se muestra.
            const difference = Number((mineAverage - teamAverage).toFixed(2));
            if (teamOrders === 0) {
                text = "Sin pedidos";
                status = "status-neutral";
            } else if (mineOrders === 0 || themOrders === 0) {
                // Sin pedidos míos, mi promedio es un 0 de relleno. Sin pedidos de
                // los compañeros, el equipo soy solo yo: compararme conmigo mismo
                // no dice nada.
                text = "Sin comparación";
                status = "status-neutral";
            } else if (difference > 0) {
                text = `Tú +${difference.toFixed(2)}` + "$";
                status = "status-success";
            } else if (difference < 0) {
                text = `Tú −${Math.abs(difference).toFixed(2)}` + "$";
                status = "status-danger";
            } else {
                text = "Parejos";
                status = "status-neutral";
            }
        }
        // Se quitan los tres estados antes de poner el nuevo; si no, los colores
        // de clics anteriores se acumularían.
        footer.textContent = text;
        footer.classList.remove("status-success", "status-neutral", "status-danger");
        footer.classList.add(status);
        deliveriesAverage.textContent = averageToShow;
    }

    // "card-average-week" no tiene rama a propósito: pedidos solo guarda un día,
    // así que todavía no hay datos de semana que mostrar. Esta tarjeta recibe el
    // listener de clic como las otras (por tener la clase "metric-card"), por
    // eso al pulsarla sí cambian su perspectiva, su etiqueta y sus puntos,
    // pero su valor ("P/D") no cambia. Pendiente hasta tener datos semanales.
}

// Se recorre cada tarjeta para programar su clic (las 4 reciben el mismo
// código, incluida la de Promedio Semana) y para pintarla una vez al cargar.
metricCards.forEach(function (card) {
    card.addEventListener("click", function () {
        // card.dataset.perspectiva lee el atributo data-perspectiva de la tarjeta.
        // indexOf devuelve su posición en el ciclo (0, 1 o 2; -1 si no existe).
        const posicionActual = perspectivas.indexOf(card.dataset.perspectiva);
        // El operador % (resto) vuelve al inicio después de la última posición:
        // (2 + 1) % 3 = 0.
        const siguientePosicion = (posicionActual + 1) % perspectivas.length;
        const siguientePerspectiva = perspectivas[siguientePosicion];
        // Se guarda la nueva perspectiva en la tarjeta: ese es su "estado".
        card.dataset.perspectiva = siguientePerspectiva;

        // Marca la tarjeta como pulsada. Es un atributo aparte de data-perspectiva
        // porque la perspectiva vuelve a "user" tras tres clics y no sirve para saber
        // si la tarjeta ya se usó. Es texto ("true"): styles.css reacciona a él y
        // atenúa la pista (.card-hint).
        card.dataset.cardPressed = "true";

        const etiqueta = card.querySelector(".metric-state");
        etiqueta.textContent = etiquetas[siguientePerspectiva];

        // Los puntos de ciclo están escritos en el HTML (uno por perspectiva, en
        // el mismo orden que "perspectivas"), por eso dots[siguientePosicion]
        // es el punto de la nueva perspectiva.
        const dots = card.querySelectorAll(".card-dot");
        dots.forEach(function (dot) {
            dot.classList.remove("active");
        });
        dots[siguientePosicion].classList.add("active");

        pintarTarjeta(card);
    });

    // Pintado inicial: sin esto las tarjetas mostrarían el relleno del HTML
    // ("12$", "5.13$"...) hasta el primer clic.
    pintarTarjeta(card);
});