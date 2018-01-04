// var echarts = require('echarts');

function toArray(string) {
    return string.split(",");
}

function loadData(chart) {
    $.ajax({
        url: 'http://localhost:3000/data/BCH',
        type: 'GET',
        error: function(err){
            console.log('error: ', err);
        },
        success: function(data, status){
            showChart(chart, data)
        }
    });
}

function showChart(chart, data) {
    var result = getData(data)
    var option = {
        title: {
            text: '价差分析'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: result.legend
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: result.xAxis
        },
        yAxis: {
            type: 'value'
        },
        dataZoom: [
            {   // 这个dataZoom组件，默认控制x轴。
                type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
                start: 10,      // 左边在 10% 的位置。
                end: 60         // 右边在 60% 的位置。
            }
        ],
        series: result.dataSet
    }
    chart.setOption(option);
}

function getData(data) {
    var dataSet = [], legend = [], xAxis = data[0].time
    for(var i=0; i<data.length; i++) {

        legend.push(data[i].name + " pos")
        legend.push(data[i].name + " neg")

        dataSet.push(
            {
                name: data[i].name + " pos",
                type: 'line',
                data: data[i].pos
            }
        )

        dataSet.push(
            {
                name: data[i].name + " neg" ,
                type: 'line',
                data: data[i].neg
            }
        )
    }
    return {
        dataSet, legend, xAxis
    }
}

$(function() {
    var myChart = echarts.init(document.getElementById('main'))
    loadData(myChart)
});