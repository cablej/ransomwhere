/*
	Phantom by Pixelarity
	pixelarity.com | hello@pixelarity.com
	License: pixelarity.com/license
*/

apiRequest = (method, endpoint, body, headers = {}) => {
  return $.ajax({
    type: method,
    data: JSON.stringify(body),
    url: API_URL + endpoint,
    contentType: 'application/json',
    dataType: 'json',
    headers
  });
};

getReports = (state = 'new', admin = false) => {
  apiRequest('GET', `reports?state=${state}`)
    .then(res => {
      let reports = res.result;
      if (table) table.destroy();
      columns = [
        {
          title: 'Created',
          data: 'createdAt',
          type: 'datetime',
          displayFormat: 'M/D/YYYY',
          wireFormat: 'YYYY-MM-DD'
        },
        {
          title: 'Family',
          data: 'family',
          render: $.fn.dataTable.render.text()
        },
        {
          title: 'Addresses',
          data: report => {
            return report.addresses.length > 2
              ? report.addresses.splice(0, 2).join(', ') + '…'
              : report.addresses.join(', ');
          },
          render: $.fn.dataTable.render.text()
        },
        {
          title: 'Source',
          data: 'source',
          render: $.fn.dataTable.render.text()
        }
      ];
      if (admin) {
        columns.unshift({
          title: 'Action',
          data: report =>
            `<a onclick="updateReport('${
              report._id
            }', 'accepted')" class="button primary small">Approve</a> <a onclick="updateReport('${
              report._id
            }', 'rejected')" class="button small">Deny</a>`
        });
      }
      table = $('#reports').DataTable({
        data: reports,
        rowId: '_id',
        columns,
        lengthChange: admin,
        bFilter: true,
        pageLength: admin ? 10 : 5,
        order: [[0, 'desc']]
      });
    })
    .catch(err => console.log(err));
};

(function($) {
  $.fn.dataTable.ext.errMode = 'none';
  var $window = $(window),
    $body = $('body');

  // Breakpoints.
  breakpoints({
    xlarge: ['1281px', '1680px'],
    large: ['981px', '1280px'],
    medium: ['737px', '980px'],
    small: ['481px', '736px'],
    xsmall: ['361px', '480px'],
    xxsmall: [null, '360px']
  });

  // Play initial animations on page load.
  $window.on('load', function() {
    window.setTimeout(function() {
      $body.removeClass('is-preload');
    }, 100);
  });

  // Touch?
  if (browser.mobile) $body.addClass('is-touch');

  // Forms.
  var $form = $('form');

  // Auto-resizing textareas.
  $form.find('textarea').each(function() {
    var $this = $(this),
      $wrapper = $('<div class="textarea-wrapper"></div>'),
      $submits = $this.find('input[type="submit"]');

    $this
      .wrap($wrapper)
      .attr('rows', 1)
      .css('overflow', 'hidden')
      .css('resize', 'none')
      .on('keydown', function(event) {
        if (event.keyCode == 13 && event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();

          $(this).blur();
        }
      })
      .on('blur focus', function() {
        $this.val($.trim($this.val()));
      })
      .on('input blur focus --init', function() {
        $wrapper.css('height', $this.height());

        $this
          .css('height', 'auto')
          .css('height', $this.prop('scrollHeight') + 'px');
      })
      .on('keyup', function(event) {
        if (event.keyCode == 9) $this.select();
      })
      .triggerHandler('--init');

    // Fix.
    if (browser.name == 'ie' || browser.mobile)
      $this.css('max-height', '10em').css('overflow-y', 'auto');
  });

  // Menu.
  var $menu = $('#menu');

  $menu.wrapInner('<div class="inner"></div>');

  $menu._locked = false;

  $menu._lock = function() {
    if ($menu._locked) return false;

    $menu._locked = true;

    window.setTimeout(function() {
      $menu._locked = false;
    }, 350);

    return true;
  };

  $menu._show = function() {
    if ($menu._lock()) $body.addClass('is-menu-visible');
  };

  $menu._hide = function() {
    if ($menu._lock()) $body.removeClass('is-menu-visible');
  };

  $menu._toggle = function() {
    if ($menu._lock()) $body.toggleClass('is-menu-visible');
  };

  $menu
    .appendTo($body)
    .on('click', function(event) {
      event.stopPropagation();
    })
    .on('click', 'a', function(event) {
      var href = $(this).attr('href');

      event.preventDefault();
      event.stopPropagation();

      // Hide.
      $menu._hide();

      // Redirect.
      if (href == '#menu') return;

      window.setTimeout(function() {
        window.location.href = href;
      }, 350);
    })
    .append('<a class="close" href="#menu">Close</a>');

  $body
    .on('click', 'a[href="#menu"]', function(event) {
      event.stopPropagation();
      event.preventDefault();

      // Toggle.
      $menu._toggle();
    })
    .on('click', function(event) {
      // Hide.
      $menu._hide();
    })
    .on('keydown', function(event) {
      // Hide on escape.
      if (event.keyCode == 27) $menu._hide();
    });
})(jQuery);
