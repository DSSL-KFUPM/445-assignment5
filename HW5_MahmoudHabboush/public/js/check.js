$(document).ready(() => {
    $("#submitForm").click(() => {
        $('#msg').remove();
        var data = $('#form').serializeArray().reduce(function (obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});
        var test = true;
        for (var d in data)
            if (data[d] == '') {
                test = false;
                break;
            }
        if (test) {
            fetch("http://localhost:3000/check", {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "PUT",
                body: JSON.stringify(data)
            }).then((response) => response.json())
            .then((result) => {
              if(result.msg=="err")
                $('#form').append('<div id="msg" class="alert alert-danger" role="alert">Sorry, it seems the code is incorrect</div>');
              else {
                msg = "The visitor "+'"'+result.visitor+'"'+" status changed to "+(result.status=="YES"?'"Outside Campus"':'"Inside Campus"')+"<br>Visitor's car plate number is: "+'"'+result.plate+'"'+"<br>The host "+'"'+result.host+'"'+" was notified on their email<br>"+result.hostEmail;
                console.log(msg);
                $('#form').append('<div id="msg" class="alert alert-success" role="alert">'+msg+'</div>');
              }
            })
        } else
            alert("Please fill all details")
    });
});