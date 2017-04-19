# coding: utf-8
from __future__ import unicode_literals

from django.core.management.base import BaseCommand

from ...command_utils import tqdm
from ...models import Movie
from ...utils import load_omdb_movie_data

class Command(BaseCommand):
    help = 'Outputs average movie title length'

    def handle(self, *args, **options):
        titles = Movie.objects.values_list('title', flat=True)
        result = sum([len(t) for t in titles]) / len(titles)
        for z in titles:
            print len(z), z
        self.stdout.write(str(result))
