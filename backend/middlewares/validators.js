const { check, validationResult } = require('express-validator');
const registerValidators = [
  check('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  check('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];


const loginValidators = [
  check('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  check('password')
    .exists().withMessage('Password is required'),
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return a compact array of errors
    return res.status(400).json({
      errors: errors.array().map(err => ({ param: err.param, msg: err.msg }))
    });
  }
  next();
};

module.exports = {
  register: [...registerValidators, handleValidation],
  login: [...loginValidators, handleValidation],
  registerValidators,
  loginValidators,
  handleValidation,
};