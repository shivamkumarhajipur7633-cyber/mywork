// ======================================
// SUPABASE CONFIGURATION
// ======================================

// Base URL (MUST NOT include /rest/v1/rpc/... endpoint path)
const SUPABASE_BASE_URL = "https://twxhazydrseugxitourx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_CYLEsgQwaHRbnThvja3w5Q_jAseTCrm";

// Create Supabase Client using the Base URL
const sb = window.supabase.createClient(
    SUPABASE_BASE_URL,
    SUPABASE_ANON_KEY
);

// Global Chart references for re-rendering on date filter update
let dailyChart = null;
let monthlyChart = null;

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return "₹0";
    return "₹" + Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboard() {
    const dateInput = document.getElementById("currentdate");
    const reportDate = dateInput.value || "2026-05-15";

    let payload = null;

    try {
        const { data, error } = await sb.rpc("dashboard_report", {
            report_date: reportDate
        });

        if (error) {
            console.error("RPC Error :", error);
        } else if (data) {
            payload = data;
        }

    } catch (err) {
        console.error("Supabase Error :", err);
    }

    if (!payload) {
        console.error("Dashboard Data Not Found");
        return;
    }

    // Support direct object or array/nested wrapped payload structures
    const dashboard = payload.dashboard_data 
        ? payload.dashboard_data 
        : (Array.isArray(payload) ? payload[0] : payload);

    // 1. KPI DATA (Handle case sensitivity in property names)
    const kpi = dashboard.kpi_metric_card || dashboard.KPI_METRIC_CARD || {};

    document.getElementById("today_orders").textContent =
        kpi.today_sales ?? kpi.TODAY_SALES ?? 0;

    document.getElementById("today_revenue").textContent =
        formatCurrency(kpi.today_revenue ?? kpi.TODAY_REVENUE ?? 0);

    document.getElementById("monthly_orders").textContent =
        kpi.mtd_sales ?? kpi.MTD_SALES ?? 0;

    document.getElementById("monthly_revenue").textContent =
        formatCurrency(kpi.mtd_revenue ?? kpi.MTD_REVENUE ?? 0);

    document.getElementById("previous_month_same_day_orders").textContent =
        kpi.previous_same_day_sales ?? kpi["previous same day"] ?? 0;

    document.getElementById("previous_month_same_day_revenue").textContent =
        formatCurrency(kpi.previous_same_day_revenue ?? kpi["previous same day_REVENUE"] ?? 0);

    document.getElementById("previous_month_orders").textContent =
        kpi.previous_mtd_sales ?? kpi.previous_MTD_SALES ?? 0;

    document.getElementById("previous_month_revenue").textContent =
        formatCurrency(kpi.previous_mtd_revenue ?? kpi.previous_MTD_REVENUE ?? 0);

    // 2. EMPLOYEE LEADERBOARD TABLE
    const empBody = document.getElementById("emp_data");
    empBody.innerHTML = "";

    const empTable = dashboard.employee_table || [];
    if (empTable && empTable.length > 0) {
        empTable.forEach((emp, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${emp.staff_name || emp.employee_name || 'N/A'}</td>
                <td>${emp.today_sales ?? 0}</td>
                <td>${formatCurrency(emp.today_revenue ?? 0)}</td>
                <td>${emp.monthly_sales ?? 0}</td>
                <td>${formatCurrency(emp.monthly_revenue ?? 0)}</td>
            `;
            empBody.appendChild(tr);
        });
    } else {
        empBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No employee data available for selected date</td></tr>`;
    }

    // 3. DAILY SUMMARY GRAPH
    const dailyData = dashboard.daily_summary || [];
    renderDailyGraph(dailyData);

    // 4. MONTHLY SUMMARY GRAPH
    const monthlyData = dashboard.monthly_summary || [];
    renderMonthlyGraph(monthlyData);
}

function renderDailyGraph(dailyData) {
    const canvas = document.getElementById("daily_summary_graph");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (dailyChart) {
        dailyChart.destroy();
    }

    const labels = dailyData.map(item => item.DATE);
    const orders = dailyData.map(item => item.no_of_order);

    dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Orders',
                data: orders,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderMonthlyGraph(monthlyData) {
    const canvas = document.getElementById("monthly_summary_graph");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (monthlyChart) {
        monthlyChart.destroy();
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels = monthlyData.map(item => monthNames[item.month_ - 1] || `Month ${item.month_}`);
    const orders = monthlyData.map(item => item.no_of_order);

    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Orders',
                data: orders,
                backgroundColor: '#06b6d4',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Default Date Init
window.onload = () => {
    const dateInput = document.getElementById("currentdate");
    if (dateInput) {
        // Default to a date with known active test data (e.g. 2026-05-15)
        dateInput.value = "2026-05-15";
    }
    loadDashboard();
};