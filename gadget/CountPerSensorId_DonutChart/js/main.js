var datasource,type, columns,filter,maxUpdateValue;

var REFRESH_INTERVAL = 1000;

//this needs to be loaded from an autogenerated
datasource = gadgetConfig.datasource;
filter = gadgetConfig.filter;
type = gadgetConfig.type;
var counter = 0;
var initialConfig;
maxUpdateValue = gadgetConfig.maxUpdateValue;

columns = gadgetConfig.columns;

//if gadget type is realtime, treat it different!
if(type === "realtime") {
    //subscribe to websocket
    subscribe(datasource.split(":")[0], datasource.split(":")[1], '10', gadgetConfig.domain,
        onRealTimeEventSuccessRecieval, onRealTimeEventErrorRecieval, location.hostname, location.port,
        'WEBSOCKET', "SECURED");
} else {
    //first, fetch datasource schema
    //getColumns(datasource);

    //load data immediately
    fetchData(drawBatchChart);

    // then start periodic polling
    setInterval(function() {
        fetchData(drawBatchChart);
    },REFRESH_INTERVAL);
}

function getColumns(table) {
    console.log("Fetching table schema for table: " + table);
    var url = "/portal/apis/analytics?type=10&tableName=" + table;
    $.getJSON(url, function(data) {
        if (data) {
            columns = parseColumns(JSON.parse(data.message));
        }

    });
};

function parseColumns(data) {
    if (data.columns) {
        var keys = Object.getOwnPropertyNames(data.columns);
        var columns = keys.map(function(key, i) {
            return column = {
                name: key,
                type: data.columns[key].type
            };
        });
        return columns;
    }
};

function fetchData(callback) {
    var timeFrom = "undefined";
    var timeTo = "undefined";
    var count = "undefined";
    var request = {
        type: 8,
        tableName: datasource,
        filter:filter,
        timeFrom: timeFrom,
        timeTo: timeTo,
        start: 0,
        count: count
    };
    $.ajax({
        url: "/portal/apis/analytics",
        method: "GET",
        data: request,
        contentType: "application/json",
        success: function(data) {
            if (callback != null) {
                callback(makeRows(JSON.parse(data.message)));
            }
        }
    });
};

function makeDataTable(data) {
    var dataTable = new igviz.DataTable();
    if (columns.length > 0) {
        columns.forEach(function(column, i) {
            var type = "N";
            if (column.type == "STRING" || column.type == "string") {
                type = "C";
            } else if (column.type == "TIME" || column.type == "time") {
                type = "T";
            }
            dataTable.addColumn(column.name, type);
        });
    }
    data.forEach(function(row, index) {
        for (var i = 0; i < row.length; i++) {
            if (dataTable.metadata.types[i] == "N") {
                data[index][i] = parseInt(data[index][i]);
            }
        }
    });
    dataTable.addRows(data);
    return dataTable;
};

function makeRows(data) {
    var rows = [];
    for (var i = 0; i < data.length; i++) {
        var record = data[i];
        var keys = Object.getOwnPropertyNames(record.values);
        var row = columns.map(function(column, i) {
            return record.values[column.name];
        });
        rows.push(row);
    };
    return rows;
};

function drawChart(data) {
    var dataTable = makeDataTable(data);
    gadgetConfig.chartConfig.width = $("#placeholder").width();
    gadgetConfig.chartConfig.height = $("#placeholder").height() - 65;
    var chartType = gadgetConfig.chartConfig.chartType;
    var xAxis = gadgetConfig.chartConfig.xAxis;
    jQuery("#noChart").html("");
    if (chartType === "bar" && dataTable.metadata.types[xAxis] === "N") {
        dataTable.metadata.types[xAxis] = "C";
    }

    if(gadgetConfig.chartConfig.chartType==="table" || gadgetConfig.chartConfig.chartType==="singleNumber") {
        gadgetConfig.chartConfig.height = $("#placeholder").height();
        var chart = igviz.draw("#placeholder", gadgetConfig.chartConfig, dataTable);
        chart.plot(dataTable.data);

    } else {
        var chart = igviz.setUp("#placeholder", gadgetConfig.chartConfig, dataTable);
        chart.setXAxis({
            "labelAngle": -35,
            "labelAlign": "right",
            "labelDy": 0,
            "labelDx": 0,
            "titleDy": 25
        })
            .setYAxis({
                "titleDy": -30
            })
        chart.plot(dataTable.data);
    }
};


//stuff required for realtime charting
function onRealTimeEventSuccessRecieval(streamId, data) {
    drawRealtimeChart(data);
};

function onRealTimeEventErrorRecieval(dataError) {
    console.log("Error occurred " + dataError);
};

var dataTable;
var chart;

function drawRealtimeChart(data) {

    if (chart == null) {

        jQuery("#noChart").html("");
        gadgetConfig.chartConfig.width = $("#placeholder").width() - 110;
        gadgetConfig.chartConfig.height = $("#placeholder").height() - 40;

        if(gadgetConfig.chartConfig.charts[0].type == "map"){
            var mapType = gadgetConfig.chartConfig.charts[0].mapType;

            if(mapType == "world"){
                gadgetConfig.chartConfig.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/countryInfo/';
                gadgetConfig.chartConfig.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/world/';
            }else if(mapType == "usa"){
                gadgetConfig.chartConfig.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/usaInfo/';
                gadgetConfig.chartConfig.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/usa/';
            }else if(mapType == "europe"){
                gadgetConfig.chartConfig.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/countryInfo/';
                gadgetConfig.chartConfig.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/europe/';
            }
        }

        chart = new vizg(createDatatable(convertData(data)), gadgetConfig.chartConfig);
        chart.draw("#placeholder");
    } else {
        chart.insert(convertData(data));
    }

};

function drawBatchChart(data){

    if(chart == null){

        jQuery("#noChart").html("");
        gadgetConfig.chartConfig.width = $("#placeholder").width() - 110;
        gadgetConfig.chartConfig.height = $("#placeholder").height() - 40;

        if(gadgetConfig.chartConfig.charts[0].type == "map"){
            var mapType = gadgetConfig.chartConfig.charts[0].mapType;

            if(mapType == "world"){
                gadgetConfig.chartConfig.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/countryInfo/';
                gadgetConfig.chartConfig.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/world/';
            }else if(mapType == "usa"){
                gadgetConfig.chartConfig.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/usaInfo/';
                gadgetConfig.chartConfig.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/usa/';
            }else if(mapType == "europe"){
                gadgetConfig.chartConfig.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/countryInfo/';
                gadgetConfig.chartConfig.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/europe/';
            }
        }

        initialConfig = JSON.parse(JSON.stringify(gadgetConfig.chartConfig));

    }else{
        gadgetConfig.chartConfig = initialConfig;
        initialConfig = JSON.parse(JSON.stringify(gadgetConfig.chartConfig));
    }

    chart = new vizg(createDatatable(convertData(data)), gadgetConfig.chartConfig);
    chart.draw("#placeholder");
}

function convertData(data) {
    for (var i = 0; i < data.length; i++) {
        for (var x = 0; x < data[i].length; x++) {
            var type = gadgetConfig.columns[x]["type"].toUpperCase();
            if(type != "STRING" && type != "BOOLEAN" ){
                data[i][x] = parseFloat(data[i][x]);
            }
        }
    }

    return data;
}

function createDatatable(data) {
    var names = [];
    var types = [];

    for(var i =0; i < gadgetConfig.columns.length; i++) {
        var type;
        names.push(gadgetConfig.columns[i]["name"]);

        var type = columns[i]["type"].toUpperCase();

        if(type === "INT" || type === "INTEGER" || type === "FLOAT" ||
            type === "DOUBLE" || type === "LONG") {
            type = "linear";
        } else if (gadgetConfig.columns[i]["type"].toUpperCase() == "TIME") {
            type = "time";
        } else {
            type = "ordinal";
        }

        types.push(type);
    }

    var datatable =  [
        {
            "metadata" : {
                "names" : names,
                "types" : types
            },
            "data": data
        }
    ];

    return datatable;
}