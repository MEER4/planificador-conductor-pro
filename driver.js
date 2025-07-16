// --- FORM EVENT LISTENER ---
document.getElementById('financial-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const inputs = {
        netGoal: parseFloat(document.getElementById('net-goal').value),
        workHours: parseFloat(document.getElementById('work-hours').value),
        vehicleEfficiency: parseFloat(document.getElementById('vehicle-efficiency').value),
        fuelPrice: parseFloat(document.getElementById('fuel-price').value),
        pricePerKm: parseFloat(document.getElementById('price-per-km').value),
        maintenanceRate: parseFloat(document.getElementById('maintenance-rate').value),
        otherCosts: parseFloat(document.getElementById('other-costs').value),
    };

    if (Object.values(inputs).some(isNaN)) {
        alert('Por favor, complete todos los campos con valores numéricos válidos.');
        return;
    }

    const planData = generatePlan(inputs);
    
    if (planData) {
        renderSummarySection(planData, inputs);
        renderHotZonesTable(); // Nueva función para la tabla de zonas
        renderOperationalToolSection(planData, inputs);
        renderTipsSection(); // Mantenemos los consejos educativos

        document.getElementById('plan-container').style.display = 'block';
        document.getElementById('plan-container').scrollIntoView({ behavior: 'smooth' });
    }
});

// --- LÓGICA DE CÁLCULO (ACTUALIZADA) ---
function generatePlan(inputs) {
    const { netGoal, workHours, vehicleEfficiency, fuelPrice, maintenanceRate, otherCosts } = inputs;
    
    const estimatedKm = workHours * 20; // Asumiendo 20 km/h en ciudad
    const fuelCost = (estimatedKm / vehicleEfficiency) * fuelPrice;
    
    // Nueva fórmula para el Ingreso Bruto, sin comisión, como solicitaste.
    // Resuelve: GrossIncome = NetGoal + FuelCost + OtherCosts + (GrossIncome * MaintenanceRate)
    const maintenanceDecimal = maintenanceRate / 100;
    if (maintenanceDecimal >= 1) {
        alert("Error: El porcentaje de mantenimiento no puede ser 100% o más.");
        return null;
    }
    const grossIncome = (netGoal + fuelCost + otherCosts) / (1 - maintenanceDecimal);

    const maintenanceCost = grossIncome * maintenanceDecimal;
    const totalCosts = fuelCost + otherCosts + maintenanceCost;

    return {
        grossIncome,
        netGoal,
        fuelCost,
        maintenanceCost,
        otherCosts,
        totalCosts
    };
}

// --- FUNCIONES DE RENDERIZADO ---

/**
 * Renderiza el resumen financiero (Diseño Original).
 */
function renderSummarySection(data, inputs) {
    const container = document.getElementById('summary-section');
    const format = (num) => `RD$ ${num.toFixed(2)}`;

    container.innerHTML = `
        <h2>Parte 1: Resumen Financiero Diario</h2>
        <p>Este es el desglose de ingresos y costos para alcanzar tu meta neta diaria.</p>
        <table>
            <tbody>
                <tr><td>Meta de Ganancia Neta (Bolsillo)</td><td>${format(data.netGoal)}</td></tr>
                <tr><td>(+) Costo Estimado de Combustible</td><td>${format(data.fuelCost)}</td></tr>
                <tr><td>(+) Ahorro para Mantenimiento (${inputs.maintenanceRate}%)</td><td>${format(data.maintenanceCost)}</td></tr>
                <tr><td>(+) Otros Gastos Fijos</td><td>${format(data.otherCosts)}</td></tr>
                <tr class="total-row"><td>(=) Ingreso Bruto Requerido (En App)</td><td>${format(data.grossIncome)}</td></tr>
            </tbody>
        </table>
    `;
}

/**
 * NUEVA: Renderiza la tabla de zonas de alta demanda.
 */
function renderHotZonesTable() {
    const container = document.getElementById('hot-zones-section');
    const zones = [
        { name: 'Piantini / Naco', hours: 'Día (Oficinas) y Noche (Restaurantes)' },
        { name: 'Zona Colonial', hours: 'Tardes, Noches y Fines de Semana (Turismo)' },
        { name: 'Ágora Mall / Galerías 360', hours: 'Todo el día, especialmente fines de semana' },
        { name: 'Megacentro / Sambil', hours: 'Todo el día, especialmente fines de semana' },
        { name: 'Aeropuerto Las Américas (AILA)', hours: 'Depende de los vuelos (24h)' },
        { name: 'UASD y zona universitaria', hours: 'Días de semana (Horarios de clase)' },
        { name: 'Mirador Sur / Bella Vista', hours: 'Noches y fines de semana (Residencial)' },
        { name: 'Ensanche Ozama', hours: 'Noches y fines de semana (Comercial/Residencial)' }
    ];

    let rows = zones.map(zone => `<tr><td>${zone.name}</td><td>${zone.hours}</td></tr>`).join('');

    container.innerHTML = `
        <h2>Parte 2: Zonas Estratégicas en Santo Domingo</h2>
        <p>Posiciónate en estas áreas durante los horarios indicados para aumentar tus probabilidades de conseguir viajes de alta demanda.</p>
        <table>
            <thead>
                <tr>
                    <th>Zona de Alta Demanda</th>
                    <th>Mejores Horarios</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

/**
 * Renderiza la Herramienta de Decisión (Mejorada).
 */
function renderOperationalToolSection(data, inputs) {
    const container = document.getElementById('operational-tool-section');
    const { grossIncome } = data;
    const { workHours, pricePerKm } = inputs;
    
    const totalMinutes = workHours * 60;
    const ratePerMinute = grossIncome / totalMinutes; // Tu "salario" bruto por minuto

    let tableRows = '';
    for (let tripEarning = 80; tripEarning <= 500; tripEarning += 30) {
        const maxTime = tripEarning / ratePerMinute;
        const maxDistance = tripEarning / pricePerKm;
        tableRows += `
            <tr>
                <td>RD$ ${tripEarning.toFixed(2)}</td>
                <td><strong>${Math.floor(maxTime)} min</strong></td>
                <td><strong>${maxDistance.toFixed(1)} Km</strong></td>
            </tr>
        `;
    }

    container.innerHTML = `
        <h2>Parte 3: Herramienta de Decisión Rápida</h2>
        <p>Usa esta tabla para decidir en segundos si un viaje vale la pena según TUS métricas.</p>
        <p>Tu Métrica Clave de Rentabilidad: <span class="highlight">RD$ ${ratePerMinute.toFixed(2)} por minuto</span> (Bruto)</p>
        <table>
            <thead>
                <tr>
                    <th>Si el viaje paga...</th>
                    <th>Tiempo MÁXIMO para completarlo</th>
                    <th>Distancia MÁXIMA que debería tener</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
        <div class="explanation">
            <strong>¿Cómo usar esta tabla?</strong> Cuando recibes una solicitud, compárala. Si un viaje paga RD$ 200, tienes un tiempo máximo para hacerlo rentable y no debería superar la distancia máxima indicada para cumplir tu objetivo de precio por kilómetro.
        </div>
    `;
}

/**
 * Renderiza los consejos (Diseño Original).
 */
function renderTipsSection() {
    const container = document.getElementById('tips-section');
    container.innerHTML = `
        <h2>Parte 4: Consejos Estratégicos</h2>
        <ul>
            <li><strong>Eres un Proveedor de Servicios:</strong> Las apps son tus clientes, no tus jefes. Tú decides si su oferta (el viaje) es rentable para tu negocio.</li>
            <li><strong>El Tiempo es tu Activo Principal:</strong> No lo malgastes en viajes poco rentables o en esperas innecesarias. Tu métrica por minuto es tu guía.</li>
            <li><strong>Reevaluación Constante:</strong> Los precios del combustible y tus costos cambian. Vuelve a ejecutar este planificador para ajustar tus estrategias.</li>
        </ul>
    `;
}
