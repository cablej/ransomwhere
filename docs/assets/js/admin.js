var ransomTotal = 2.51;
var dollarDisplay = true;

var API_URL = 'http://localhost:3000/dev/';

// var API_URL = "https://api.ransomwhe.re/";

apiRequest = (method, endpoint, body) => {
  return $.ajax({
    type: method,
    data: JSON.stringify(body),
    url: API_URL + endpoint,
    contentType: 'application/json',
    dataType: 'json'
  });
};

getReports = () => {
  apiRequest('GET', 'reports?approved=true')
    .then(res => {
      let reports = res.result;
      console.log(reports);
      // reports = reports.map(report => [
      //   report.id,
      //   report.variant,
      //   report.approved,
      //   report.amount,
      //   report.addresses.join(', ')
      // ]);
      $('#reports').DataTable({
        data: reports,
        columns: [
          { title: 'id', data: '_id' },
          { title: 'variant', data: 'variant' },
          { title: 'approved', data: 'approved' },
          { title: 'amount', data: 'amount' },
          { title: 'addresses', data: col => col.addresses.join(', ') }
        ]
      });
    })
    .catch(err => console.log(err));
};

(function($) {
  getReports();
})(jQuery);
