$(document).ready(function() {

  $('#search_form').submit(function(event) {
    event.preventDefault();

    var query = $('#search_form').serializeArray()[0].value;
    //console.log(query);

    if (!isValid(query)) {
      $('#err_msg').text('Please enter an 8 digit student number');
      return;
    }
    $('#err_msg').text('');

    $.ajax({
      type: 'post',
      url: '/api/banned/search',
      data: {userID: query},
      success: success,
      error: fail,
    });
  });

  function success(result) {
    if (!result.success) {
      $('#err_msg').text(result.message);
      return;
    }

    $('#confirm_text_user').text(result.user.firstName + ' ' + result.user.lastName + ' ' + result.user.userID);
    $('#confirm_button_ban').attr('value', result.user.userID);
    $('#confirm_modal').modal('show');
  }

  function fail(result) {
    $('#err_msg').text(result.responseText);
  }

});

function isValid(query) {
  var userID = parseInt(query);
  return query.length === 8 && !!userID && 0 < userID &&  userID < 99999999;
}
