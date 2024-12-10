const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const PORT = 5510;

// Configuración de conexión a la base de datos PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'likeme',
  password: '12345678',
  port: 5432, // Puerto por defecto de PostgreSQL
  allowExitOnIdle: true
});

// Middleware
app.use(express.json());
app.use(cors());



// Ruta GET para obtener todos los posts
app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    res.status(500).send('Error al obtener los posts.');
  }
});

// Ruta POST para guardar un nuevo post
app.post('/posts', async (req, res) => {
  const { titulo, img, descripcion } = req.body;
  if (!titulo || !img || !descripcion) {
    return res.status(400).send('Todos los campos son obligatorios.');
  }

  try {
    await pool.query(
      'INSERT INTO posts (titulo, img, descripcion,likes) VALUES ($1, $2, $3,0)',
      [titulo, img, descripcion]
    );
    res.status(201).send('Post creado exitosamente.');
  } catch (error) {
    console.error('Error al guardar el post:', error);
    res.status(500).send('Error al guardar el post.');
  }
});

//Ruta DELETE para eliminar un post por id
app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Post no encontrado.');
    }
    res.send('Post eliminado exitosamente.');
  } catch (error) {
    console.error('Error al eliminar el post:', error);
    res.status(500).send('Error al eliminar el post.');
  }
});

// Ruta PUT para actualizar los likes de un post
app.put('/posts/like/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).send('Post no encontrado.');
    }
    res.json(result.rows[0]); // Devuelve el post actualizado
  } catch (error) {
    console.error('Error al actualizar los likes:', error);
    res.status(500).send('Error al actualizar los likes.');
  }
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

