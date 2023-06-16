const http = require('http');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const movies = require('./movies.json');

const server = http.createServer((req, res) => {
  switch (req.method) {
    case 'GET':
      if (req.url === '/api/movies') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(movies));
      } else if (req.url.startsWith('/api/movies/')) {
        const movieId = req.url.split('/')[3];
        const movie = movies.find((movie) => movie.id === movieId);

        if (movie) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(movie));
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ title: 'Not found', message: 'Movie Not Found' }));
        }
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ title: 'Not found', message: 'Route Not Found' }));
      }
      break;

    case 'POST':
      if (req.url === '/api/movies') {
        let body = '';

        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', () => {
          const newMovie = JSON.parse(body);
          newMovie.id = uuidv4();

          movies.push(newMovie);

          // Save the updated movies array to movies.json
          fs.writeFile('./Methods/movies.json', JSON.stringify(movies), (err) => {
            if (err) {
              console.error(err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ title: 'Internal Server Error', message: 'Failed to save movie' }));
            } else {
              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(newMovie));
            }
          });
        });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ title: 'Not found', message: 'Route Not Found' }));
      }
      break;

      case 'PUT':
        if (req.url.startsWith('/api/movies/')) {
          const movieId = req.url.split('/')[3];
  
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
  
          req.on('end', () => {
            const updatedMovie = JSON.parse(body);
            const movieIndex = movies.findIndex((movie) => movie.id === movieId);
  
            if (movieIndex !== -1) {
              movies[movieIndex] = { ...movies[movieIndex], ...updatedMovie };
  
              // Save the updated movies array to movies.json
              fs.writeFile('./Methods/movies.json', JSON.stringify(movies), (err) => {
                if (err) {
                  console.error(err);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ title: 'Internal Server Error', message: 'Failed to update movie' }));
                } else {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(movies[movieIndex]));
                }
              });
            } else {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ title: 'Not found', message: 'Movie Not Found' }));
            }
          });
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ title: 'Not found', message: 'Route Not Found' }));
        }
        break;

    case 'DELETE':
      if (req.url.startsWith('/api/movies/')) {
        const movieId = req.url.split('/')[3];

        const movieIndex = movies.findIndex((movie) => movie.id === movieId);

        if (movieIndex !== -1) {
          const deletedMovie = movies.splice(movieIndex, 1);

          // Save the updated movies array to movies.json
          fs.writeFile('./Methods/movies.json', JSON.stringify(movies), (err) => {
            if (err) {
              console.error(err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ title: 'Internal Server Error', message: 'Failed to delete movie' }));
            } else {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(deletedMovie));
            }
          });
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ title: 'Not found', message: 'Movie Not Found' }));
        }
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ title: 'Not found', message: 'Route Not Found' }));
      }
      break;

    default:
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ title: 'Not found', message: 'Route Not Found' }));
      break;
  }
});

const PORT = process.env.PORT || 9000;

server.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});
