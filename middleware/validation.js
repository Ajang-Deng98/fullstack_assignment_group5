const Joi = require('joi');

class ValidationMiddleware {
  static validateSong(req, res, next) {
    const schema = Joi.object({
      title: Joi.string().required().trim().min(1).max(200),
      artist: Joi.string().required().trim().min(1).max(100),
      album: Joi.string().optional().trim().max(100),
      duration: Joi.number().min(1).max(7200), // Max 2 hours
      genre: Joi.string().optional().trim().max(50)
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    next();
  }

  static validatePlaylist(req, res, next) {
    const schema = Joi.object({
      name: Joi.string().required().trim().min(1).max(100),
      description: Joi.string().optional().trim().max(500),
      userId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
      isPublic: Joi.boolean().optional(),
      playlistType: Joi.string().valid('regular', 'smart').optional(),
      criteria: Joi.object().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    next();
  }

  static validateUser(req, res, next) {
    const schema = Joi.object({
      username: Joi.string().required().trim().min(3).max(30).alphanum(),
      email: Joi.string().required().email().trim().lowercase()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    next();
  }

  static validateObjectId(req, res, next) {
    const id = req.params.id || req.params.userId || req.params.playlistId || req.params.songId;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    next();
  }
}

module.exports = ValidationMiddleware;