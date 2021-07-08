var ransomTotal = 2.51;
var dollarDisplay = true;

var API_URL = 'http://localhost:3000/dev/';

// var API_URL = "https://api.ransomwhe.re/";

let table;

updateReport = (id, state) => {
  apiRequest('POST', 'reports/' + id, { state })
    .then(res => {
      table
        .row('#' + id)
        .remove()
        .draw();
    })
    .catch(err => console.log(err));
};

(function($) {
  $('#state-select')
    .change(function() {
      getReports($('#state-select').val(), true);
    })
    .change();
})(jQuery);
