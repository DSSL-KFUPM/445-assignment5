var Vsr = 1;
var Rsr = 1;

function loadVisitor() {
    var xhrequest = new XMLHttpRequest();
    xhrequest.onreadystatechange = function() {
        if (this.readyState == 4 & this.status == 200) {
            var response = xhrequest.responseText;
            var visitors = JSON.parse(response);
            var counter = 0;

            for (var visitor in visitors) {
                if (visitors[visitor].name == "Saeed Saad") {
                    if (counter == 0) {
                        document.getElementById("visitorName").innerHTML = visitors[visitor].name;
                        counter = 1;


                    }
                    if (visitors[visitor]["checked out"] == "YES") {
                        var Brand = "<td>" + visitors[visitor]["car make"] + "</td>";
                        var model = "<td>" + visitors[visitor]["car model"] + "</td>";
                        var plate = "<td>" + visitors[visitor]["plate number"] + "</td>";
                        var destination1 = "<td>" + visitors[visitor].destination + "</td>";

                        var time = "<td>" + visitors[visitor].time + "</td>";

                        var date = "<td>" + visitors[visitor].date + "</td>";

                        var host = "<td>" + visitors[visitor].host + "</td>";

                        var item = "<tr><td>" + Vsr + "</td>" + Brand + model + plate + destination1 + date + time + host;



                        $("#visitorTable").append(item);
                        Vsr++;

                    }

                }
            }

        }
    };
    xhr.open("GET", "/visits.json", true);
    xhrequest.send();

}

function loadResident() {
    var xhrequest = new XMLHttpRequest();
    xhrequest.onreadystatechange = function() {
        if (this.readyState == 4 & this.status == 200) {
            var response = xhrequest.responseText;
            var visitors = JSON.parse(response);
            var counter = 0;

            for (var visitor in visitors) {
                if (visitors[visitor].host == "Majid Yazeed") {
                    if (counter == 0) {
                        document.getElementById("hostName").innerHTML = visitors[visitor].host;
                        counter = 1;


                    }
                    if (visitors[visitor]["checked out"] == "YES") {
                        var Brand = "<td>" + visitors[visitor]["car make"] + "</td>";
                        var model = "<td>" + visitors[visitor]["car model"] + "</td>";
                        var plate = "<td>" + visitors[visitor]["plate number"] + "</td>";
                        var destination1 = "<td>" + visitors[visitor].destination + "</td>";

                        var time = "<td>" + visitors[visitor].time + "</td>";

                        var date = "<td>" + visitors[visitor].date + "</td>";

                        var name = "<td>" + visitors[visitor].name + "</td>";

                        var item = "<tr><td>" + Rsr + "</td>" + Brand + model + plate + destination1 + date + time + name;
                        $("#residentTable").append(item);
                        Rsr++;

                    }

                }
            }

        }
    };
    xhr.open("GET", "/visits.json", true);
    xhrequest.send();

}

function loadSecurity() {
    var xhrequest = new XMLHttpRequest();
    xhrequest.onreadystatechange = function() {
        if (this.readyState == 4 & this.status == 200) {
            var response = xhrequest.responseText;
            var visitors = JSON.parse(response);
            var pSr = 1;
            var cSr = 1;
            for (var visitor in visitors) {
                var Brand = "<td>" + visitors[visitor]["car make"] + "</td>";
                var model = "<td>" + visitors[visitor]["car model"] + "</td>";
                var plate = "<td>" + visitors[visitor]["plate number"] + "</td>";
                var destination1 = "<td>" + visitors[visitor].destination + "</td>";

                var time = "<td>" + visitors[visitor].time + "</td>";

                var date = "<td>" + visitors[visitor].date + "</td>";

                var name = "<td>" + visitors[visitor].name + "</td>";

                var host = "<td>" + visitors[visitor].host + "</td>";


                if (visitors[visitor]["checked out"] == "YES") {
                    var item = "<tr><td>" + pSr + "</td>" + Brand + model + plate + destination1 + date + time + host + name;



                    $("#previousSecurity").append(item);
                    pSr++;



                } else {
                    var item = "<tr><td>" + cSr + "</td>" + Brand + model + plate + destination1 + date + time + host + name;



                    $("#currentSecurity").append(item);
                    cSr++;

                }
            }

        }
    };
    xhr.open("GET", "/visits.json", true);
    xhrequest.send();


}


function buttoOnClick() {

}
$(document).ready(function() {
    $("#visitSubmit").click(function() {
        var brandtext = $("#brand").val();
        var brand = "<td>" + brandtext + "</td>";

        var modeltext = $("#model").val();
        var model = "<td>" + modeltext + "</td>";

        var licensetext = $("#LI").val();
        var license = "<td>" + licensetext + "</td>";

        var destinationtext = $("#dest").val();
        var destination = "<td>" + destinationtext + "</td>";

        var datetext = $("#date").val();
        var date = "<td>" + datetext + "</td>";

        var timetext = $("#time").val();
        var time = "<td>" + timetext + "</td>";

        var hosttext = $("#host").val();
        var host = "<td>" + hosttext + "</td>";

        var visitortext = $("#visitor").val();
        var visitor = "<td>" + visitortext + "</td>";


        if (brandtext != "" & modeltext != "" & licensetext != "" & destinationtext != "" & datetext != "" & timetext != "") {
            if (hosttext != "" & visitortext == null) {
                var element = "<tr><td>" + Vsr + "</td>" +
                    brand + model + license + destination + date + time + host + "</tr>";
                $("#visitorTable").append(element);


                Vsr++;




            } else if (hosttext == null & visitortext != "") {
                var element = "<tr><td>" + Rsr + "</td>" +
                    brand + model + license + destination + date + time + visitor + "</tr>";
                $("#residentTable").append(element);


                Rsr++;



            } else {
                alert("Some fields are empty! fill all fields");

            }


        } else {
            alert("Some fields are empty! fill all fields");
        }



    });
});




$("#visitorBody").ready(loadVisitor());
$("#residentBody").ready(loadResident());
$("#securityBody").ready(loadSecurity());