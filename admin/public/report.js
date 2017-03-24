$(document).ready(function() {

  $('#download').click(function(event) {

    $.ajax({
      type: 'post',
      url: '/api/report',
      success: success,
      error: error,
    });
  });

});

function success(result) {

  var csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'StudentID, FirstName, Surname, Calendar Year, Position Type, Host Organisation, Start Date, End Date, Hours\n';

  result.data.forEach(function(row) {
    var line = [row.userID, row.firstName, row.lastName, '2017', 'Tutor', 'VTE', row.start.substring(0, 10), row.end.substring(0, 10), row.hours];
    csvContent += line.join(',') + '\n';
  });

  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);

}

function error() {
  console.log('Error generating report');
}
