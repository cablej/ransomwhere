let user;

getUser = () => {
  apiRequest('GET', 'users/me', undefined, undefined, {
    withCredentials: true
  })
    .then(res => {
      user = res;
      $('#userName').text(user.name);
      $('#apiKey').text(user.apiKey);
    })
    .catch(err => console.log(err));
};

(function($) {
  getUser();
})(jQuery);
