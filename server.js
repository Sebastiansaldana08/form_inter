const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'estudiantesdb',
    password: 'Sebas1011',
    port: 5432,
  });

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'oamra.matriculatramites@oficinas-upch.pe',
        pass: '',
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Función para generar un ID de 5 números aleatorios
function generateRandomId() {
    return Math.floor(10000 + Math.random() * 90000);
}

// Ruta para manejar el formulario interno con archivos adjuntos
app.post('/formulario-interno', upload.fields([{ name: 'adjunto1', maxCount: 1 }, { name: 'adjunto2', maxCount: 1 }, { name: 'adjunto3', maxCount: 1 }]), async (req, res) => {
    const { email, correo_personal, unidad_atencion, documento, nombres, apellidos, celular, formacion, carrera, asunto, descripcion, operador } = req.body;
    const id = generateRandomId();
    const estadoInicial = 'ASIGNADO';
    const historial = JSON.stringify([{ estado: estadoInicial, fecha: new Date().toISOString() }]);

    const adjuntos = [];
    ['adjunto1', 'adjunto2', 'adjunto3'].forEach((key) => {
        if (req.files[key]) {
            const file = req.files[key][0];
            const filePath = path.join(__dirname, 'uploads', file.filename);
            adjuntos.push({ path: filePath });
        }
    });

    try {
        console.log('Datos recibidos:', req.body);

        // Insertar datos en la base de datos
        const result = await pool.query(
            'INSERT INTO estudiantes (id, email, correo_personal, unidad_atencion, documento, nombres, apellidos, celular, formacion, carrera, asunto, descripcion, operador, estado, historial) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
            [id, email, correo_personal, unidad_atencion, documento, nombres, apellidos, celular, formacion, carrera, asunto, descripcion, operador, estadoInicial, historial]
        );

        console.log('Datos insertados en la base de datos con ID:', id);

        // Enviar correo
        const unidadEmail = {
            'Oficina Universitaria de Bienestar Estudiantil': 'ivan.urquiaga.huaman@upch.pe',
            'Oficina Universitaria de Becas': 'ob@oficinas-upch.pe',
            'Dirección Administrativa de Economía y Finanzas (DAEF)': 'daef.pensiones@oficinas-upch.pe',
            'Dirección de Tecnología de Información (DTI)': 'outi@oficinas-upch.pe'
        }[unidad_atencion];

        const mailOptions = {
            from: 'matricula.pregrado@oficinas-upch.pe',
            to: `${unidadEmail}, ${email}, ${correo_personal}`,
            subject: `${asunto} - ID Caso: ${id}`,
            text: `ID del Caso: ${id}\n\n${descripcion}`,
            attachments: adjuntos.length > 0 ? adjuntos : []
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Correo enviado');
            res.status(200).send('Formulario enviado y datos registrados correctamente.');
        } catch (mailError) {
            console.error('Error al enviar el correo:', mailError);
            res.status(500).send(`Error al enviar el correo: ${mailError.message}`);
        }
    } catch (dbError) {
        console.error('Error al procesar el formulario:', dbError);
        res.status(500).send(`Error al procesar el formulario: ${dbError.message}`);
    }
});

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir la página de confirmación
app.get('/confirmacion.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'confirmacion.html'));
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

