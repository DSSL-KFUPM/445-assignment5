

//initializing #ResPreviousGuests Datatable 
const resTable = $('#ResPreviousGuests').DataTable({
    "pagingType": "simple_numbers",
    "bLengthChange": false,
    renderer: {
        "header": "bootstrap",
        "pageButton": "bootstrap"
    },
    responsive: true,
    colReorder: {
        enable: true,
        realtime: true
    },
    rowReorder: {
        enable: true,
        realtime: true
    },
    "order": [],
    "orderClasses": false,
    "searching": true
});

//initializing #VisPreviousVisits Datatable 
const VisTable = $('#VisPreviousVisits').DataTable({
    "pagingType": "simple_numbers",
    "bLengthChange": false,         //How many entries to show
    renderer: {
        "header": "bootstrap",
        "pageButton": "bootstrap"
    },
    responsive: true,
    colReorder: {
        enable: true,
        realtime: true
    },
    rowReorder: {
        enable: true,
        realtime: true
    },
    "order": [],
    "orderClasses": false,
    "searching": true
});

var table = $('#PreviousGuests').DataTable({
    "pagingType": "simple_numbers",
    "bLengthChange": false,
    renderer: {
        "header": "bootstrap",
        "pageButton": "bootstrap"
    },
    responsive: true,
    colReorder: {
        enable: true,
        realtime: true
    },
    rowReorder: {
        enable: true,
        realtime: true
    },
    "order": [],
    "orderClasses": false,
    "searching": false,   // Search Box will Be Disabled     
});

var table2 = $('#CurrentVisitors').DataTable({
    "pagingType": "simple_numbers",
    "bLengthChange": false,
    renderer: {
        "header": "bootstrap",
        "pageButton": "bootstrap"
    },
    responsive: true,
    colReorder: {
        enable: true,
        realtime: true
    },
    rowReorder: {
        enable: true,
        realtime: true
    },
    "order": [],
    "orderClasses": false,
    "searching": false   // Search Box will Be Disabled   
});

function ResAddRow() {
    var inp = document.getElementById("resReqDiv").querySelectorAll("#resReq");
    var notEmpty=true;

    for(var i =0;i<inp.length;i++){
        if(inp[i].value.length==0){
            alert("Empty input")
            notEmpty=fales;
        }
    }
    if(notEmpty){
        snackBar();
        resTable.row.add([
            inp[0].value,
            inp[3].value + " " + inp[4].value,
            inp[1].value,
            inp[5].value,
            inp[2].value
        ]).draw(false);
    }
   
}

function visAddRow() {
    var inp = document.getElementById("visReqDiv").querySelectorAll("#visReq");
    var notEmpty=true;

    for(var i =0;i<inp.length;i++){
        if(inp[i].value.length==0){
            alert("Empty input")
            notEmpty=fales;
        }
    }
    if(notEmpty){
        snackBar();
        VisTable.row.add([
            inp[0].value,
            inp[3].value + " " + inp[4].value,
            inp[1].value,
            inp[5].value,
            inp[2].value
        ]).draw(false);
    }
}



function fillResTable(jsonArray, resTable) {

    for (var i = 0; i < jsonArray.length; i++) {

        //adding rows to both tables
        if (jsonArray[i]["host"] == "Majid Yazeed") {
            if (document.getElementById("usr") != null) {
                document.getElementById("usr").value = jsonArray[i].host;
            }

            resTable.row.add([
                jsonArray[i].name,
                jsonArray[i]["car make"] + " " + jsonArray[i]["car model"],
                jsonArray[i].destination,
                jsonArray[i].date,
                jsonArray[i].time
            ]).draw(false);
        } else {

        }

    }

}


function fillVisTable(jsonArray, VisTable) {

    for (var i = 0; i < jsonArray.length; i++) {

        //adding rows to the tables
        if (jsonArray[i]["name"] == "Saeed Saad") {
            if (document.getElementById("visusr") != null) {
                document.getElementById("visusr").value = jsonArray[i].name;
            }
            VisTable.row.add([
                jsonArray[i].host,
                jsonArray[i]["car make"] + " " + jsonArray[i]["car model"],
                jsonArray[i].destination,
                jsonArray[i].date,
                jsonArray[i].time
            ]).draw(false);
        } else {

        }

    }

}


function fillSecTable(jsonArray, table, table2) {

    for (var i = 0; i < jsonArray.length; i++) {

        //adding rows to both tables
        if (jsonArray[i]["checked out"] == "YES") {
            table.row.add([
                jsonArray[i].name,
                jsonArray[i]["car make"] + " " + jsonArray[i]["car model"],
                jsonArray[i].destination,
                jsonArray[i].date,
                jsonArray[i].time
            ]).draw(false);
        } else {
            table2.row.add([
                jsonArray[i].name,
                jsonArray[i]["car make"] + " " + jsonArray[i]["car model"],
                jsonArray[i].destination,
                jsonArray[i].date,
                jsonArray[i].time
            ]).draw(false);



        }

    }

}


//Search script for PreviousGuests table
$(document).ready(function () {
    $("#PrevInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myTable2 tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});

//Search script for CurrentVisitors table
$(document).ready(function () {
    $("#CurInput").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#myTable1 tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});

function snackBar() {
    var snackBarDiv = document.getElementById("snackbar");
    snackBarDiv.className = "show";
    setTimeout(function(){ snackBarDiv.className = snackBarDiv.className.replace("show", ""); }, 1000);
  }