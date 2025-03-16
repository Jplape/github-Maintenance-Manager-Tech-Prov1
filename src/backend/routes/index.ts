import { Router } from 'express';
import interventionRoutes from './interventionRoutes.js';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Mount intervention routes
router.use('/interventions', interventionRoutes);

export default router;