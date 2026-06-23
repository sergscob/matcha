import {
  registerSchema,
  loginSchema
} from "./auth.validation.js";

import {
  register,
  login
} from "./auth.service.js";

export async function registerController(
  req,
  res
) {
  try {
    const data =
      registerSchema.parse(req.body);

    const user =
      await register(data);

    res.status(201).json({
      id: user.id
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
}

export async function loginController(
  req,
  res
) {
  try {
    const data =
      loginSchema.parse(req.body);

    const result =
      await login(
        data.username,
        data.password
      );

    res.json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
}