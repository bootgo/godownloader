function UpdateTable() {
    $("#jqGrid").jqGrid({
        url: 'http://' + location.hostname + ':9981/progress.json',
        mtype: "GET",
        ajaxSubgridOptions: {
            async: false
        },
        datatype: "json",
        //datatype : "local",
        styleUI: 'Bootstrap',
        colModel: [{
            label: '#',
            name: 'Id',
            key: true,
            width: 5
        }, {
            label: 'File Name',
            name: 'FileName',
            width: 15
        }, {
            label: 'Size',
            name: 'Size',
            width: 20,
            formatter: FormatByte
        }, {
            label: 'Downloaded',
            name: 'Downloaded',
            width: 20,
            formatter: FormatByte
        }, {
            label: '%',
            name: 'Progress',
            width: 5
        }, {
            label: 'Speed',
            name: 'Speed',
            width: 15,
            formatter: FormatSpeedByte
        }, {
            label: 'Progress',
            name: 'Progress',
            formatter: FormatProgressBar
        }],
        viewrecords: true,
        rowNum: 20,
        pager: "#jqGridPager"
    });
}

function FixTable() {
    $.extend($.jgrid.ajaxOptions, {async: false});
    $("#jqGrid").setGridWidth($(window).width() - 5);
    $("#jqGrid").setGridHeight($(window).height());
    $(window).bind('resize', function() {
        $("#jqGrid").setGridWidth($(window).width() - 5);
        $("#jqGrid").setGridHeight($(window).height());
    });
}
function UpdateData() {
    var grid = $("#jqGrid");
    var rowKey = grid.jqGrid('getGridParam', "selrow");
    $("#jqGrid").trigger("reloadGrid");
    if (rowKey) {
        $('#jqGrid').jqGrid("resetSelection")
        $('#jqGrid').jqGrid('setSelection', rowKey);
    }
}
function FormatProgressBar(cellValue, options, rowObject) {
    var intVal = parseInt(cellValue);
    var cellHtml = '<div class="progress"><div class="progress-bar" style="width: ' + intVal + '%"></div></div>'
    return cellHtml;
}
function FormatByte(cellValue, options, rowObject) {
    var intVal = parseInt(cellValue);
    var ras = " B."
    if (intVal > 1024) {
        intVal /= 1024
        ras = " KB."
    }
    if (intVal > 1024) {
        intVal /= 1024
        ras = " MB."
    }
    if (intVal > 1024) {
        intVal /= 1024
        ras = " GB."
    }
    if (intVal > 1024) {
        intVal /= 1024
        ras = " TB."
    }
    var cellHtml = (intVal).toFixed(1) + ras;
    return cellHtml;
}
function FormatSpeedByte(cellValue, options, rowObject) {
    var intVal = parseInt(cellValue);
    var ras = " B/sec."
    if (intVal > 1024) {
        intVal /= 1024
        ras = " KB/sec."
    }
    if (intVal > 1024) {
        intVal /= 1024
        ras = " MB/sec."
    }
    if (intVal > 1024) {
        intVal /= 1024
        ras = " GB/sec"
    }
    if (intVal > 1024) {
        intVal /= 1024
        ras = " TB."
    }
    var cellHtml = (intVal).toFixed(1) + ras;
    return cellHtml;
}
var ws,iv;
function connectSockJS(onopen,onmessage){
	if (ws) {
		if(onopen!=null)onopen();
		return false;
	}
	ws = new SockJS('/progress');
	ws.onopen    = function(){
		if(onopen!=null)onopen();
	};
	ws.onclose   = function(){};
	ws.onmessage = function(msg){
		if(onmessage!=null)onmessage(msg.data);
	};
}

function onLoad() {
    UpdateTable();
    FixTable();
    setInterval(UpdateData, 2000);
}

function sockJSConnect(){
    var grid = $("#jqGrid");
    connectSockJS(null,function(r){
        var rows=JSON.parse(r), rowKey = grid.jqGrid('getGridParam', "selrow");
        grid.trigger("reloadGrid");
        var total = 100*rows.length, finished = 0;
        for (var i = 0; i < rows.length; i++){
            var v = rows[i];
            grid.jqGrid('addRowData', i, v);
            finished=finished+v.Progress;
        }
        alert(finished);
        if(total<=finished){
            window.clearInterval(iv);
        }
        if (rowKey) {
            grid.jqGrid("resetSelection")
            grid.jqGrid('setSelection', rowKey);
        }
    });
}

function sockJSRead(){
    if(!ws)return;
    iv=setInterval(function(){
        ws.send("1");
    }, 2000);
}

function reqJSON(url,data) {
    var opt={
        contentType: "application/json; charset=utf-8",
        url: url,
        type: "POST",
        dataType: "json"
    };
    if(data) opt.data = JSON.stringify(data);
    $.ajax(opt).error(function(jsonData) {
        alert(jsonData);
    }).success(function(jsonData){
        if(jsonData.Code!=1) {
            alert(jsonData.Info);
            return;
        }
        sockJSRead();
    });
}

function reqForm(url,data) {
    var opt={
        url: url,
        type: "POST",
        dataType: "json"
    };
    if(data) opt.data = data;
    $.ajax(opt).error(function(jsonData) {
        alert(jsonData);
    }).success(function(jsonData){
        if(jsonData.Code!=1) {
            alert(jsonData.Info);
            return;
        }
        sockJSRead();
    });
}

function AddDownload() {
    var req = {
        PartCount: parseInt($("#part_count_id").val()),
        FilePath: $("#save_path_id").val(),
        Url: $("#url_id").val()
    };
    reqJSON("/add_task",req);
}
function RemoveDownload() {
    var grid = $("#jqGrid");
    var rowKey = parseInt(grid.jqGrid('getGridParam', "selrow"));
    var req = rowKey;
    reqJSON("/remove_task",req);
}
function StartDownload() {
    var grid = $("#jqGrid");
    var rowKey = parseInt(grid.jqGrid('getGridParam', "selrow"));
    var req = {id:rowKey};
    reqForm("/start_task",req);
}
function StopDownload() {
    var grid = $("#jqGrid");
    var rowKey = parseInt(grid.jqGrid('getGridParam', "selrow"));
    var req = {id:rowKey};
    reqForm("/stop_task",req);
}
function StartAllDownload() {
    reqJSON("/start_all_task");
}
function StopAllDownload() {
    reqJSON("/stop_all_task");
}
function OnChangeUrl() {
    var filename = $("#url_id").val().split('/').pop()
    $("#save_path_id").val(filename)
}

$(function(){
    onLoad();
    //sockJSConnect();sockJSRead();
});