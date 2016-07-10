app.factory('SavePreferences', ['$resource', function($resource) {
  return $resource(urlSavePreferences, {}, {
    post: {method: 'POST', headers: headers}
  });
}]);

app.controller('PreferencesController', ['$scope', 'SavePreferences',
function ($scope, SavePreferences) {
  $scope.savePreferences = function(){
    var preferences = {lang: $('input:radio[name=lang]:checked').val()};
    if (typeof vk !== undefined) {
      preferences.only_for_friends = $('input[name=only_for_friends]:checked').val();
    }
    SavePreferences.post($.param(preferences), function(){}, function(){
      displayMessage('Ошибка сохранения настроек');
    });
  }
}]);