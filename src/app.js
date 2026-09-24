import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import { makeResourceRouter } from './routes/resourceRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'EventForge API' }));
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

app.use('/api/users', makeResourceRouter('users'));
app.use('/api/organizations', makeResourceRouter('organizations'));
app.use('/api/venues', makeResourceRouter('venues'));
app.use('/api/speakers', makeResourceRouter('speakers'));
app.use('/api/sponsors', makeResourceRouter('sponsors'));
app.use('/api/packages', makeResourceRouter('packages'));
app.use('/api/deliverables', makeResourceRouter('deliverables'));
app.use('/api/coupons', makeResourceRouter('coupons'));
app.use('/api/announcements', makeResourceRouter('announcements'));
app.use('/api/attendance', makeResourceRouter('attendance'));
app.use('/api/feedback', makeResourceRouter('feedback'));

app.use(notFound);
app.use(errorHandler);

export default app;
