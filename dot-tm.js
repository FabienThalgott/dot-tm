var json;
var doom='';
var processes='';
var entities='';
var datastores='';
var edges = '';
var clusters = '';

var processforEdge = new Array();
var entitiesforEdge = new Array();
var datastoreforEdge = new Array();
var processesforCluster = new Array();
var entitiesforCluster = new Array();
var datastoreforCluster = new Array();
var clusterList = new Array();

function newTM() {
    $("#graph").empty();
    $.ajax({
        url: "skeleton.json",
        dataType: "text",
        success: function (data) {
            json = JSON.parse(data);
            $("#TM").empty();
            $("#TM").append("<h1>" + json.name + "</h1>");
            reloadAll()
        }
    });
    
}

function loadGraph() {
  
    fileID = guid();
    $("#graph").empty();

    $.ajax({
        type: "POST",
        url: "generateGraph.php?file="+fileID,
        contentType: "application/json",
        data: JSON.stringify(json),
        success: function (dataString) {
            var container = document.getElementById('interactivegraph');
            var data = vis.network.convertDot(dataString);
            var network = new vis.Network(container, data);
            $("#graph").append('<img src="' + fileID + '.png"><img>');
        }
    });


}

function switchGraph() {
    if ($("#switchGraph").is(":checked")) {
        $("#graph").hide();
        $("#interactivegraph").show();
    }
    else {
        $("#interactivegraph").hide();
        $("#graph").show();
    }
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}




function uploadJson() {
    $("#graph").empty();
    var file = document.getElementById("btnUpload").files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            json = JSON.parse(evt.target.result);
            reloadAll()
        }
        reader.onerror = function (evt) {
            $("#TM").empty();
            $("#TM").append("error reading file");
        }
    }
    console.log(result);
}



function reloadAll() {
    clusterList = new Array();
    reloadDoomsday();
    reloadProcesses();
    reloadDatastores();
    reloadEntities();
    reloadEdges();
    reloadClusters();
   
}


function loadExample() {
     
    $.ajax({
        url: "Example.json",
        dataType: "text",
        success: function (data) {
            json = JSON.parse(data);
            $("#TM").empty();
            $("#TM").append("<h1>"+json.name+"</h1>");
            reloadAll()
        }
    });
}

function addDoomsday() {
    var uuid = getID();
    var cat = $("#doomCategory").val();
    var lab = $("#doomLabel").val();
    var doomToAdd ={ 'label': lab, 'category': cat };
    json.Doomsday[uuid] = doomToAdd;
    reloadDoomsday();
    $("#doomCategory").val('');
    $("#doomLabel").val('');
}

function deleteDoomsday(index) {
    delete json.Doomsday[index];
    reloadDoomsday();
}


function getJSON() {
    var exportName = 'TM'
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}


function reloadDoomsday() {
    doom = '';
    $("#Doomsdays").empty();
    for (index in json.Doomsday) {
       doom += '<br> <input type="button" value="Delete" onclick="deleteDoomsday(\''+index+'\')" >' + json.Doomsday[index].category + '<br>' + json.Doomsday[index].label + '<br>';
    }
    $("#Doomsdays").append(doom);
}

function reloadProcesses() {
    processes = '';
    processforEdge = new Array();
    
    $("#Processes").empty();
    for (index in json.nodes.processes) {
        processes += '<br> <input type="button" value="Delete" onclick="deleteProcess(\'' + index + '\')" >' + json.nodes.processes[index].label + ' | Cluster : ' + json.nodes.processes[index].cluster;
        processforEdge.push(json.nodes.processes[index].label);
        if (clusterList.indexOf(json.nodes.processes[index].cluster) == -1)
            clusterList.push(json.nodes.processes[index].cluster);
        
    }
    $("#Processes").append(processes);
    reloadEdgeBoxes();
    reloadClusters();

}

function reloadEntities() {
    entities = '';
    entitiesforEdge = new Array();
    $("#Entities").empty();
    for (index in json.nodes.entities) {
        entities += '<br> <input type="button" value="Delete" onclick="deleteEntity(\'' + index + '\')" >' + json.nodes.entities[index].label + ' | Cluster : ' + json.nodes.entities[index].cluster;
        entitiesforEdge.push(json.nodes.entities[index].label)
        if (clusterList.indexOf(json.nodes.entities[index].cluster) == -1)
            clusterList.push(json.nodes.entities[index].cluster);

    }
    $("#Entities").append(entities);
    reloadEdgeBoxes();
    reloadClusters();
}

function reloadDatastores() {
    datastores = '';
    datastoreforEdge = new Array();
    $("#Datastores").empty();
    for (index in json.nodes.datastores) {
        datastores += '<br> <input type="button" value="Delete" onclick="deleteDatastore(\'' + index + '\')" >' + json.nodes.datastores[index].label + ' | Cluster : ' + json.nodes.datastores[index].cluster;
        datastoreforEdge.push(json.nodes.datastores[index].label)
        if (clusterList.indexOf(json.nodes.datastores[index].cluster) == -1)
            clusterList.push(json.nodes.datastores[index].cluster);
        
    }
    $("#Datastores").append(datastores);
    reloadEdgeBoxes();
    reloadClusters();
}

function reloadClusters() {
    clusters = '';
    $("#clusterList").empty();
    $("#Clusters").empty();
    for (index in json.nodes.nestedclusters) {
        clusters += '<br> <input type="button" value="Delete" onclick="deleteCluster(\'' + index + '\')" >' + json.nodes.nestedclusters[index] ;
    }
    $("#Clusters").append(clusters);
    $("#clusterList").append(clusterList.toString());

}

function reloadEdges() {
    edges = '';
    $("#Edges").empty();
    for (index in json.nodes.edges) {
        if (json.nodes.edges[index].stride)
            edges += '<br> <input type="button" value="Edit" onclick="editEdge(\'' + index + '\')" ><input type="button" value="Delete" onclick="deleteEdge(\'' + index + '\')" ><input id="' + index + '" hidden type="text" /> From : ' + json.nodes.edges[index].from + ' To : ' + json.nodes.edges[index].to + ' Label : ' + json.nodes.edges[index].label + '<label><input disabled checked="checked" type="checkbox" />isTrustBoundary</label>';
        else
            edges += '<br> <input type="button" value="Edit" onclick="editEdge(\'' + index + '\')" ><input type="button" value="Delete" onclick="deleteEdge(\'' + index + '\')" ><input id="' + index + '" hidden type="text" /> From : ' + json.nodes.edges[index].from + ' To : ' + json.nodes.edges[index].to + ' Label : ' + json.nodes.edges[index].label;

    }
    $("#Edges").append(edges);
    reloadEdgeBoxes();
}

function reloadEdgeBoxes() {
    $("#edgeTo").empty();
    $("#edgeFrom").empty();

    
    for (i = 0; i < processforEdge.length; i++) {
        $("#edgeTo").append('<option value="' + processforEdge[i] + '">' + processforEdge[i] + '</option >');
        $("#edgeFrom").append('<option value="' + processforEdge[i] + '">' + processforEdge[i] + '</option >');

    }

    for (i = 0; i < datastoreforEdge.length; i++) {
        $("#edgeTo").append('<option value="' + datastoreforEdge[i] + '">' + datastoreforEdge[i] + '</option >');
        $("#edgeFrom").append('<option value="' + datastoreforEdge[i] + '">' + datastoreforEdge[i] + '</option >');
    }

    for (i = 0; i < entitiesforEdge.length; i++) {
        $("#edgeTo").append('<option value="' + entitiesforEdge[i] + '">' + entitiesforEdge[i] + '</option >');
        $("#edgeFrom").append('<option value="' + entitiesforEdge[i] + '">' + entitiesforEdge[i] + '</option >');
    }
    
}

function addProcess() {
    var uuid = getID();
    var clu = $("#processCluster").val();
    var lab = $("#processLabel").val();
    var processToAdd = { 'label': lab, 'cluster': clu };
    json.nodes.processes[uuid] = processToAdd;
    reloadProcesses();
    $("#processCluster").val('');
    $("#processLabel").val('');
}

function deleteProcess(index) {
    checkEdge(json.nodes.processes[index].label);
    delete json.nodes.processes[index];
    reloadProcesses();
}

function addDatastore() {
    var uuid = getID();
    var clu = $("#datastoreCluster").val();
    var lab = $("#datastoreLabel").val();
    var datastoreToAdd = { 'label': lab, 'cluster': clu };
    json.nodes.datastores[uuid] = datastoreToAdd;
    reloadDatastores();
    $("#datastoreCluster").val('');
    $("#datastoreLabel").val('');
}

function deleteDatastore(index) {
    checkEdge(json.nodes.datastores[index].label);
    delete json.nodes.datastores[index];
    reloadDatastores();
}

function addEntity() {
    var uuid = getID();
    var clu = $("#entityCluster").val();
    var lab = $("#entityLabel").val();
    var entityToAdd = { 'label': lab, 'cluster': clu };
    json.nodes.entities[uuid] = entityToAdd;
    reloadEntities();
    $("#entityCluster").val('');
    $("#entityLabel").val('');
}

function deleteEntity(index) {
    checkEdge(json.nodes.entities[index].label);
    delete json.nodes.entities[index];
    reloadEntities();
}

function checkEdge(label) {
    for (index in json.nodes.edges) {
        if (json.nodes.edges[index].from == label || json.nodes.edges[index].to == label)
            deleteEdge(index)
    }

}

function addEdge() {
  
    if (!$("#edgeID").val())
        var uuid = getID();
    else
        var uuid = $("#edgeID").val()

    var fromE = $("#edgeFrom").val();
    var ToE = $("#edgeTo").val();
    var labE = $("#edgeLabel").val();
    if ($("#isTrustBoundary").is(":checked")) {
        var edgeToAdd = {
            'label': labE,
            'from': fromE,
            'to': ToE,
            "stride": {
                "_comment": "",
                "crossingboundary": "",
                "st1": $("#st1").val(),
                "st2": $("#st2").val(),
                "st3": $("#st3").val(),
                "sm1": $("#sm1").val(),
                "sm2": $("#sm2").val(),
                "sm3": $("#sm3").val(),
               
                "tt1": $("#tt1").val(),
                "tt2": $("#tt2").val(),
                "tt3": $("#tt3").val(),
                "tm1": $("#tm1").val(),
                "tm2": $("#tm2").val(),
                "tm3": $("#tm3").val(),
                
                "rt1": $("#rt1").val(),
                "rt2": $("#rt2").val(),
                "rt3": $("#rt3").val(),
                "rm1": $("#rm1").val(),
                "rm2": $("#rm2").val(),
                "rm3": $("#rm3").val(),
                
                "it1": $("#it1").val(),
                "it2": $("#it2").val(),
                "it3": $("#it3").val(),
                "im1": $("#im1").val(),
                "im2": $("#im2").val(),
                "im3": $("#im3").val(),
                
                "dt1": $("#dt1").val(),
                "dt2": $("#dt2").val(),
                "dt3": $("#dt3").val(),
                "dm1": $("#dm1").val(),
                "dm2": $("#dm2").val(),
                "dm3": $("#dm3").val(),
                
                "et1": $("#et1").val(),
                "et2": $("#et2").val(),
                "et3": $("#et3").val(),
                "em1": $("#em1").val(),
                "em2": $("#em2").val(),
                "em3": $("#em3").val(),
            }
        };
    }
    else {
        var edgeToAdd = { 'label': labE, 'from': fromE, 'to': ToE };
     }
    json.nodes.edges[uuid] = edgeToAdd;
    reloadEdges();
    $("#isTrustBoundary").prop('checked', false);
    $("#strideTable").hide();
    $("#edgeLabel").val('');

    //cleanup stride table
    $("#st1").val('');
    $("#sm1").val('');
    $("#st2").val('');
    $("#sm2").val('');
    $("#st3").val('');
    $("#sm3").val('');

    $("#tt1").val('');
    $("#tm1").val('');
    $("#tt2").val('');
    $("#tm2").val('');
    $("#tt3").val('');
    $("#tm3").val('');

    $("#rt1").val('');
    $("#rm1").val('');
    $("#rt2").val('');
    $("#rm2").val('');
    $("#rt3").val('');
    $("#rm3").val('');

    $("#it1").val('');
    $("#im1").val('');
    $("#it2").val('');
    $("#im2").val('');
    $("#it3").val('');
    $("#im3").val('');

    $("#dt1").val('');
    $("#dm1").val('');
    $("#dt2").val('');
    $("#dm2").val('');
    $("#dt3").val('');
    $("#dm3").val('');

    $("#et1").val('');
    $("#em1").val('');
    $("#et2").val('');
    $("#em2").val('');
    $("#et3").val('');
    $("#em3").val('');

}

function deleteEdge(index) {
    delete json.nodes.edges[index];
    reloadEdges();

}

function editEdge(index) {
    //populate the edit fields
    $("#edgeFrom").val(json.nodes.edges[index].from);
    $("#edgeTo").val(json.nodes.edges[index].to);
    $("#edgeLabel").val(json.nodes.edges[index].label);
    $("#edgeID").val(index);
    if (json.nodes.edges[index].stride){
        $("#isTrustBoundary").prop('checked', true);
        $("#strideTable").show();
        $("#st1").val(json.nodes.edges[index].stride.st1);
        $("#sm1").val(json.nodes.edges[index].stride.sm1);
        $("#st2").val(json.nodes.edges[index].stride.st2);
        $("#sm2").val(json.nodes.edges[index].stride.sm2);
        $("#st3").val(json.nodes.edges[index].stride.st3);
        $("#sm3").val(json.nodes.edges[index].stride.sm3);

        $("#tt1").val(json.nodes.edges[index].stride.tt1);
        $("#tm1").val(json.nodes.edges[index].stride.tm1);
        $("#tt2").val(json.nodes.edges[index].stride.tt2);
        $("#tm2").val(json.nodes.edges[index].stride.tm2);
        $("#tt3").val(json.nodes.edges[index].stride.tt3);
        $("#tm3").val(json.nodes.edges[index].stride.tm3);

        $("#rt1").val(json.nodes.edges[index].stride.rt1);
        $("#rm1").val(json.nodes.edges[index].stride.rm1);
        $("#rt2").val(json.nodes.edges[index].stride.rt2);
        $("#rm2").val(json.nodes.edges[index].stride.rm2);
        $("#rt3").val(json.nodes.edges[index].stride.rt3);
        $("#rm3").val(json.nodes.edges[index].stride.rm3);

        $("#it1").val(json.nodes.edges[index].stride.it1);
        $("#im1").val(json.nodes.edges[index].stride.im1);
        $("#it2").val(json.nodes.edges[index].stride.it2);
        $("#im2").val(json.nodes.edges[index].stride.im2);
        $("#it3").val(json.nodes.edges[index].stride.it3);
        $("#im3").val(json.nodes.edges[index].stride.im3);

        $("#dt1").val(json.nodes.edges[index].stride.dt1);
        $("#dm1").val(json.nodes.edges[index].stride.dm1);
        $("#dt2").val(json.nodes.edges[index].stride.dt2);
        $("#dm2").val(json.nodes.edges[index].stride.dm2);
        $("#dt3").val(json.nodes.edges[index].stride.dt3);
        $("#dm3").val(json.nodes.edges[index].stride.dm3);

        $("#et1").val(json.nodes.edges[index].stride.et1);
        $("#em1").val(json.nodes.edges[index].stride.em1);
        $("#et2").val(json.nodes.edges[index].stride.et2);
        $("#em2").val(json.nodes.edges[index].stride.em2);
        $("#et3").val(json.nodes.edges[index].stride.et3);
        $("#em3").val(json.nodes.edges[index].stride.em3);
    }
}

function displayStride() {
    if ($("#isTrustBoundary").is(":checked"))
        $("#strideTable").show();
    else
        $("#strideTable").hide();
}

function deleteCluster(index) {
    delete json.nodes.clusters[index];
    reloadClusters();
}

function addCluster() {
    var uuid = getID();
    var clu = $("#nestedCluster").val();
    var clusterarray = clu.split(',');
    json.nodes.nestedclusters[uuid] = clusterarray;
    reloadClusters();
    $("#nestedCluster").val('');
   
}


function getID() {
        //should be unique enough
        return '_' + Math.random().toString(36).substr(2, 9);
  
}


