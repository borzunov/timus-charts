var chart = new Chart();
if (chart.areEnoughDataPresent()) {
    var expectedVisibility = chart.getDefaultVisibility();
    chart.createToggleLink(expectedVisibility);
    if (expectedVisibility)
        $(() => chart.show());
}
