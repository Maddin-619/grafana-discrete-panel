import _ from 'lodash';
import $ from 'jquery';

export default function link(scope, elem, attrs, ctrl) {
  var data;
  var panel = ctrl.panel;
  elem = elem.find('.piechart-panel__chart');
  var $tooltip = $('<div id="tooltip">');

  ctrl.events.on('render', function () {
    if (ctrl.panel.display != "piechart") {
      return
    }
    if (panel.legendType === 'Right side') {
      render(false);
      setTimeout(function () { render(true); }, 50);
    } else {
      render(true);
    }
  });

  function getLegendHeight(panelHeight) {
    if (!ctrl.panel.showLegend) {
      return 20;
    } 
    if (ctrl.panel.alignAsTable) {
      var breakPoint = parseInt(ctrl.panel.breakPoint) / 100;
      var total = 23 + 25 * data.length;
      return Math.min(total, Math.floor(panelHeight * breakPoint));
    }
    return 23
  }

  function formatter(label, slice) {
    var slice_data = slice.data[0][slice.data[0].length - 1];
    var decimal = 2;
    var start = "<div style='font-size:" + ctrl.panel.fontSize + ";text-align:center;padding:2px;color:" + slice.color + ";'>" + label + "<br/>";

    if (ctrl.panel.legend.percentageDecimals) {
      decimal = ctrl.panel.legend.percentageDecimals;
    }
    if (ctrl.panel.legend.values && ctrl.panel.legend.percentage) {
      return start + ctrl.formatValue(slice_data) + "<br/>" + slice.percent.toFixed(decimal) + "%</div>";
    } else if (ctrl.panel.legend.values) {
      return start + ctrl.formatValue(slice_data) + "</div>";
    } else if (ctrl.panel.legend.percentage) {
      return start + slice.percent.toFixed(decimal) + "%</div>";
    } else {
      return start + '</div>';
    }
  }

  function noDataPoints() {
    var html = '<div class="datapoints-warning"><span class="small">No data points</span></div>';
    elem.html(html);
  }

  function addPieChart() {
    var width = elem.width();
    var height = ctrl.height - getLegendHeight(ctrl.height);

    var size = Math.min(width, height);

    var plotCanvas = $('<div></div>');
    var plotCss = {
      margin: 'auto',
      position: 'relative',
      paddingBottom: 20 + 'px',
      height: size + 'px',
    };

    plotCanvas.css(plotCss);

    var backgroundColor = $('body').css('background-color')

    var options = {
      legend: {
        show: false
      },
      series: {
        pie: {
          show: true,
          stroke: {
            color: backgroundColor,
            width: parseFloat(1).toFixed(1)
          },
          label: {
            show: false,
            formatter: formatter
          },
          highlight: {
            opacity: 0.0
          },
          combine: {
            threshold: 0.0,
            label: 'Others'
          }
        }
      },
      grid: {
        hoverable: true,
        clickable: false
      }
    };

    if (panel.pieType === 'donut') {
      options.series.pie.innerRadius = 0.5;
    }

    data = ctrl.pieData;

    elem.html(plotCanvas);

    $.plot(plotCanvas, data, options);
    plotCanvas.bind("plothover", function (event, pos, item) {
      if (!item) {
        $tooltip.detach();
        return;
      }

      var body;
      var percent = parseFloat(item.series.percent).toFixed(2);

      body = '<div class="piechart-tooltip-small"><div class="piechart-tooltip-time">';
      body += '<div class="piechart-tooltip-value">' + _.escape(item.series.label) + ': ';
      body += " (" + percent + "%)" + '</div>';
      body += "</div></div>";

      $tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
    });
  }

  function render(incrementRenderCounter) {
    if (!ctrl.pieData) { return; }

    data = ctrl.pieData;

      if (0 == ctrl.pieData.length) {
        noDataPoints();
      } else {
        addPieChart();
      }

    if (incrementRenderCounter) {
      ctrl.renderingCompleted();
    }
  }
}

