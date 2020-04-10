$(document).ready(() => {
  $('#password, #confirm').on('keyup', function () {
    if ($('#password').val() != $('#confirm').val() || $('#password').val() == '') {
      $('#confirm').css("border", "1px solid red");
      $("#btnSubmit").attr("disabled", true);
    }
    else {
      $('#confirm').css("border", "1px solid green");
      $("#btnSubmit").attr("disabled", false);
    }
  });
  $('#email').on('keyup', function () {
    if ($(this).val() == '') {
      $(this).css("border", "1px solid red");
      $("#btnSubmit").attr("disabled", true);
    }
    else {
      $(this).css("border", "1px solid green");
      $("#btnSubmit").attr("disabled", false);
    }
  });
  $('#name').on('keyup', function () {
    if ($(this).val() == '') {
      $(this).css("border", "1px solid red");
      $("#btnSubmit").attr("disabled", true);
    }
    else {
      $(this).css("border", "1px solid green");
      $("#btnSubmit").attr("disabled", false);
    }
  });
});