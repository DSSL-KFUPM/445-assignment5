
        fetch("https://faculty.kfupm.edu.sa/COE/mfelemban/COE445/192/hw2/visits.json").then(
            res=>{
                res.json().then(
                    data=>{
                        console.log(data);
                        if(data.length >0) {
                            var temp="";
                            var t=" "
                            // start loop
                            data.forEach(element => {

                                if(element.name=="Saeed Saad") {
                                t="Username: "+element.name; 
                                temp+="<tr>";
                                temp+="<td>"+element.host;
                                temp+="<td>"+element.name;
                                temp+="<td>"+element.date;      
                                temp+="<td>"+element.time;
                                temp+="<td>"+element.destination;
                                temp+="<td>"+element['car make'];
                                 temp+="<td>"+element['car model'] ;
                                temp+="<td>"+element['plate number'];
                                temp+="<td>"+element['checked out'];            
                                }              
                            });
                            document.getElementById("visitInfodata").innerHTML=temp;
                            document.getElementById("vistorName").innerHTML=t;     
                        }
    
                    }
                )
            }
        )

        fetch("https://faculty.kfupm.edu.sa/COE/mfelemban/COE445/192/hw2/visits.json").then(
            res=>{
                res.json().then(
                    data=>{
                        console.log(data);
                        if(data.length >0) {
                            var temp1="";
                            var t2=""
                            // start loop
                            data.forEach(element => {

                                if(element.host=="Majid Yazeed") {
                                t2="Username: "+element.host; 
                                temp1+="<tr>";
                                temp1+="<td>"+element.host;
                                temp1+="<td>"+element.name;
                                temp1+="<td>"+element.date;      
                                temp1+="<td>"+element.time;
                                temp1+="<td>"+element.destination;
                                temp1+="<td>"+element['car make'];
                                 temp1+="<td>"+element['car model'] ;
                                temp1+="<td>"+element['plate number'];
                                temp1+="<td>"+element['checked out'];            
                                }           
                            });
                            document.getElementById("residentInfoData").innerHTML=temp1;
                            document.getElementById("residentName").innerHTML=t2;    
                        }
                    }
                )
            }
        )
        
      
        fetch("https://faculty.kfupm.edu.sa/COE/mfelemban/COE445/192/hw2/visits.json").then(
            res=>{
                res.json().then(
                    data=>{
                        console.log(data);
                        if(data.length >0) {
                            var temp3="";
                            // start loop
                            data.forEach(element => {

                                if(element['checked out']=="NO") {
                                temp3+="<tr>";
                                temp3+="<td>"+element.host;
                                temp3+="<td>"+element.name;
                                temp3+="<td>"+element.date;      
                                temp3+="<td>"+element.time;
                                temp3+="<td>"+element.destination;
                                temp3+="<td>"+element['car make'];
                                temp3+="<td>"+element['car model'] ;
                                temp3+="<td>"+element['plate number'];
                                temp3+="<td>"+element['checked out'];            
                                }           
                            });
                            document.getElementById("currentVisitors").innerHTML=temp3;      
                        }
                    }
                )
            }
        )
        fetch("https://faculty.kfupm.edu.sa/COE/mfelemban/COE445/192/hw2/visits.json").then(
            res=>{
                res.json().then(
                    data=>{
                        console.log(data);
                        if(data.length >0) {
                            var temp4="";
                            // start loop
                            data.forEach(element => {

                                if(element['checked out']=="YES") {
                                temp4+="<tr>";
                                temp4+="<td>"+element.host;
                                temp4+="<td>"+element.name;
                                temp4+="<td>"+element.date;      
                                temp4+="<td>"+element.time;
                                temp4+="<td>"+element.destination;
                                temp4+="<td>"+element['car make'];
                                 temp4+="<td>"+element['car model'] ;
                                temp4+="<td>"+element['plate number'];
                                temp4+="<td>"+element['checked out'];            
                                }             
                            });
                            document.getElementById("previousVisitors").innerHTML=temp4;        
                        }
                    }
                )
            }
        )

    