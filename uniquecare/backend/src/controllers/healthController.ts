/**
 * Health Controller
 * Provides health check endpoint for monitoring backend status
 */

export const getHealthStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Ucare backend is running'
  });
};
