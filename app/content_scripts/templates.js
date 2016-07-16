function substTemplateVariables(template, variables) {
    for (const name in locale)
        template = template.replace(
            new RegExp('\{% locale.' + name + ' %\}', 'g'), locale[name]);
    for (const name in variables)
        template = template.replace(
            new RegExp('\{% ' + name + ' %\}', 'g'), variables[name]);
    return template;
}

var COLOR_GREEN = '#4f4';
var COLOR_RED = '#f99';
var COLOR_BLUE = '#88f';

var TEMPLATE_TOGGLE_LINK = `<br /><a href="#" class="chart_toggle">{% label %}</a>`;

var TEMPLATE_USER_BEGIN = `<tr id="{% row_id %}">
<td><div class="chart_user_color" style="background: {% color %};"></div></td>
<td class="chart_user_judge_id">{% judge_id %}</td>
<td>{% name %}</td>`;
var TEMPLATE_USER_SEVERAL_LINES = `<td class="chart_user_problems_count">{% problems_count %}</td>
<td><a href="#" class="chart_user_remove">{% locale.del %}</a></td>`;
var TEMPLATE_USER_END = `</tr>`;

var TEMPLATE_CHART = `<div id="chart_place">
<div id="chart_loading" class="chart_box">
    <div class="chart_comment chart_version">
        Timus Charts, {% locale.version %} ${SCRIPT_VERSION}
    </div>
    <div class="chart_spin"></div>
    <div id="chart_error" class="chart_comment" style="display: none;"></div>
</div>
<div id="chart" class="chart_box" style="display: none;"></div>
<div class="chart_legend_box">
    <a href="#" class="chart_legend_open" style="display: none;">
        {% locale.addUsers %}
    </a>
    <div class="chart_legend" style="display: none;">
        <table class="chart_users_table"></table>
        <div class="chart_new_user">
            <div id="chart_new_user_color" class="chart_user_color" style="background: ${COLOR_BLUE};"></div>
            {% locale.judgeIDLabel %} <input type="text" class="chart_judge_id_input" />
            <a href="#" class="chart_user_add">{% locale.add %}</a>
            <div id="chart_loading_error_judge_id" class="chart_comment" style="display: none;"></div>
        </div>
    </div>
</div>
</div>`;
