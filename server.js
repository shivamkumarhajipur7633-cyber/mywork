const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

const salesData = {
  "2026-06-27": {
    report_date: "2026-06-27",
    total_units_sold: 950,
    total_revenue: 612000,
    top_country: "Thailand",
    activation_success_rate: 88.5,
    units_trend: "-5% vs previous day",
    revenue_trend: "Revenue slightly down",
    activation_status: "Needs attention",
    trend_type: "negative",
    insight: "Thailand had the highest SIM demand on this date, but activation success needs attention."
  },

  "2026-06-28": {
    report_date: "2026-06-28",
    total_units_sold: 1120,
    total_revenue: 735000,
    top_country: "Singapore",
    activation_success_rate: 90.8,
    units_trend: "+8% vs previous day",
    revenue_trend: "Revenue improved",
    activation_status: "Stable operations",
    trend_type: "positive",
    insight: "Singapore sales improved with better activation performance and stronger revenue."
  },

  "2026-06-29": {
    report_date: "2026-06-29",
    total_units_sold: 1280,
    total_revenue: 845000,
    top_country: "UAE",
    activation_success_rate: 92.4,
    units_trend: "+12% vs previous day",
    revenue_trend: "Strong revenue day",
    activation_status: "Healthy operations",
    trend_type: "positive",
    insight: "UAE is leading sales for the selected report date. Activation performance is healthy."
  },

  "2026-06-30": {
    report_date: "2026-06-30",
    total_units_sold: 1400,
    total_revenue: 910000,
    top_country: "Saudi Arabia",
    activation_success_rate: 93.1,
    units_trend: "+9% vs previous day",
    revenue_trend: "Highest revenue in period",
    activation_status: "Very healthy operations",
    trend_type: "positive",
    insight: "Saudi Arabia showed strong growth with the highest revenue and healthy activation performance."
  }
};

app.get("/", function (req, res) {
  res.json({
    message: "International SIM Sales Backend is running"
  });
});

app.get("/api/sales", function (req, res) {
  const reportDate = req.query.report_date;

  if (!reportDate) {
    return res.status(400).json({
      error: "report_date query parameter is required"
    });
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(reportDate)) {
    return res.status(400).json({
      error: "Invalid date format. Use YYYY-MM-DD."
    });
  }

  const data = salesData[reportDate];

  if (!data) {
    return res.status(404).json({
      error: "No sales data found for this report date"
    });
  }

  res.json(data);
});

app.listen(PORT, function () {
  console.log("Server running on http://localhost:" + PORT);
});
