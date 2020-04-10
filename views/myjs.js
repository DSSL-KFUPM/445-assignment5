    var counter = 0;
    var time = 0;
    var temp = 0;

 function refresh2(where, who, to, security, students) {

        var name = String(to);

                var check_nums =new Object();
                for (var s in students) {
                    console.log(students[s]);
                    //                $("#roster").append("<li>" + students[s].name);
                    time = students[s].time;
                        time = TimeColor(time)
                    checkin = students[s].checked_in
                    checkin = checkColor(checkin,students[s].id)
                    checkout = students[s].checked_out
                    checkout = checkColor2(checkout)
                    check_nums[students[s].id] = students[s].check_in_num;
                     var newrow = "<tr  data-toggle= 'modal' data-target='#exampleModal' onclick='mymodal("+students[s].id+')\'>'
                    if (security) {
                       if (students[s]["checked_out"].toUpperCase() === "NO") {
                            $("#rows1").append(newrow + "<td>" + students[s].id + "<td>" + students[s].name + "<td>" + students[s].destination + "<td>" + time + "<td>" + '<span style="color: skyblue">' + students[s]["plate_number"] + "<td>" + students[s].date + "<td>" + checkin + "<td>" + checkout );
                        } else {
                            $("#rows2").append("<tr>" + "<td>" + students[s].id + "<td>" + students[s].name + "<td>" + students[s].destination + "<td>" + time + "<td>" + '<span style="color: skyblue">' + students[s]["plate_number"] + "<td>" + students[s].date );
                        }                       
                    }else if (students[s][where].toLowerCase() == who.toLowerCase() && !security) {
                     var newrow = "<tr data-toggle= 'modal' data-target='#exampleModal' onclick='mymodal("+students[s].id+')\'>'
                        console.log("   in          ");
                        console.log(students[s]);
                       
//                        console.log(newrow)
                        $("#rows").append(newrow + "<td>" + students[s].id + "<td>" + students[s][to] + "<td>" + students[s].destination + "<td>" + time + "<td>" + '<span style="color: skyblue">' + students[s]["plate_number"] + "<td>" + students[s].date + "<td>" + checkin);
                        
                    }
                }
     if(security){
         return [check_nums,students];
     }
     console.log(check_nums)
     return check_nums;
 }
//    function refresh(where, who, to, security) {
//
//        var xhr = new XMLHttpRequest();
//        var name = String(to);
//        xhr.onreadystatechange = function () {
//            if (this.readyState == 4 & this.status == 200) {
//                var data = xhr.responseText;
//                                    console.log(data);
//
//                var students = JSON.parse(data);
//
//
//                for (var s in students) {
//                    console.log(students[s]);
//                    //                $("#roster").append("<li>" + students[s].name);
//                    if (students[s][where] == who && !security) {
//                        time = students[s].time;
//                        time = TimeColor(time)
//
//                        $("#rows").append("<tr>" + "<td>" + counter + "<td>" + students[s][to] + "<td>" + students[s].destination + "<td>" + time + "<td>" + '<span style="color: skyblue">' + students[s]["plate number"] + "<td>" + students[s].date);
//                        counter += 1;
//
//                    } else if (security) {
//                        if (students[s]["checked out"] === "YES") {
//                            $("#rows1").append("<tr>" + "<td>" + counter + "<td>" + students[s].name + "<td>" + students[s].destination + "<td>" + time + "<td>" + '<span style="color: skyblue">' + students[s]["plate number"] + "<td>" + students[s].date);
//                        } else {
//                            $("#rows2").append("<tr>" + "<td>" + counter + "<td>" + students[s].name + "<td>" + students[s].destination + "<td>" + time + "<td>" + '<span style="color: skyblue">' + students[s]["plate number"] + "<td>" + students[s].date);
//                        }
//                        counter += 1;
//                    }
//                }
//            }
//        };
//        xhr.open("GET", "./visits.json", true);
//        xhr.send();
//    }

    function TimeColor(time) {
        time = time.toUpperCase();
        try {
            temp = time.indexOf("A");
            if (temp >= 0) {
                time = time.slice(0, (temp));
                time = time + ' <span style="color:green ">AM</span>'
            } else {
                temp = time.indexOf("P");
                time = time.slice(0, (temp));
                time = time + ' <span style="color: blueviolet">PM</span>'

            }
        } catch (err) {
            console.log("error");
        }
        return time;
    }
     function checkColor(ch,id) {
         if (ch == "NO"){
             
             return '<span id =\''+id+'\' style="color: blueviolet">NO</span>'
         }
         return '<span id =\''+id+'\' >YES</span>'
     }
 function checkColor2(ch,id) {
         if (ch == "NO"){
             
             return '<span style="color: blueviolet">NO</span>'
         }
         return '<span  >YES</span>'
     }
//    function Request(name) {
//        time = document.getElementById("Visit Time").value
//        time = TimeColor(time)
//        $("#rows").append("<tr>" + "<td>" + counter + "<td>" + document.getElementById("Vname").value + "<td>" + document.getElementById("Destination").value + "<td>" + time + "<td>" + '<span style="color: skyblue">' + document.getElementById("Plate number").value + "<td>" + document.getElementById("date").value);
//        counter += 1;
//    }
