// --- FORM EVENT LISTENER ---
document.getElementById('financial-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que la página se recargue

    // Recolectar valores del formulario
    const inputs = {
        netGoal: parseFloat(document.getElementById('net-goal').value),
        workHours: parseFloat(document.getElementById('work-hours').value),
        vehicleEfficiency: parseFloat(document.getElementById('vehicle-efficiency').value),
        fuelPrice: parseFloat(document.getElementById('fuel-price').value),
        commissionRate: parseFloat(document.getElementById('commission-rate').value),
        maintenanceRate: parseFloat(document.getElementById('maintenance-rate').value),
        otherCosts: parseFloat(document.getElementById('other-costs').value),
    };

    // Validar que todos los campos estén llenos
    if (Object.values(inputs).some(isNaN)) {
        alert('Por favor, complete todos los campos con valores numéricos válidos.');
        return;
    }

    // Orquestar la generación del plan
    const planData = generatePlan(inputs);
    
    // Si los cálculos fueron exitosos, renderizar las secciones
    if (planData) {
        renderSummarySection(planData);
        renderSinglePlatformSection(planData, inputs);
        renderOperationalToolSection(planData, inputs);
        renderTipsSection();

        // Mostrar el contenedor de resultados
        document.getElementById('plan-container').style.display = 'block';
        
        // Scroll suave hacia los resultados
        document.getElementById('plan-container').scrollIntoView({ behavior: 'smooth' });
    }
});

// --- CALCULATION LOGIC ---
function generatePlan(inputs) {
    const { netGoal, workHours, vehicleEfficiency, fuelPrice, commissionRate, maintenanceRate, otherCosts } = inputs;
    
    // 1. Estimar costo de combustible
    const estimatedKm = workHours * 20; // Asumiendo 20 km/h en promedio en la ciudad
    const fuelCost = (estimatedKm / vehicleEfficiency) * fuelPrice;
    
    // 2. Calcular el ingreso bruto requerido
    const totalDeductionRate = (commissionRate / 100) + (maintenanceRate / 100);
    if (totalDeductionRate >= 1) {
         alert("Error: La suma de la comisión y el mantenimiento no puede ser 100% o más.");
         return null; // Detiene el cálculo
    }
    const grossIncome = (netGoal + fuelCost + otherCosts) / (1 - totalDeductionRate);

    // 3. Desglosar costos basados en el bruto
    const commissionCost = grossIncome * (commissionRate / 100);
    const maintenanceCost = grossIncome * (maintenanceRate / 100);
    const totalCosts = fuelCost + otherCosts + commissionCost + maintenanceCost;

    return {
        grossIncome,
        netGoal,
        fuelCost,
        commissionCost,
        maintenanceCost,
        otherCosts,
        totalCosts
    };
}

// --- RENDER FUNCTIONS ---

/**
 * Función 1: Renderiza el resumen financiero.
 */
function renderSummarySection(data) {
    const container = document.getElementById('summary-section');
    const format = (num) => `RD$ ${num.toFixed(2)}`;

    container.innerHTML = `
        <h2>Parte 1: Resumen Financiero Diario</h2>
        <p>Este es el desglose de ingresos y costos para alcanzar tu meta neta diaria.</p>
        <table>
            <tbody>
                <tr><td>Meta de Ganancia Neta (Bolsillo)</td><td>${format(data.netGoal)}</td></tr>
                <tr><td>(+) Costo Estimado de Combustible</td><td>${format(data.fuelCost)}</td></tr>
                <tr><td>(+) Comisión de Plataformas (${document.getElementById('commission-rate').value}%)</td><td>${format(data.commissionCost)}</td></tr>
                <tr><td>(+) Ahorro para Mantenimiento (${document.getElementById('maintenance-rate').value}%)</td><td>${format(data.maintenanceCost)}</td></tr>
                <tr><td>(+) Otros Gastos Fijos</td><td>${format(data.otherCosts)}</td></tr>
                <tr class="total-row"><td>(=) Ingreso Bruto Requerido (En App)</td><td>${format(data.grossIncome)}</td></tr>
            </tbody>
        </table>
    `;
}

/**
 * Función 2: Compara plataformas y da un veredicto.
 */
function renderSinglePlatformSection(baseData, inputs) {
    const container = document.getElementById('single-platform-section');
    const { netGoal, fuelCost, otherCosts } = baseData;
    
    // Fórmula para calcular el bruto con comisión variable
    const calculateGross = (commission) => (netGoal + fuelCost + otherCosts) / (1 - (commission / 100) - (inputs.maintenanceRate / 100));

    const grossRequiredDidi = calculateGross(13);
    const grossRequiredUber = calculateGross(30);
    const difference = grossRequiredUber - grossRequiredDidi;

    container.innerHTML = `
        <h2>Parte 2: Análisis por Plataforma (Teórico)</h2>
        <p>Si trabajaras exclusivamente en una plataforma, esto es lo que necesitarías generar en bruto:</p>
        <ul>
            <li>Solo con <strong>DiDi (13% comisión)</strong>: Necesitarías generar <span class="highlight">RD$ ${grossRequiredDidi.toFixed(2)}</span></li>
            <li>Solo con <strong>Uber (30% comisión)</strong>: Necesitarías generar <span class="highlight">RD$ ${grossRequiredUber.toFixed(2)}</span></li>
        </ul>
        <hr>
        <h2>Parte 3: Veredicto Estratégico</h2>
        <div class="verdict">
            <p>La diferencia de comisión entre plataformas te obliga a generar <strong>RD$ ${difference.toFixed(2)} adicionales</strong> en Uber para obtener la misma ganancia neta que en DiDi.</p>
            <p><strong>Conclusión:</strong> Prioriza las solicitudes de DiDi. Usa Uber estratégicamente solo para viajes de alta rentabilidad (tarifas dinámicas, viajes largos bien pagados) que superen tu métrica clave por minuto.</p>
        </div>
    `;
}

/**
 * Función 3: Crea la herramienta operacional y la tabla de decisión.
 */
function renderOperationalToolSection(data, inputs) {
    const container = document.getElementById('operational-tool-section');
    
    // 1. Cálculo del Total Ideal a Generar en Apps
    const inAppTarget = data.grossIncome;

    // 2. Cálculo de la Métrica Clave: Tarifa por Minuto
    const totalMinutes = inputs.workHours * 60;
    const ratePerMinute = inAppTarget / totalMinutes;

    // 3. Generación de la Tabla de Decisión
    let tableRows = '';
    for (let tripEarning = 80; tripEarning <= 500; tripEarning += 30) {
        const maxTime = tripEarning / ratePerMinute;
        const tripsNeeded = inAppTarget / tripEarning;
        tableRows += `
            <tr>
                <td>RD$ ${tripEarning.toFixed(2)}</td>
                <td><strong>${Math.floor(maxTime)} min ${Math.round((maxTime % 1) * 60)} seg</strong></td>
                <td>${Math.ceil(tripsNeeded)} viajes</td>
            </tr>
        `;
    }

    container.innerHTML = `
        <h2>Parte 4: Herramienta de Decisión Operacional</h2>
        
        <h3>4.1. Objetivo Real en App y Métrica Clave</h3>
        <p>Tu objetivo de facturación en la app no es tu meta neta. Debes cubrir todos tus costos operativos.</p>
        <p>Total a Generar en Apps: <span class="highlight">RD$ ${inAppTarget.toFixed(2)}</span></p>
        <p>Tu Métrica Clave de Rentabilidad: <span class="highlight">RD$ ${ratePerMinute.toFixed(2)} por minuto</span></p>
        <div class="explanation">
            Esta métrica es tu "salario" por minuto. Cualquier viaje que te ofrezcan debe tener una ganancia por minuto igual o superior a esta cifra para ser rentable. <strong>(Cálculo: Ganancia del viaje / Tiempo total del viaje)</strong>.
        </div>
        
        <h3>4.2. Tabla de Decisión Rápida</h3>
        <p>Usa esta tabla para decidir en segundos si un viaje vale la pena.</p>
        <table>
            <thead>
                <tr>
                    <th>Si el viaje paga...</th>
                    <th>Tiempo MÁXIMO para completarlo</th>
                    <th>Viajes de este tipo para la meta</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
        <div class="explanation">
            <strong>¿Cómo usar esta tabla?</strong> Cuando recibes una solicitud, mira cuánto paga. Busca ese valor en la primera columna. La segunda columna te dice el tiempo máximo (desde que aceptas hasta que dejas al pasajero) que puedes tardar para que el viaje sea rentable. Si crees que te tomará más tiempo, recházalo.
        </div>
    `;
}

/**
 * Función 4: Inserta los consejos estratégicos estáticos.
 */
function renderTipsSection() {
    const container = document.getElementById('tips-section');
    container.innerHTML = `
        <h2>Parte 5: Consejos Estratégicos Adicionales</h2>
        
        <h3>5.1. Mentalidad de Negocio</h3>
        <ul>
            <li><strong>Eres un Proveedor de Servicios:</strong> Las apps no son tus empleadores, son tus clientes. Te "contratan" para cada viaje. Tú decides si aceptas su oferta (el viaje).</li>
            <li><strong>El Tiempo es tu Activo Principal:</strong> No lo malgastes en viajes poco rentables o en esperas innecesarias. Siempre evalúa el tiempo total vs. la ganancia.</li>
            <li><strong>Conoce tu Zona:</strong> Identifica las horas y lugares de alta demanda (universidades, centros comerciales, zonas de oficinas, terminales). Posiciónate allí antes de las horas pico.</li>
        </ul>

        <h3>5.2. Tácticas Avanzadas</h3>
        <ul>
            <li><strong>El "Último Viaje":</strong> Acepta un viaje hacia tu casa al final del día. Es ganancia neta sobre un trayecto que ibas a hacer de todos modos.</li>
            <li><strong>Gestión de la Tasa de Aceptación:</strong> No temas rechazar viajes malos. Una tasa de aceptación más baja pero con viajes más rentables se traduce en más dinero por menos trabajo y menos gastos.</li>
            <li><strong>Reevaluación Constante:</strong> Los precios de combustible y la demanda cambian. Vuelve a ejecutar este planificador semanalmente para ajustar tus metas y estrategias.</li>
        </ul>
    `;
}