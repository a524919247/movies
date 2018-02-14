/* global autosize:false */
/* global ratySettings:false */
/* global setViewedIconAndRemoveButtons:false */
/* global ratyCustomSettings:false */

'use strict';

(function() {
  angular.module('app').factory('movieService', factory);
  factory.$inject = ['$resource'];

  function factory($resource) {
    return $resource(urls.urlRemoveMovie + ':id/', {
      id: '@id',
    }, {
      delete: {
        method: 'DELETE',
      },
    });
  }
})();

(function() {
  angular.module('app').factory('movieDataservice', factory);
  factory.$inject = ['movieService', 'growl'];

  function factory(movieService, growl) {
    return {
      delete: deleteMovie,
    };

    function deleteMovie(id) {
      return movieService.delete({
        id: id,
      }, success, fail);

      function removeMovieFromPage(id) {
        function checkIfNoRecords() {
          if (!angular.element('.movie').length) {
            angular.element('#results')[0].innerHTML = gettext('The list is empty') + '.';
          }
        }
        angular.element('#record' + id).fadeOut('fast', function(el) {
          console.log(el);
          angular.element(this).remove(); // eslint-disable-line no-invalid-this
          checkIfNoRecords();
        });
      }

      function success(response) {
        if (response.status === 'success') {
          removeMovieFromPage(id);
        } else {
          fail();
        }
      }

      function fail() {
        growl.error(gettext('Error removing the movie'));
      }
    }
  }
})();


(function() {
  angular.module('app').factory('movieCommentService', ['$resource', function($resource) {
    return $resource(urls.urlSaveComment, {}, {
      save: {
        method: 'POST',
      },
    });
  }]);
})();

(function() {
  angular.module('app').factory('movieCommentDataservice', factory);
  factory.$inject = ['movieCommentService', 'growl'];

  function factory(movieCommentService, growl) {
    return {
      save: save,
    };

    function save(data) {
      return movieCommentService.save(angular.element.param(data), success, fail);

      function success(response) {
        if (response.status !== 'success') {
          fail();
        }
      }

      function fail() {
        growl.error(gettext('Error saving a comment'));
      }
    }
  }
})();

(function() {
  angular.module('app').controller('ListController', ListController);
  ListController.$inject = ['movieDataservice', 'movieCommentDataservice', 'isVkApp'];

  function ListController(movieDataservice, movieCommentDataservice, isVkApp) {
    const vm = this;
    vm.openUrl = openUrl;
    vm.removeMovie = removeMovie;
    vm.switchMode = switchMode;
    vm.saveComment = saveComment;
    vm.toggleCommentArea = toggleCommentArea;
    vm.mode = vars.mode;
    vm.isVkApp = isVkApp;

    function openUrl(url) {
      window.location.href = url;
    }

    function removeMovie(id) {
      movieDataservice.delete(id);
    }

    function switchMode(newMode) {
      function deactivateModeMinimal() {
        $('.poster, .comment, .release-date-label, .wall-post').show();
        $('.comment-button').hide();
        $('.details, .imdb-rating, .review, .release-date').css('display', '');
        $('.review').css('padding-top', '10px');
        $('.release-date, .imdb-rating').css({
          'float': '',
          'margin-right': '0',
        });
        $('.movie').removeClass('movie-minimal');
      }
      if (newMode === 'minimal') {
        activateModeMinimal();
      } else {
        deactivateModeMinimal();
      }
      applySettings({
        mode: newMode,
      }, false);
      vm.mode = newMode;
    }

    function saveComment(id) {
      const comment = angular.element('#comment' + id)[0].value;
      movieCommentDataservice.save({
        id: id,
        comment: comment,
      }).$promise.then(
        function() {
          if (!comment) {
            vm.toggleCommentArea(id);
          }
        }
      ).catch(function() {});
    }

    function toggleCommentArea(id) {
      $('#comment-area' + id).toggle();
      $('#comment-area-button' + id).toggle();
      $('#comment' + id).focus();
    }
  }
})();

function changeRating(id, rating, element) {
  function error() {
    function revertToPreviousRating(element) {
      const scoreSettings = {
        score: element.data('rating'),
      };
      const settings = $.extend({}, ratySettings, ratyCustomSettings, scoreSettings);
      element.raty(settings);
    }
    revertToPreviousRating(element);
    displayMessage(gettext('Error adding a rating'));
  }

  $.post(urls.urlChangeRating, {
    id: id,
    rating: rating,
  }, function(response) {
    if (response.status === 'success') {
      element.data('rating', rating);
    } else {
      error();
    }
  }).fail(function() {
    error();
  });
}

function switchSort(value) { // eslint-disable-line no-unused-vars
  let additionalSetting;
  if (value !== 'rating') {
    additionalSetting = {
      recommendation: false,
    };
  } else {
    additionalSetting = {};
  }
  const settings = jQuery.extend({
    sort: value,
  }, additionalSetting);
  applySettings(settings);
}

function applySettings(settings, reload) {
  function error() {
    displayMessage(gettext('Error applying the settings'));
  }
  if (reload == null) {
    reload = true;
  }
  $.post(urls.urlApplySettings, {
    settings: JSON.stringify(settings),
  }, function(response) {
    if (response.status == 'success') {
      if (reload) {
        location.reload();
      }
    } else {
      error();
    }
  }).fail(function() {
    error();
  });
}

function activateModeMinimal() {
  angular.element('.poster, .comment, .comment-button, .release-date-label, .wall-post').hide();
  angular.element('.details, .review').css('display', 'inline');
  angular.element('.review').css('padding-top', '0');
  angular.element('.release-date, .imdb-rating').css({
    'float': 'right',
    'margin-right': '10px',
  });
  angular.element('.movie').addClass('movie-minimal');
}

function toggleRecommendation() { // eslint-disable-line no-unused-vars
  if (vars.recommendation) {
    applySettings({
      recommendation: false,
    });
  } else {
    applySettings({
      sort: 'rating',
      recommendation: true,
    });
  }
}

let ratyCustomSettings;

(function() {
  function setViewedIconsAndRemoveButtons() {
    if (vars.anothersAccount) {
      angular.forEach(angular.element('.movie'),
        function(movie){
          const id = angular.element(movie).data('id')
          const listId = vars.listData[id]; // eslint-disable-line no-invalid-this
          setViewedIconAndRemoveButtons(id, listId);
        }
      );
    }
  }

  ratyCustomSettings = {
    readOnly: ratyReadonly = vars.anothersAccount || vars.listId == 2;,
    click: function(score) {
      if (!score) {
        score = 0;
      }
      changeRating(angular.element(this).data('record-id'), score, angular.element(this));
    },
  };

  if (vars.mode === 'minimal') {
    activateModeMinimal();
  }

  if (vars.recommendation) {
    angular.element('#button-recommendation').button('toggle');
  }
  setViewedIconsAndRemoveButtons();
  autosize(angular.element('textarea'));
  retinajs();
})();
