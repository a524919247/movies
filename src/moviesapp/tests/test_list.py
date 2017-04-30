# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from django.core.urlresolvers import reverse

from .base import BaseTestLoginCase


class AddMoviesTestCase(BaseTestLoginCase):
    """
    Dumpdata commands:
    manage dumpdata moviesapp.Movie --indent 4 > moviesapp/fixtures/movies.json
    manage dumpdata moviesapp.Record --indent 4 > moviesapp/fixtures/records.json
    manage dumpdata moviesapp.ActionRecord --indent 4 > moviesapp/fixtures/action_records.json

    User actions in fixtures:
    neo:
        - Added "The Matrix" to his "Watched" list
        - Added "Dogma" to his "Watched" list
        - Added "Pulp Fiction" to his "To watch" list
    fox:
        - Added "Avengers" to his "Watched" list

    """
    fixtures = [
        'users.json',
        'lists.json',
        'actions.json',
        'movies.json',
        'records.json',
        'action_records.json',
    ]

    def test_list_watched(self):
        url = reverse('list', args=('watched',))
        response = self.client.get(url)
        soup = self.get_soup(response)
        titles = soup.findAll('div', {'class': 'title'})
        titles = [t.span.attrs['title'] for t in titles]
        self.assertListEqual(titles, ['Dogma', 'The Matrix'])
        counters = soup.find('div', id='movie-count').findAll('span')
        conter_watched = counters[0].get_text()
        conter_to_watch = counters[1].get_text()
        self.assertEqual(conter_watched, '2')
        self.assertEqual(conter_to_watch, '1')

    def test_list_search(self):
        url = reverse('list', args=('watched',))
        response = self.client.get(url, {'query': 'Matrix'})
        soup = self.get_soup(response)
        titles = soup.findAll('div', {'class': 'title'})
        self.assertEqual(len(titles), 1)
        title = titles[0].span.attrs['title']
        self.assertEqual(title, 'The Matrix')