const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.get('/', async (req, res) => {
    try {
        const trendingRes = await axios.get(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
        const movies = trendingRes.data.results;

        const featuredMovie = movies[0];
        const trendingMovies = movies.slice(1, 7);

        res.render('index', {
            title: 'Cinevo - Discover Movies',
            featuredMovie: {
                id: featuredMovie.id,
                title: featuredMovie.title,
                genre: [featuredMovie.genre_ids[0]],
                description: featuredMovie.overview,
                image: `https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`
            },
            trendingMovies: trendingMovies.map(m => ({
                id: m.id,
                title: m.title,
                year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
                rating: m.vote_average.toFixed(1),
                image: `https://image.tmdb.org/t/p/w500${m.poster_path}`
            }))
        });
    } catch (error) {
        console.error('Error fetching data from TMDB:', error.message);
        res.status(500).send('Error loading movie data. Please check if the API key is valid in .env');
    }
});

app.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const searchRes = await axios.get(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
        const movies = searchRes.data.results;

        res.render('search', {
            title: `Search results for "${query}"`,
            query: query,
            movies: movies.map(m => ({
                id: m.id,
                title: m.title,
                year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
                rating: m.vote_average.toFixed(1),
                image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'
            }))
        });
    } catch (error) {
        console.error('Error searching movies:', error.message);
        res.status(500).send('Error during search');
    }
});

app.get('/movie/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const movieRes = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
        const movie = movieRes.data;

        res.render('movie', {
            title: `${movie.title} - Watch on Cinevo`,
            movie: {
                id: movie.id,
                title: movie.title,
                overview: movie.overview,
                backdrop: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
                poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                rating: movie.vote_average.toFixed(1),
                releaseDate: movie.release_date
            }
        });
    } catch (error) {
        console.error('Error fetching movie details:', error.message);
        res.status(404).send('Movie not found');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
