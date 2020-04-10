
//HTTP Request 
var status;
var jsonArray = [];
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
    status += this.status;
    if (this.readyState == 4 && this.status == 200) {
        jsonArray = JSON.parse(this.response);
        console.log(jsonArray);
        fillResTable(jsonArray, resTable);
        fillVisTable(jsonArray, VisTable);
        fillSecTable(jsonArray, table, table2);

    }
    st();
};
xhttp.open("GET", "https://faculty.kfupm.edu.sa/COE/mfelemban/COE445/192/hw2/visits.json", true);
xhttp.send();


function st() {
    if (status == "00") {
        alert("Failed to load content \nPossible CORS Error!")
    }
}